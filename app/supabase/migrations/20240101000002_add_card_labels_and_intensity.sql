-- ============================================================================
-- CARD LABELS AND INTENSITY MIGRATION
-- Adds intensity rating (0-5) and many-to-many label relationships to cards
-- ============================================================================

-- ============================================================================
-- STEP 1: Add intensity column to cards table
-- ============================================================================
ALTER TABLE cards
ADD COLUMN IF NOT EXISTS intensity INTEGER NOT NULL DEFAULT 2 CHECK (intensity >= 0 AND intensity <= 5);

-- Add comment for documentation
COMMENT ON COLUMN cards.intensity IS 'Intensity rating from 0 (very mild) to 5 (very intense)';

-- ============================================================================
-- STEP 2: Create labels table
-- ============================================================================
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT, -- Optional description of what this label means
  color TEXT, -- Optional: hex color for UI display (e.g., '#FF5733')
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for label name lookups
CREATE INDEX IF NOT EXISTS idx_labels_name ON labels(name);

-- Add comment for documentation
COMMENT ON TABLE labels IS 'Available labels/tags that can be assigned to cards';
COMMENT ON COLUMN labels.name IS 'Unique label name (e.g., "playful", "teasing", "romantic")';
COMMENT ON COLUMN labels.color IS 'Optional hex color code for UI theming';

-- ============================================================================
-- STEP 3: Create card_labels junction table (many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS card_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(card_id, label_id) -- Prevent duplicate label assignments
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_card_labels_card_id ON card_labels(card_id);
CREATE INDEX IF NOT EXISTS idx_card_labels_label_id ON card_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_card_labels_card_label ON card_labels(card_id, label_id);

-- Add comment for documentation
COMMENT ON TABLE card_labels IS 'Many-to-many relationship between cards and labels';
COMMENT ON COLUMN card_labels.card_id IS 'Reference to card';
COMMENT ON COLUMN card_labels.label_id IS 'Reference to label';

-- ============================================================================
-- STEP 4: Enable RLS on new tables
-- ============================================================================
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_labels ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: RLS Policies for labels table
-- ============================================================================

-- All authenticated users can read labels (they're public metadata)
CREATE POLICY "Authenticated users can view labels"
  ON labels FOR SELECT
  TO authenticated
  USING (true);

-- Labels are read-only for regular users (managed by admins)
-- INSERT, UPDATE, DELETE operations are denied by default
-- To add admin management later, create policies like:
-- CREATE POLICY "Admins can manage labels" ON labels FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- STEP 6: RLS Policies for card_labels table
-- ============================================================================

-- All authenticated users can read card-label relationships
CREATE POLICY "Authenticated users can view card labels"
  ON card_labels FOR SELECT
  TO authenticated
  USING (true);

-- Card-label relationships are read-only for regular users (managed by admins)
-- INSERT, UPDATE, DELETE operations are denied by default

-- ============================================================================
-- STEP 7: Update swipe_events metadata structure
-- Add helper function to include card context in event metadata
-- ============================================================================

-- Function to get card context for event metadata
CREATE OR REPLACE FUNCTION get_card_context_for_event(card_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  card_intensity INTEGER;
  card_labels JSONB;
BEGIN
  -- Get card intensity
  SELECT intensity INTO card_intensity
  FROM cards
  WHERE id = card_uuid;
  
  -- Get card labels as JSON array
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id', l.id,
        'name', l.name
      )
    ),
    '[]'::json
  ) INTO card_labels
  FROM card_labels cl
  INNER JOIN labels l ON l.id = cl.label_id
  WHERE cl.card_id = card_uuid;
  
  -- Return combined context
  RETURN json_build_object(
    'card_intensity', card_intensity,
    'card_labels', card_labels
  );
END;
$$;

-- ============================================================================
-- STEP 8: Enhanced trigger to include card context in swipe events
-- ============================================================================

-- Update the existing swipe event creation function to include card context
CREATE OR REPLACE FUNCTION create_swipe_event_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  event_id UUID;
  card_context JSONB;
BEGIN
  -- Get card context (intensity and labels)
  card_context := get_card_context_for_event(NEW.card_id);
  
  -- Merge card context into metadata if metadata exists, otherwise create new
  IF NEW.metadata IS NULL THEN
    NEW.metadata := card_context;
  ELSE
    NEW.metadata := NEW.metadata || card_context;
  END IF;
  
  INSERT INTO swipe_events (
    user_id,
    card_id,
    event_type,
    response,
    previous_response,
    metadata
  )
  VALUES (
    NEW.user_id,
    NEW.card_id,
    'swiped',
    NEW.response,
    NULL,
    NEW.metadata
  )
  RETURNING id INTO event_id;
  
  -- Link the swipe to the event
  NEW.last_event_id := event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the change event function as well
CREATE OR REPLACE FUNCTION create_swipe_event_on_update()
RETURNS TRIGGER AS $$
DECLARE
  event_id UUID;
  card_context JSONB;
