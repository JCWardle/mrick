-- ============================================================================
-- CARD DESCRIPTION MIGRATION
-- Adds description column to cards table for brief explanations displayed in mobile dialogs
-- ============================================================================

-- ============================================================================
-- STEP 1: Add description column to cards table
-- ============================================================================
ALTER TABLE cards
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN cards.description IS 'Brief explanation of the card topic, 2 sentences max. Displayed in mobile dialog to help users understand what the card represents. Should use approachable, non-clinical language.';

-- ============================================================================
-- STEP 2: Update get_cards_with_labels function to include description
-- ============================================================================
-- Drop the function first since we're changing the return type
DROP FUNCTION IF EXISTS get_cards_with_labels(BOOLEAN, INTEGER, INTEGER);

-- Recreate the function with the new return type including description
CREATE FUNCTION get_cards_with_labels(
  active_only BOOLEAN DEFAULT true,
  limit_count INTEGER DEFAULT NULL,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  text TEXT,
  description TEXT,
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
    c.description,
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
  GROUP BY c.id, c.text, c.description, c.intensity, c.category, c.display_order, c.is_active, c.created_at, c.updated_at
  ORDER BY c.display_order NULLS LAST, c.created_at
  LIMIT COALESCE(limit_count, 1000)
  OFFSET offset_count;
END;
$$;

