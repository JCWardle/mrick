# Debugging Swipe Crash Guide

## Current Crash Information
- **Crash Type**: EXC_CRASH (SIGABRT)
- **Location**: When swiping cards left or right
- **Platform**: iOS Simulator (macOS)

## How to Get More Debug Information

### 1. Check Console Logs

The code now includes comprehensive logging. Check your console for:

- `[useSwipeGesture]` - Logs when swipe gesture is detected
- `[CardStack]` - Logs when handleSwipe is called
- `[useCardStack]` - Logs the swipe save process
- `[saveSwipe]` - Logs database operations

**To view logs:**
- In Expo: Check the terminal where you ran `expo start`
- In Xcode: Open Xcode → Window → Devices and Simulators → Select your simulator → View Device Logs
- In React Native Debugger: If using React Native Debugger, check the console tab

### 2. Check Database Logs

The crash might be caused by a database trigger failure. Check your Supabase logs:

1. Go to your Supabase dashboard
2. Navigate to Logs → Database Logs
3. Look for errors around the time of the crash
4. Check for errors in:
   - `get_card_context_for_event` function
   - `create_swipe_event_on_insert` trigger
   - Any foreign key violations

### 3. Enable React Native Error Boundary

Add an error boundary to catch React errors:

```typescript
// Add to app/_layout.tsx or create a new ErrorBoundary component
import React from 'react';
import { View, Text } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View>
          <Text>Something went wrong: {this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
```

### 4. Check Native Crash Logs

For iOS Simulator:
1. Open Console.app (macOS)
2. Filter by "mrick" or "Simulator"
3. Look for crash reports around the time of the crash
4. Check for SIGABRT signals

For detailed crash report:
1. The crash report dialog should show "Show Details" or similar
2. Copy the full crash report
3. Look for the stack trace, especially:
   - Thread 0 (the crashed thread)
   - Any database-related functions
   - React Native bridge calls

### 5. Test Database Trigger Directly

Test if the database trigger is working:

```sql
-- In Supabase SQL Editor, test the trigger function
SELECT get_card_context_for_event('YOUR_CARD_ID_HERE');

-- Test inserting a swipe manually
INSERT INTO swipes (user_id, card_id, response)
VALUES ('YOUR_USER_ID', 'YOUR_CARD_ID', 'yum');
```

### 6. Common Crash Causes to Check

Based on SIGABRT, check for:

1. **Database Trigger Failure**
   - `get_card_context_for_event` might fail if card doesn't exist
   - Check if card_id is valid before saving

2. **Null Pointer Exception**
   - Check if `card.text` or `card.category` is null
   - Check if `currentCard` is null when accessing properties

3. **React Native Reanimated Issue**
   - Check if animated values are accessed after unmount
   - Verify `runOnJS` is used correctly

4. **Memory Issue**
   - Check if too many cards are loaded
   - Check for memory leaks in animations

### 7. Enable Detailed Logging

To get even more information, you can temporarily add:

```typescript
// In useCardStack.ts, add before saveSwipe:
console.log('Full card data:', JSON.stringify(cards[currentIndex], null, 2));
console.log('Full user data:', JSON.stringify(user, null, 2));
```

### 8. Test with Minimal Case

Try to isolate the issue:

1. Swipe with only 1 card in the stack
2. Swipe with network disabled (to see if it's a network issue)
3. Swipe with a known valid card_id
4. Check if it crashes on first swipe or subsequent swipes

### 9. Check for Database Schema Issues

Verify the database schema matches expectations:

```sql
-- Check if swipes table exists and has correct structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'swipes';

-- Check if triggers exist
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'swipes';
```

## What to Share for Further Debugging

When reporting the issue, please share:

1. **Console logs** - All logs from `[useSwipeGesture]` through `[saveSwipe]`
2. **Crash report** - Full crash report from the dialog (especially Thread 0)
3. **Database logs** - Any errors from Supabase logs
4. **Steps to reproduce** - Exact steps that cause the crash
5. **Card data** - The card that was being swiped (if possible)
6. **Network status** - Was network connected when it crashed?

## Next Steps

After gathering this information, we can:
1. Identify if it's a database trigger issue
2. Check if it's a React Native/Reanimated issue
3. Verify if it's a data validation issue
4. Determine if it's a race condition we missed

