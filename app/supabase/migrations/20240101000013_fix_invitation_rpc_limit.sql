-- ============================================================================
-- FIX INVITATION RPC FUNCTION TO ENSURE SINGLE ROW RETURN
-- Add LIMIT 1 to prevent multiple row returns that cause JSON coercion errors
-- ============================================================================

-- Update the function to ensure only one row is returned
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
  WHERE pi.code = invitation_code
    AND pi.used_at IS NULL
    AND pi.expires_at > NOW()
  LIMIT 1;
END;
$$;

