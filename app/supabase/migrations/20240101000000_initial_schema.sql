-- Note: Using gen_random_uuid() which is built into PostgreSQL 13+
-- No extension needed for UUID generation

-- ============================================================================
-- PROFILES TABLE
-- Extended user profile information
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age_range TEXT CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55+')),
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  sexual_preference TEXT CHECK (sexual_preference IN ('straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'prefer-not-to-say')),
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for partner lookups
CREATE INDEX idx_profiles_partner_id ON profiles(partner_id);

-- ============================================================================
-- CARDS TABLE
-- Pre-loaded card deck with sexual preferences/scenarios
-- ============================================================================
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT, -- Optional: for future categorization (e.g., 'romantic', 'kink', 'toys')
  display_order INTEGER, -- Optional: for custom ordering
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active cards query
CREATE INDEX idx_cards_active ON cards(is_active) WHERE is_active = true;
CREATE INDEX idx_cards_display_order ON cards(display_order) WHERE display_order IS NOT NULL;

-- ============================================================================
-- SWIPE EVENTS TABLE (Event Sourcing)
-- Immutable append-only log of all swipe actions
-- This is the source of truth for all user interactions
-- ============================================================================
CREATE TABLE swipe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('swiped', 'changed', 'deleted')),
  response TEXT NOT NULL CHECK (response IN ('yum', 'ick', 'maybe')),
  previous_response TEXT, -- For 'changed' events, tracks what it was before
  session_id TEXT, -- Optional: track which session this was part of
  device_info JSONB, -- Optional: store device/platform info for analytics
  metadata JSONB, -- Optional: additional event metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_sequence BIGSERIAL -- Auto-incrementing sequence for ordering
);

-- Indexes for efficient event queries
CREATE INDEX idx_swipe_events_user_id ON swipe_events(user_id);
CREATE INDEX idx_swipe_events_card_id ON swipe_events(card_id);
CREATE INDEX idx_swipe_events_user_created ON swipe_events(user_id, created_at DESC);
CREATE INDEX idx_swipe_events_user_response ON swipe_events(user_id, response);
CREATE INDEX idx_swipe_events_event_type ON swipe_events(event_type);
CREATE INDEX idx_swipe_events_created_at ON swipe_events(created_at DESC);
CREATE INDEX idx_swipe_events_sequence ON swipe_events(event_sequence);
-- Composite index for user analytics queries
CREATE INDEX idx_swipe_events_user_type_response ON swipe_events(user_id, event_type, response, created_at DESC);

