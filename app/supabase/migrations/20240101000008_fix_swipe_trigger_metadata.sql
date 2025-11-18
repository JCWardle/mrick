-- ============================================================================
-- FIX SWIPE TRIGGER METADATA ERROR
-- The trigger functions were trying to access NEW.metadata on the swipes table,
-- but that column doesn't exist. The metadata column only exists in swipe_events.
-- This migration fixes the trigger functions to use card_context directly.
-- ============================================================================

-- Fix the insert trigger function
CREATE OR REPLACE FUNCTION create_swipe_event_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  event_id UUID;
  card_context JSONB;
BEGIN
  -- Get card context (intensity and labels)
  card_context := get_card_context_for_event(NEW.card_id);
  
  -- Insert event with card context as metadata
  INSERT INTO swipe_events (
    user_id,
    card_id,
    event_type,
    response,
    previous_response,
    metadata
  )
  VALUES (
    NEW.user_id,
    NEW.card_id,
    'swiped',
    NEW.response,
    NULL,
    card_context
  )
  RETURNING id INTO event_id;
  
  -- Link the swipe to the event
  NEW.last_event_id := event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the update trigger function
CREATE OR REPLACE FUNCTION create_swipe_event_on_update()
RETURNS TRIGGER AS $$
DECLARE
  event_id UUID;
  card_context JSONB;
BEGIN
  -- Only create event if response actually changed
  IF OLD.response != NEW.response THEN
    -- Get card context (intensity and labels)
    card_context := get_card_context_for_event(NEW.card_id);
    
    -- Insert event with card context as metadata
    INSERT INTO swipe_events (
      user_id,
      card_id,
      event_type,
      response,
      previous_response,
      metadata
    )
    VALUES (
      NEW.user_id,
      NEW.card_id,
      'changed',
      NEW.response,
      OLD.response,
      card_context
    )
    RETURNING id INTO event_id;
    
    -- Update the swipe with new event ID
    NEW.last_event_id := event_id;
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

