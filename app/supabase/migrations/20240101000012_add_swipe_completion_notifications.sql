-- ============================================================================
-- SWIPE COMPLETION NOTIFICATIONS
-- Track when both partners have completed swiping and notifications sent
-- ============================================================================

-- Table to track sent completion notifications (prevent duplicates)
CREATE TABLE swipe_completion_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Index for fast lookups
CREATE INDEX idx_swipe_completion_notifications_user1 ON swipe_completion_notifications(user1_id);
CREATE INDEX idx_swipe_completion_notifications_user2 ON swipe_completion_notifications(user2_id);
CREATE INDEX idx_swipe_completion_notifications_pair ON swipe_completion_notifications(user1_id, user2_id);

-- Enable RLS
ALTER TABLE swipe_completion_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view notifications for their partnerships
CREATE POLICY "Users can view their completion notifications"
  ON swipe_completion_notifications FOR SELECT
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );

-- ============================================================================
-- Add expo_push_token to profiles table
-- ============================================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_expo_push_token ON profiles(expo_push_token) WHERE expo_push_token IS NOT NULL;

-- ============================================================================
-- Function: Check if both partners have completed all swipes
-- ============================================================================
CREATE OR REPLACE FUNCTION check_both_partners_completed(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  partner_uuid UUID;
  total_active_cards BIGINT;
  user_swipe_count BIGINT;
  partner_swipe_count BIGINT;
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own completion status';
  END IF;
  
  -- Get partner ID
  SELECT partner_id INTO partner_uuid
  FROM profiles
  WHERE id = user_uuid AND partner_id IS NOT NULL;
  
  -- If no partner, return false
  IF partner_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Count total active cards
  SELECT COUNT(*) INTO total_active_cards
  FROM cards
  WHERE is_active = true;
  
  -- If no active cards, return false
  IF total_active_cards = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Count user's swipes
  SELECT COUNT(*) INTO user_swipe_count
  FROM swipes
  WHERE user_id = user_uuid;
  
  -- Count partner's swipes
  SELECT COUNT(*) INTO partner_swipe_count
  FROM swipes
  WHERE user_id = partner_uuid;
  
  -- Return true if both have swiped all active cards
  RETURN (user_swipe_count = total_active_cards) AND (partner_swipe_count = total_active_cards);
END;
$$;

-- ============================================================================
-- Function: Mark completion notification as sent
-- ============================================================================
CREATE OR REPLACE FUNCTION mark_completion_notification_sent(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: ensure caller is one of the users
  IF auth.uid() IS NULL OR (auth.uid() != user1_uuid AND auth.uid() != user2_uuid) THEN
    RAISE EXCEPTION 'Access denied: can only mark notifications for your own partnership';
  END IF;
  
  -- Insert notification record (use ON CONFLICT to prevent duplicates)
  INSERT INTO swipe_completion_notifications (user1_id, user2_id, sent_at)
  VALUES (user1_uuid, user2_uuid, NOW())
  ON CONFLICT (user1_id, user2_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- ============================================================================
-- Function: Check if notification already sent for partnership
-- ============================================================================
CREATE OR REPLACE FUNCTION has_completion_notification_been_sent(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  partner_uuid UUID;
  notification_exists BOOLEAN;
BEGIN
  -- Security check: ensure user can only query their own data
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only query your own notification status';
  END IF;
  
  -- Get partner ID
  SELECT partner_id INTO partner_uuid
  FROM profiles
  WHERE id = user_uuid AND partner_id IS NOT NULL;
  
  -- If no partner, return false
  IF partner_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if notification exists (check both orderings since we store as user1_id, user2_id)
  SELECT EXISTS (
    SELECT 1 FROM swipe_completion_notifications
    WHERE (user1_id = user_uuid AND user2_id = partner_uuid)
       OR (user1_id = partner_uuid AND user2_id = user_uuid)
  ) INTO notification_exists;
  
  RETURN notification_exists;
END;
$$;