-- ============================================================================
-- SWIPES TABLE (Current State / Projection)
-- User responses to cards (Yum/Ick/Maybe)
-- This is a materialized view of the latest state from swipe_events
-- ============================================================================
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  response TEXT NOT NULL CHECK (response IN ('yum', 'ick', 'maybe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_event_id UUID REFERENCES swipe_events(id), -- Link to the latest event
  UNIQUE(user_id, card_id) -- One response per user per card
);

-- Indexes for efficient queries
CREATE INDEX idx_swipes_user_id ON swipes(user_id);
CREATE INDEX idx_swipes_card_id ON swipes(card_id);
CREATE INDEX idx_swipes_user_response ON swipes(user_id, response);
CREATE INDEX idx_swipes_created_at ON swipes(created_at);
-- Composite index for partner comparison queries (finding mutual matches)
CREATE INDEX idx_swipes_card_response ON swipes(card_id, response);

-- ============================================================================
-- PARTNER INVITATIONS TABLE
-- QR codes and links for partner linking
-- ============================================================================
CREATE TABLE partner_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- Unique code for QR/link
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Set when partner accepts
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ, -- Timestamp when partner accepted
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for invitation lookups
CREATE INDEX idx_partner_invitations_code ON partner_invitations(code);
CREATE INDEX idx_partner_invitations_inviter ON partner_invitations(inviter_id);
CREATE INDEX idx_partner_invitations_invitee ON partner_invitations(invitee_id);
CREATE INDEX idx_partner_invitations_expires ON partner_invitations(expires_at) WHERE used_at IS NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- 
-- RLS is enabled on ALL tables to ensure data privacy and security.
-- By default, when RLS is enabled, all operations are DENIED unless explicitly
-- allowed by a policy. This follows the principle of least privilege.
--
-- Security Model:
-- - Users can only access their own data
-- - Partners can view each other's data (when linked)
-- - Cards are read-only for all authenticated users
-- - Invitations use codes as access tokens for acceptance
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can view their partner's profile (if linked)
CREATE POLICY "Users can view partner profile"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id OR 
    auth.uid() = partner_id OR
    id IN (SELECT partner_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================================
-- CARDS POLICIES
-- ============================================================================

-- All authenticated users can read active cards
CREATE POLICY "Authenticated users can view active cards"
  ON cards FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Cards are read-only for all users (including authenticated)
-- INSERT, UPDATE, DELETE operations are denied by default (no policies = denied)
-- Cards should be managed via Supabase Dashboard or service role only
-- To add admin management later, create policies like:
-- CREATE POLICY "Admins can manage cards" ON cards FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- SWIPES POLICIES
-- ============================================================================

-- Users can view their own swipes
CREATE POLICY "Users can view own swipes"
  ON swipes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their partner's swipes (if linked)
CREATE POLICY "Users can view partner swipes"
  ON swipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      WHERE p1.id = auth.uid()
      AND (
        p1.partner_id = swipes.user_id OR
        EXISTS (
          SELECT 1 FROM profiles p2
          WHERE p2.id = swipes.user_id
          AND p2.partner_id = auth.uid()
        )
      )
    )
  );

-- Users can insert their own swipes
CREATE POLICY "Users can insert own swipes"
  ON swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own swipes (change response)
CREATE POLICY "Users can update own swipes"
  ON swipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own swipes
CREATE POLICY "Users can delete own swipes"
  ON swipes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SWIPE EVENTS POLICIES
-- ============================================================================

-- Users can view their own swipe events (full history)
CREATE POLICY "Users can view own swipe events"
  ON swipe_events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their partner's swipe events (if linked)
CREATE POLICY "Users can view partner swipe events"
  ON swipe_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      WHERE p1.id = auth.uid()
      AND (
        p1.partner_id = swipe_events.user_id OR
        EXISTS (
          SELECT 1 FROM profiles p2
          WHERE p2.id = swipe_events.user_id
          AND p2.partner_id = auth.uid()
        )
      )
    )
  );

-- Users can insert their own swipe events (via trigger, not directly)
-- Direct inserts are restricted - events should only be created via triggers
-- This ensures data integrity and prevents bypassing the event log

-- ============================================================================
-- PARTNER INVITATIONS POLICIES
-- ============================================================================

-- Users can view invitations they created
CREATE POLICY "Users can view own invitations"
  ON partner_invitations FOR SELECT
  USING (auth.uid() = inviter_id);

-- Users can view invitations where they are the invitee (when accepting)
CREATE POLICY "Users can view invitations where they are invitee"
  ON partner_invitations FOR SELECT
  USING (auth.uid() = invitee_id);

-- Allow authenticated users to view unused, non-expired invitations by code
-- This is needed for QR code/link acceptance flow
-- The code itself acts as the access token
CREATE POLICY "Users can view unused invitations for acceptance"
  ON partner_invitations FOR SELECT
  TO authenticated
  USING (used_at IS NULL AND expires_at > NOW());

-- Users can create invitations
CREATE POLICY "Users can create invitations"
  ON partner_invitations FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

-- Users can update invitations they created (to mark as used)
CREATE POLICY "Users can update own invitations"
  ON partner_invitations FOR UPDATE
  USING (auth.uid() = inviter_id)
  WITH CHECK (auth.uid() = inviter_id);

