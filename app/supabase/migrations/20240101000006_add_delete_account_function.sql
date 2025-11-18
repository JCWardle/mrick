-- ============================================================================
-- DELETE USER ACCOUNT FUNCTION
-- Allows users to delete their own account
-- ============================================================================

-- Function to delete the current user's account
-- This function uses SECURITY DEFINER to allow deletion from auth.users
-- It verifies that the user is deleting their own account
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user's ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to delete account';
  END IF;
  
  -- Delete the user from auth.users
  -- This will cascade delete the profile due to ON DELETE CASCADE
  -- and all related data (swipes, swipe_events, partner_invitations)
  DELETE FROM auth.users
  WHERE id = current_user_id;
  
  -- If we get here, the deletion was successful
  -- The auth state change will be handled by Supabase client
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION delete_user_account() IS 
  'Allows authenticated users to delete their own account. Deletes the user from auth.users, which cascades to delete profile and all related data.';
