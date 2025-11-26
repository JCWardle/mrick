-- ============================================================================
-- FIX INVITATION CODE LOOKUP TO BE CASE-INSENSITIVE
-- Normalize codes to uppercase in the database function for reliable matching
-- ============================================================================

-- Update the function to normalize the code to uppercase for case-insensitive matching
CREATE OR REPLACE FUNCTION get_invitation_by_code(invitation_code TEXT)
RETURNS TABLE (
  id UUID,
  code TEXT,
  inviter_id UUID,
  invitee_id UUID,
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Normalize code to uppercase for case-insensitive matching
  -- This ensures codes work regardless of how they're entered in URLs
  -- Only return invitation if it's unused and not expired
  -- The code itself acts as the access token
  -- LIMIT 1 ensures we only return one row even if duplicates exist
  RETURN QUERY
  SELECT 
    pi.id,
    pi.code,
    pi.inviter_id,
    pi.invitee_id,
    pi.expires_at,
    pi.used_at,
    pi.created_at
  FROM partner_invitations pi
  WHERE UPPER(pi.code) = UPPER(invitation_code)
    AND pi.used_at IS NULL
    AND pi.expires_at > NOW()
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users (already granted, but ensure it's there)
GRANT EXECUTE ON FUNCTION get_invitation_by_code(TEXT) TO authenticated;

-- Also grant to anon users for cases where they need to validate codes before signup
-- This allows the code validation to work even when not authenticated
GRANT EXECUTE ON FUNCTION get_invitation_by_code(TEXT) TO anon;

