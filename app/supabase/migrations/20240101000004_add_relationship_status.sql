-- ============================================================================
-- ADD RELATIONSHIP STATUS TO PROFILES
-- ============================================================================
-- Adds relationship_status column to the profiles table
-- This allows users to specify their relationship status during onboarding
-- ============================================================================

-- Add relationship_status column
ALTER TABLE profiles
ADD COLUMN relationship_status TEXT CHECK (relationship_status IN ('single', 'in-a-relationship', 'married', 'divorced', 'widowed', 'prefer-not-to-say'));