BEGIN
  -- Only create event if response actually changed
  IF OLD.response != NEW.response THEN
    -- Get card context (intensity and labels)
    card_context := get_card_context_for_event(NEW.card_id);
    
    -- Merge card context into metadata if metadata exists
    IF NEW.metadata IS NULL THEN
      NEW.metadata := card_context;
    ELSE
      NEW.metadata := NEW.metadata || card_context;
    END IF;
    
    INSERT INTO swipe_events (
      user_id,
      card_id,
      event_type,
      response,
      previous_response,
      metadata
    )
    VALUES (
      NEW.user_id,
      NEW.card_id,
      'changed',
      NEW.response,
      OLD.response,
      NEW.metadata
    )
    RETURNING id INTO event_id;
    
    -- Update the swipe with new event ID
    NEW.last_event_id := event_id;
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 9: Helper function to get cards with labels
-- ============================================================================

-- Function to get cards with their labels populated
CREATE OR REPLACE FUNCTION get_cards_with_labels(
  active_only BOOLEAN DEFAULT true,
  limit_count INTEGER DEFAULT NULL,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  text TEXT,
  intensity INTEGER,
  category TEXT,
  display_order INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  labels JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.text,
    c.intensity,
    c.category,
    c.display_order,
    c.is_active,
    c.created_at,
    c.updated_at,
    COALESCE(
      json_agg(
        json_build_object(
          'id', l.id,
          'name', l.name,
          'description', l.description,
          'color', l.color,
          'created_at', l.created_at
        )
      ) FILTER (WHERE l.id IS NOT NULL),
      '[]'::json
    ) AS labels
  FROM cards c
  LEFT JOIN card_labels cl ON cl.card_id = c.id
  LEFT JOIN labels l ON l.id = cl.label_id
  WHERE (NOT active_only OR c.is_active = true)
  GROUP BY c.id, c.text, c.intensity, c.category, c.display_order, c.is_active, c.created_at, c.updated_at
  ORDER BY c.display_order NULLS LAST, c.created_at
  LIMIT COALESCE(limit_count, 1000)
  OFFSET offset_count;
END;
$$;

-- ============================================================================
-- STEP 10: Analytics helper functions
-- ============================================================================

-- Function: Get response rate by label
CREATE OR REPLACE FUNCTION get_response_rate_by_label(
  user_uuid UUID DEFAULT auth.uid(),
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  label_name TEXT,
  response TEXT,
  count BIGINT,
  percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own data';
  END IF;
  
  RETURN QUERY
  SELECT 
    l.name AS label_name,
    se.response,
    COUNT(*)::BIGINT AS count,
    ROUND(
      COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY l.name), 0),
      2
    ) AS percentage
  FROM swipe_events se
  INNER JOIN cards c ON c.id = se.card_id
  INNER JOIN card_labels cl ON cl.card_id = c.id
  INNER JOIN labels l ON l.id = cl.label_id
  WHERE se.user_id = user_uuid
    AND se.event_type = 'swiped'
    AND (start_date IS NULL OR se.created_at >= start_date)
    AND (end_date IS NULL OR se.created_at <= end_date)
  GROUP BY l.name, se.response
  ORDER BY l.name, se.response;
END;
$$;

-- Function: Get response rate by intensity
CREATE OR REPLACE FUNCTION get_response_rate_by_intensity(
  user_uuid UUID DEFAULT auth.uid(),
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  intensity INTEGER,
  response TEXT,
  count BIGINT,
  percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own data';
  END IF;
  
  RETURN QUERY
  SELECT 
    c.intensity,
    se.response,
    COUNT(*)::BIGINT AS count,
    ROUND(
      COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY c.intensity), 0),
      2
    ) AS percentage
  FROM swipe_events se
  INNER JOIN cards c ON c.id = se.card_id
  WHERE se.user_id = user_uuid
    AND se.event_type = 'swiped'
    AND (start_date IS NULL OR se.created_at >= start_date)
    AND (end_date IS NULL OR se.created_at <= end_date)
  GROUP BY c.intensity, se.response
  ORDER BY c.intensity, se.response;
END;
$$;

-- ============================================================================
-- STEP 11: Seed some common labels (optional - can be done via admin UI)
-- ============================================================================

-- Insert common labels if they don't exist
INSERT INTO labels (name, description, color) VALUES
  ('playful', 'Playful and fun interactions', '#FFD700'),
  ('teasing', 'Teasing and flirtatious', '#FF6B6B'),
  ('romantic', 'Romantic and intimate', '#FF69B4'),
  ('kink', 'Kink and fetish related', '#9B59B6'),
  ('toys', 'Involves toys or accessories', '#3498DB'),
  ('roleplay', 'Roleplay scenarios', '#E67E22'),
  ('bdsm', 'BDSM related activities', '#8B0000'),
  ('vanilla', 'Traditional and vanilla', '#87CEEB')
ON CONFLICT (name) DO NOTHING;

