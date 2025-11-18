-- ============================================================================
-- ADD PREFER NOT TO SAY TO AGE RANGE
-- ============================================================================
-- Adds 'prefer-not-to-say' as a valid option for the age_range field
-- This allows users to skip providing their age range during onboarding
-- ============================================================================

-- Drop the existing CHECK constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_age_range_check;

-- Recreate the CHECK constraint with 'prefer-not-to-say' included
ALTER TABLE profiles
ADD CONSTRAINT profiles_age_range_check 
CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55+', 'prefer-not-to-say'));