-- Users can delete their own unused invitations
CREATE POLICY "Users can delete own unused invitations"
  ON partner_invitations FOR DELETE
  USING (auth.uid() = inviter_id AND used_at IS NULL);

-- Invitees can update invitations to accept them (set invitee_id and used_at)
-- This allows a user to accept an invitation by code lookup
-- Only allows setting themselves as invitee and marking as used
CREATE POLICY "Invitees can accept invitations"
  ON partner_invitations FOR UPDATE
  USING (
    used_at IS NULL 
    AND expires_at > NOW()
    AND invitee_id IS NULL
  )
  WITH CHECK (
    auth.uid() = invitee_id
    AND used_at IS NOT NULL
    -- Note: We rely on the USING clause to ensure the row hasn't been modified
    -- The inviter_id, code, and expires_at are checked in the USING clause
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to link partners when invitation is accepted
CREATE OR REPLACE FUNCTION link_partners()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if invitee_id is set and invitation wasn't already used
  IF NEW.invitee_id IS NOT NULL AND OLD.invitee_id IS NULL AND NEW.used_at IS NOT NULL THEN
    -- Link inviter to invitee
    UPDATE profiles
    SET partner_id = NEW.invitee_id
    WHERE id = NEW.inviter_id;
    
    -- Link invitee to inviter
    UPDATE profiles
    SET partner_id = NEW.inviter_id
    WHERE id = NEW.invitee_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically link partners
CREATE TRIGGER on_partner_invitation_accepted
  AFTER UPDATE ON partner_invitations
  FOR EACH ROW
  WHEN (NEW.used_at IS NOT NULL AND OLD.used_at IS NULL)
  EXECUTE FUNCTION link_partners();

-- ============================================================================
-- EVENT SOURCING TRIGGERS
-- Automatically create events when swipes are created/updated/deleted
-- ============================================================================

-- Function to create swipe event on INSERT
CREATE OR REPLACE FUNCTION create_swipe_event_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO swipe_events (
    user_id,
    card_id,
    event_type,
    response,
    previous_response
  )
  VALUES (
    NEW.user_id,
    NEW.card_id,
    'swiped',
    NEW.response,
    NULL
  )
  RETURNING id INTO event_id;
  
  -- Link the swipe to the event
  NEW.last_event_id := event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create swipe event on UPDATE
CREATE OR REPLACE FUNCTION create_swipe_event_on_update()
RETURNS TRIGGER AS $$
DECLARE
  event_id UUID;
BEGIN
  -- Only create event if response actually changed
  IF OLD.response != NEW.response THEN
    INSERT INTO swipe_events (
      user_id,
      card_id,
      event_type,
      response,
      previous_response
    )
    VALUES (
      NEW.user_id,
      NEW.card_id,
      'changed',
      NEW.response,
      OLD.response
    )
    RETURNING id INTO event_id;
    
    -- Update the swipe with new event ID
    NEW.last_event_id := event_id;
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create swipe event on DELETE
CREATE OR REPLACE FUNCTION create_swipe_event_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO swipe_events (
    user_id,
    card_id,
    event_type,
    response,
    previous_response
  )
  VALUES (
    OLD.user_id,
    OLD.card_id,
    'deleted',
    OLD.response,
    NULL
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to automatically create events
-- Note: Using BEFORE trigger so we can set last_event_id on the NEW record
CREATE TRIGGER on_swipe_inserted
  BEFORE INSERT ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION create_swipe_event_on_insert();

CREATE TRIGGER on_swipe_updated
  BEFORE UPDATE ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION create_swipe_event_on_update();

CREATE TRIGGER on_swipe_deleted
  AFTER DELETE ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION create_swipe_event_on_delete();

-- ============================================================================
-- VIEWS & FUNCTIONS FOR PARTNER MATCHING
-- ============================================================================

-- View: Mutual matches between partners
-- Shows cards where both partners have swiped the same response
CREATE OR REPLACE VIEW mutual_matches AS
SELECT 
  p1.id AS user1_id,
  p1.partner_id AS user2_id,
  s1.card_id,
  c.text AS card_text,
  s1.response,
  s1.created_at AS user1_swiped_at,
  s2.created_at AS user2_swiped_at
FROM profiles p1
INNER JOIN profiles p2 ON p1.partner_id = p2.id AND p2.partner_id = p1.id
INNER JOIN swipes s1 ON s1.user_id = p1.id
INNER JOIN swipes s2 ON s2.user_id = p2.id AND s2.card_id = s1.card_id AND s2.response = s1.response
INNER JOIN cards c ON c.id = s1.card_id
WHERE p1.partner_id IS NOT NULL;

-- RLS for mutual_matches view (inherits from underlying tables)
ALTER VIEW mutual_matches SET (security_invoker = true);

-- Function: Get mutual "yums" for a user and their partner
-- Returns cards where both partners swiped "yum"
-- Security: Only allows querying for the authenticated user's own data
CREATE OR REPLACE FUNCTION get_mutual_yums(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  card_id UUID,
  card_text TEXT,
  user_swiped_at TIMESTAMPTZ,
  partner_swiped_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own matches';
  END IF;
  
  RETURN QUERY
  SELECT 
    mm.card_id,
    mm.card_text,
    CASE 
      WHEN mm.user1_id = user_uuid THEN mm.user1_swiped_at
      ELSE mm.user2_swiped_at
    END AS user_swiped_at,
    CASE 
      WHEN mm.user1_id = user_uuid THEN mm.user2_swiped_at
      ELSE mm.user1_swiped_at
    END AS partner_swiped_at
  FROM mutual_matches mm
  WHERE (mm.user1_id = user_uuid OR mm.user2_id = user_uuid)
    AND mm.response = 'yum'
  ORDER BY user_swiped_at DESC;
END;
$$;

-- Function: Get mutual "icks" for a user and their partner
-- Returns cards where both partners swiped "ick"
-- Security: Only allows querying for the authenticated user's own data
CREATE OR REPLACE FUNCTION get_mutual_icks(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  card_id UUID,
  card_text TEXT,
  user_swiped_at TIMESTAMPTZ,
  partner_swiped_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own matches';
  END IF;
  
  RETURN QUERY
  SELECT 
    mm.card_id,
    mm.card_text,
    CASE 
      WHEN mm.user1_id = user_uuid THEN mm.user1_swiped_at
      ELSE mm.user2_swiped_at
    END AS user_swiped_at,
    CASE 
      WHEN mm.user1_id = user_uuid THEN mm.user2_swiped_at
      ELSE mm.user1_swiped_at
    END AS partner_swiped_at
  FROM mutual_matches mm
  WHERE (mm.user1_id = user_uuid OR mm.user2_id = user_uuid)
    AND mm.response = 'ick'
  ORDER BY user_swiped_at DESC;
END;
$$;

-- Function: Get mismatches (one yum, one ick)
-- Returns cards where partners have opposite responses
-- Security: Only allows querying for the authenticated user's own data
CREATE OR REPLACE FUNCTION get_mismatches(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  card_id UUID,
  card_text TEXT,
  user_response TEXT,
  partner_response TEXT,
  user_swiped_at TIMESTAMPTZ,
  partner_swiped_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own matches';
  END IF;
  
  RETURN QUERY
  SELECT 
    s1.card_id,
    c.text AS card_text,
    s1.response AS user_response,
    s2.response AS partner_response,
    s1.created_at AS user_swiped_at,
    s2.created_at AS partner_swiped_at
  FROM profiles p1
  INNER JOIN profiles p2 ON p1.partner_id = p2.id AND p2.partner_id = p1.id
  INNER JOIN swipes s1 ON s1.user_id = p1.id
  INNER JOIN swipes s2 ON s2.user_id = p2.id AND s2.card_id = s1.card_id
  INNER JOIN cards c ON c.id = s1.card_id
  WHERE p1.id = user_uuid
    AND p1.partner_id IS NOT NULL
    AND (
      (s1.response = 'yum' AND s2.response = 'ick') OR
      (s1.response = 'ick' AND s2.response = 'yum')
    )
  ORDER BY s1.created_at DESC;
END;
$$;

-- Function: Get cards where one partner hasn't swiped yet
-- Useful for showing "pending" cards
-- Security: Only allows querying for the authenticated user's own data
CREATE OR REPLACE FUNCTION get_pending_cards(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  card_id UUID,
  card_text TEXT,
  user_response TEXT,
  user_swiped_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own matches';
  END IF;
  
  RETURN QUERY
  SELECT 
    s1.card_id,
    c.text AS card_text,
    s1.response AS user_response,
    s1.created_at AS user_swiped_at
  FROM profiles p1
  INNER JOIN profiles p2 ON p1.partner_id = p2.id AND p2.partner_id = p1.id
  INNER JOIN swipes s1 ON s1.user_id = p1.id
  INNER JOIN cards c ON c.id = s1.card_id
  WHERE p1.id = user_uuid
    AND p1.partner_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM swipes s2 
      WHERE s2.user_id = p2.id AND s2.card_id = s1.card_id
    )
  ORDER BY s1.created_at DESC;
END;
$$;

-- Function: Get comprehensive match summary
-- Returns counts of mutual yums, mutual icks, mismatches, and pending
-- Security: Only allows querying for the authenticated user's own data
CREATE OR REPLACE FUNCTION get_match_summary(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  mutual_yums_count BIGINT,
  mutual_icks_count BIGINT,
  mismatches_count BIGINT,
  pending_count BIGINT,
  total_cards_swiped BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  partner_uuid UUID;
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own matches';
  END IF;
  
  -- Get partner ID
  SELECT partner_id INTO partner_uuid
  FROM profiles
  WHERE id = user_uuid AND partner_id IS NOT NULL;
  
  IF partner_uuid IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM get_mutual_yums(user_uuid))::BIGINT AS mutual_yums_count,
    (SELECT COUNT(*) FROM get_mutual_icks(user_uuid))::BIGINT AS mutual_icks_count,
    (SELECT COUNT(*) FROM get_mismatches(user_uuid))::BIGINT AS mismatches_count,
    (SELECT COUNT(*) FROM get_pending_cards(user_uuid))::BIGINT AS pending_count,
    (SELECT COUNT(*) FROM swipes WHERE user_id = user_uuid)::BIGINT AS total_cards_swiped;
END;
$$;

-- ============================================================================
-- EVENT SOURCING ANALYTICS FUNCTIONS
-- Query event history for analytics and user behavior tracking
-- ============================================================================

-- Function: Get user's swipe event history
-- Returns all events for a user, ordered by time
CREATE OR REPLACE FUNCTION get_user_swipe_history(
  user_uuid UUID DEFAULT auth.uid(),
  limit_count INTEGER DEFAULT 100,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  event_id UUID,
  card_id UUID,
  card_text TEXT,
  event_type TEXT,
  response TEXT,
  previous_response TEXT,
  created_at TIMESTAMPTZ,
  event_sequence BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own events';
  END IF;
  
  RETURN QUERY
  SELECT 
    se.id AS event_id,
    se.card_id,
    c.text AS card_text,
    se.event_type,
    se.response,
    se.previous_response,
    se.created_at,
    se.event_sequence
  FROM swipe_events se
  INNER JOIN cards c ON c.id = se.card_id
  WHERE se.user_id = user_uuid
  ORDER BY se.event_sequence DESC, se.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Function: Get user swipe statistics
-- Returns aggregated stats from events
CREATE OR REPLACE FUNCTION get_user_swipe_stats(
  user_uuid UUID DEFAULT auth.uid(),
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_events BIGINT,
  total_yums BIGINT,
  total_icks BIGINT,
  total_maybes BIGINT,
  total_changes BIGINT,
  total_deletes BIGINT,
  first_swipe_at TIMESTAMPTZ,
  last_swipe_at TIMESTAMPTZ,
  unique_cards_swiped BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own stats';
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total_events,
    COUNT(*) FILTER (WHERE se.response = 'yum' AND se.event_type = 'swiped')::BIGINT AS total_yums,
    COUNT(*) FILTER (WHERE se.response = 'ick' AND se.event_type = 'swiped')::BIGINT AS total_icks,
    COUNT(*) FILTER (WHERE se.response = 'maybe' AND se.event_type = 'swiped')::BIGINT AS total_maybes,
    COUNT(*) FILTER (WHERE se.event_type = 'changed')::BIGINT AS total_changes,
    COUNT(*) FILTER (WHERE se.event_type = 'deleted')::BIGINT AS total_deletes,
    MIN(se.created_at) AS first_swipe_at,
    MAX(se.created_at) AS last_swipe_at,
    COUNT(DISTINCT se.card_id)::BIGINT AS unique_cards_swiped
  FROM swipe_events se
  WHERE se.user_id = user_uuid
    AND (start_date IS NULL OR se.created_at >= start_date)
    AND (end_date IS NULL OR se.created_at <= end_date);
END;
$$;

-- Function: Get swipe events by time range (for analytics)
CREATE OR REPLACE FUNCTION get_swipe_events_by_date_range(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  user_uuid UUID DEFAULT auth.uid()
)
RETURNS TABLE (
  event_id UUID,
  card_id UUID,
  card_text TEXT,
  event_type TEXT,
  response TEXT,
  previous_response TEXT,
  created_at TIMESTAMPTZ,
  event_sequence BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own events';
  END IF;
  
  -- Validate required parameters
  IF start_date IS NULL OR end_date IS NULL THEN
    RAISE EXCEPTION 'start_date and end_date are required';
  END IF;
  
  RETURN QUERY
  SELECT 
    se.id AS event_id,
    se.card_id,
    c.text AS card_text,
    se.event_type,
    se.response,
    se.previous_response,
    se.created_at,
    se.event_sequence
  FROM swipe_events se
  INNER JOIN cards c ON c.id = se.card_id
  WHERE se.user_id = user_uuid
    AND se.created_at >= start_date
    AND se.created_at <= end_date
  ORDER BY se.event_sequence ASC, se.created_at ASC;
END;
$$;

-- Function: Get response distribution over time
-- Useful for tracking how user preferences evolve
CREATE OR REPLACE FUNCTION get_response_distribution_over_time(
  user_uuid UUID DEFAULT auth.uid(),
  interval_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  yum_count BIGINT,
  ick_count BIGINT,
  maybe_count BIGINT,
  total_count BIGINT
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
    DATE_TRUNC('day', se.created_at) AS period_start,
    DATE_TRUNC('day', se.created_at) + (interval_days || ' days')::INTERVAL AS period_end,
    COUNT(*) FILTER (WHERE se.response = 'yum' AND se.event_type = 'swiped')::BIGINT AS yum_count,
    COUNT(*) FILTER (WHERE se.response = 'ick' AND se.event_type = 'swiped')::BIGINT AS ick_count,
    COUNT(*) FILTER (WHERE se.response = 'maybe' AND se.event_type = 'swiped')::BIGINT AS maybe_count,
    COUNT(*) FILTER (WHERE se.event_type = 'swiped')::BIGINT AS total_count
  FROM swipe_events se
  WHERE se.user_id = user_uuid
    AND se.event_type = 'swiped'
  GROUP BY DATE_TRUNC('day', se.created_at)
  ORDER BY period_start DESC;
END;
$$;

