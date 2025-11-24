-- ============================================================================
-- CLEAR ALL SWIPES
-- This script removes all swipes so you can see all cards again
-- ============================================================================

-- Clear current state (swipes table)
-- This will make all cards available again for swiping
-- Note: This will trigger the delete event, creating 'deleted' events in swipe_events
DELETE FROM swipes;

-- ============================================================================
-- OPTIONAL: Clear event history too
-- Uncomment the line below if you also want to remove all swipe event history
-- WARNING: This will permanently delete all swipe history/analytics
-- ============================================================================
-- DELETE FROM swipe_events;

