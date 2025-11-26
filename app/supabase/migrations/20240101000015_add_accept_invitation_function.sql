-- ============================================================================
-- ADD SECURE FUNCTION TO ACCEPT INVITATIONS
-- This bypasses RLS issues by using SECURITY DEFINER
-- ============================================================================

-- Create a function to accept an invitation by code
-- This function combines lookup and acceptance in a single atomic operation
-- It handles all validation including partner check
CREATE OR REPLACE FUNCTION accept_invitation_by_code(invitation_code TEXT, user_id UUID)
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
DECLARE
  invitation_record RECORD;
  user_profile RECORD;
BEGIN
  -- Check if user already has a partner
  SELECT * INTO user_profile
  FROM profiles
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  IF user_profile.partner_id IS NOT NULL THEN
    RAISE EXCEPTION 'You are already linked with a partner';
  END IF;

  -- Find the invitation (case-insensitive)
  SELECT * INTO invitation_record
  FROM partner_invitations
  WHERE UPPER(code) = UPPER(invitation_code)
    AND used_at IS NULL
    AND expires_at > NOW()
  LIMIT 1;

  -- Check if invitation was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or has expired';
  END IF;

  -- Check if expired (double-check)
  IF invitation_record.expires_at <= NOW() THEN
    RAISE EXCEPTION 'This invitation has expired';
  END IF;

  -- Check if already used (double-check)
  IF invitation_record.used_at IS NOT NULL THEN
    RAISE EXCEPTION 'This invitation has already been used';
  END IF;

  -- Prevent self-invite
  IF invitation_record.inviter_id = user_id THEN
    RAISE EXCEPTION 'You cannot accept your own invitation';
  END IF;

  -- Update the invitation atomically
  UPDATE partner_invitations pi
  SET 
    invitee_id = user_id,
    used_at = NOW()
  WHERE pi.id = invitation_record.id
  RETURNING * INTO invitation_record;

  -- Return the updated invitation
  RETURN QUERY SELECT 
    invitation_record.id,
    invitation_record.code,
    invitation_record.inviter_id,
    invitation_record.invitee_id,
    invitation_record.expires_at,
    invitation_record.used_at,
    invitation_record.created_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION accept_invitation_by_code(TEXT, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION accept_invitation_by_code(TEXT, UUID) IS 
  'Secure function to accept a partner invitation by code. Bypasses RLS to allow invitation acceptance while maintaining security checks.';

