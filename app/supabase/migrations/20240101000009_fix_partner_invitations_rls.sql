-- ============================================================================
-- FIX PARTNER INVITATIONS RLS SECURITY
-- Remove overly permissive policy and add secure function for code lookup
-- ============================================================================

-- Drop the overly permissive policy that allows querying all unused invitations
DROP POLICY IF EXISTS "Users can view unused invitations for acceptance" ON partner_invitations;

-- Create a secure function to lookup invitations by code only
-- This prevents bulk export of invitation codes while allowing code-based lookups
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
    AND pi.expires_at > NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_invitation_by_code(TEXT) TO authenticated;

-- Add comment explaining the security model
COMMENT ON FUNCTION get_invitation_by_code(TEXT) IS 
  'Secure function to lookup partner invitations by code. Prevents bulk export of codes while allowing code-based lookups for the invitation acceptance flow.';

