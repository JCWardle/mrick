# Steps to Debug the Crash

## Important Questions

1. **When exactly does the crash happen?**
   - Immediately when you start swiping (finger down)?
   - When you release after swiping?
   - After the card animates off screen?
   - At a specific point in the animation?

2. **Do you see ANY of these logs when you swipe?**
   - `[SwipeScreen] Render`
   - `[CardStack] Render`
   - `[useSwipeGesture] Gesture started`
   - `[useSwipeGesture] Gesture ended`
   - `[useSwipeGesture] Calling onSwipe`
   - `[CardStack] handleSwipe called`
   - `[useCardStack] Starting swipe save`
   - `[saveSwipe] Attempting to save swipe`

## Testing Steps

1. **Open the app and wait for cards to load**
   - You should see: `[SwipeScreen] Render` logs
   - You should see: `[CardStack] Render` logs

2. **Try a small swipe (not enough to trigger)**
   - You should see: `[useSwipeGesture] Gesture started`
   - You should see: `[useSwipeGesture] Gesture ended` (but no onSwipe call)

3. **Try a full swipe (left or right)**
   - Watch the console carefully
   - Note the LAST log message you see before the crash
   - This will tell us exactly where it's failing

4. **Check for error messages**
   - Look for any red error messages in the console
   - Look for any warnings (yellow messages)

## What to Share

Please share:
1. **The complete console output** from when you open the app until the crash
2. **The exact moment** the crash happens (during swipe, after release, etc.)
3. **The last log message** you see before the crash
4. **Any error messages** (even if they seem unrelated)

## Common Crash Scenarios

### Scenario 1: Crash before any logs
- **Possible cause**: Native module crash (Reanimated, Gesture Handler)
- **Solution**: Check if gesture handler is properly initialized

### Scenario 2: Crash after `[useSwipeGesture] Gesture ended` but before `[CardStack] handleSwipe called`
- **Possible cause**: Issue with `runOnJS` or callback execution
- **Solution**: Check if `onSwipe` callback is valid

### Scenario 3: Crash after `[saveSwipe] Attempting to save swipe` but before completion
- **Possible cause**: Database trigger failure
- **Solution**: Check Supabase logs for trigger errors

### Scenario 4: Crash after database save completes
- **Possible cause**: State update after unmount or invalid state
- **Solution**: Check mounted state and state updates

## Quick Test

Try this minimal test:
1. Open the app
2. Wait for cards to load
3. **Don't swipe yet** - just check if you see the `[SwipeScreen] Render` and `[CardStack] Render` logs
4. If those logs appear, the crash is likely in the swipe gesture handler
5. If those logs don't appear, the crash is happening during render

