-- ============================================================================
-- FUNCTION: get_matched_cards (Enhanced)
-- Returns matched cards with full card data including category, description, and image_path
-- Returns a list of cards that both partners have matched on (both 'yum')
-- Respects RLS by only allowing users to see matches with their own partner
-- ============================================================================

-- Drop the existing function first since we're changing the return type
DROP FUNCTION IF EXISTS get_matched_cards(UUID);

CREATE FUNCTION get_matched_cards(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  card_id UUID,
  card_title TEXT,
  category TEXT,
  description TEXT,
  image_path TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  partner_uuid UUID;
  user_profile RECORD;
BEGIN
  -- Verify user is authenticated
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Get user's profile and verify they have a partner
  -- RLS will ensure user can only see their own profile
  SELECT * INTO user_profile
  FROM profiles
  WHERE profiles.id = user_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  IF user_profile.partner_id IS NULL THEN
    -- Return empty result if no partner
    RETURN;
  END IF;

  partner_uuid := user_profile.partner_id;

  -- Verify the partnership is mutual (partner also has this user as partner)
  -- This ensures we only show matches for valid partnerships
  -- RLS will ensure user can only see their partner's profile if they're linked
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = partner_uuid
    AND p.partner_id = user_uuid
  ) THEN
    RAISE EXCEPTION 'Partnership is not mutual';
  END IF;

  -- Find cards where both partners have 'yum' response
  -- RLS policies ensure:
  -- - Users can only see their own swipes (via "Users can view own swipes" policy)
  -- - Users can see their partner's swipes (via "Users can view partner swipes" policy)
  -- So this query will only work if the user has access to both their own and partner's swipes
  RETURN QUERY
  SELECT DISTINCT
    c.id AS card_id,
    c.text AS card_title,
    c.category,
    c.description,
    c.image_path
  FROM cards c
  INNER JOIN swipes s1 ON s1.card_id = c.id AND s1.user_id = user_uuid AND s1.response = 'yum'
  INNER JOIN swipes s2 ON s2.card_id = c.id AND s2.user_id = partner_uuid AND s2.response = 'yum'
  WHERE c.is_active = true
  ORDER BY c.category NULLS LAST, c.text;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_matched_cards(UUID) TO authenticated;

-- Update comment
COMMENT ON FUNCTION get_matched_cards(UUID) IS 
  'Returns matched cards with full data (category, description, image_path) that both partners have matched on (both responded "yum"). Only allows users to see matches with their own partner. Uses SECURITY INVOKER to respect RLS policies - users can only see their own swipes and their partner''s swipes through existing RLS policies.';

