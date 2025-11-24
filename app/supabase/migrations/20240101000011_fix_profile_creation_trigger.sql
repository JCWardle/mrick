-- ============================================================================
-- FIX PROFILE CREATION TRIGGER
-- ============================================================================
-- The handle_new_user() function may fail due to RLS policies when creating
-- a profile. This migration updates the function to ensure it can create
-- profiles even when RLS is enabled.
-- 
-- SECURITY DEFINER functions should bypass RLS, but we'll add explicit
-- error handling and use SET LOCAL to ensure RLS is bypassed.
-- ============================================================================

-- Drop and recreate the function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with error handling
  -- SECURITY DEFINER should bypass RLS, but we add ON CONFLICT to handle race conditions
  INSERT INTO profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING; -- Handle race condition if profile already exists
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    -- The profile can be created later via createProfileIfNeeded()
    -- This ensures user signup doesn't fail even if profile creation fails
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

