-- ============================================================================
-- FIX INFINITE RECURSION IN PROFILES RLS POLICY
-- ============================================================================
-- The "Users can view partner profile" policy had a recursive subquery
-- that caused infinite recursion. This migration fixes it by simplifying
-- the policy to avoid querying the profiles table within the policy check.
-- ============================================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view partner profile" ON profiles;

-- Recreate the policy without the recursive subquery
-- The policy now only checks:
-- 1. User viewing their own profile (auth.uid() = id)
-- 2. User viewing a profile where they are the partner (auth.uid() = partner_id)
-- The bidirectional relationship is handled by the partner_id field itself
CREATE POLICY "Users can view partner profile"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id OR 
    auth.uid() = partner_id
  );

