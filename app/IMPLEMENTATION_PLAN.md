# MVP Implementation Plan: Mr. Ick

## Overview
This plan outlines the step-by-step implementation of the MVP for the Mr. Ick React Native app, following the architecture guidelines in `AGENTS.md` and integrating directly with Supabase.

---

## Phase 1: Foundation & Setup

### 1.1 Install Dependencies
- [ ] Install `@supabase/supabase-js` for Supabase client
- [ ] Install `expo-auth-session` for Google Sign-In OAuth
- [ ] Install `expo-crypto` for secure random code generation
- [ ] Install `react-native-qrcode-svg` or `expo-qrcode` for QR code generation
- [ ] Install `expo-camera` for QR code scanning (if needed)

### 1.2 Environment Configuration
- [ ] Create `.env` file (add to `.gitignore`)
- [ ] Add Supabase URL and anon key
- [ ] Configure `expo-constants` to read environment variables
- [ ] Create `lib/supabase.ts` with singleton Supabase client

### 1.3 Supabase Client Setup
**File: `lib/supabase.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## Phase 2: Authentication

### 2.1 Authentication Hook
**File: `hooks/useAuth.ts`**

**Responsibilities:**
- Manage auth state (user, session, loading)
- Provide `loginWithEmail()`, `loginWithGoogle()`, `signUp()`, `logout()`
- Check if user profile is complete (age_range, gender, sexual_preference)
- Listen to auth state changes

**Implementation:**
```typescript
type AuthState = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isLoading: boolean;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({...});
  
  // Initialize auth state
  // Listen to auth changes
  // Check profile completeness
  // Provide auth methods
  
  return { ...state, loginWithEmail, loginWithGoogle, signUp, logout };
}
```

### 2.2 Login Form Component
**File: `components/auth/LoginForm.tsx`**

**Features:**
- Email/Password input fields (React Native Paper TextInput)
- "Sign In" and "Sign Up" buttons
- Google Sign-In button
- Error message display
- Loading states

### 2.3 Login Screen
**File: `app/(auth)/login.tsx`**

**Flow:**
- Show LoginForm
- Handle navigation after successful login
- Redirect to age-range if profile incomplete
- Redirect to swipe if profile complete

---

## Phase 3: Profile Setup (Onboarding)

### 3.1 Age Range & Sexual Preference Screen
**File: `app/(auth)/age-range.tsx`**

**Components:**
- `AgeRangeSelector` component (already exists, needs implementation)
- Sexual preference selector (similar component)
- "Continue" button (disabled until both selected)

**Age Range Options:**
- 18-24
- 25-34
- 35-44
- 45-54
- 55+

**Sexual Preference Options:**
- Straight
- Gay
- Lesbian
- Bisexual
- Pansexual
- Asexual
- Prefer not to say

**Implementation:**
- Use React Native Paper RadioButton or Button groups
- Save to Supabase `profiles` table on continue
- Navigate to gender selection screen

### 3.2 Gender Selection Screen
**File: `app/(auth)/gender.tsx`** (NEW FILE)

**Gender Options:**
- Male
- Female
- Non-binary
- Prefer not to say

**Implementation:**
- Similar to age-range screen
- Single selection required
- Save to Supabase `profiles` table
- Navigate to swipe screen after selection

### 3.3 Profile Update Functions
**File: `lib/profiles.ts`** (NEW FILE)

**Functions:**
```typescript
export async function updateProfile(data: {
  age_range?: string;
  gender?: string;
  sexual_preference?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id);
    
  if (error) throw error;
}
```

---

## Phase 4: Card Management

### 4.1 Cards Hook
**File: `hooks/useCards.ts`** (NEW FILE)

**Responsibilities:**
- Fetch active cards from Supabase `cards` table
- Filter cards user hasn't swiped yet
- Handle loading and error states
- Cache cards locally

**Implementation:**
```typescript
type Card = {
  id: string;
  text: string;
  category?: string;
  display_order?: number;
};

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch active cards
  // Filter out already swiped cards
  // Return cards, loading, error
}
```

### 4.2 Card Data Utility
**File: `utils/cardData.ts`**

**Responsibilities:**
- Helper functions for card manipulation
- Card filtering logic
- Card ordering/shuffling (if needed)

---

## Phase 5: Swiping Interface

### 5.1 Swipe Gesture Hook
**File: `hooks/useSwipeGesture.ts`**

**Responsibilities:**
- Handle pan gesture with `react-native-gesture-handler`
- Calculate swipe thresholds (horizontal: 100-120px, vertical: 80-100px)
- Determine swipe action (yum/ick/maybe)
- Provide animated values for card position and rotation
- Trigger haptic feedback at threshold crossings

**Implementation:**
```typescript
type SwipeAction = 'yum' | 'ick' | 'maybe';

export function useSwipeGesture(
  onSwipe: (action: SwipeAction) => void
) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  
  // Gesture handler setup
  // Threshold detection
  // Haptic feedback
  // Return animated values and gesture handler
}
```

### 5.2 Swipeable Card Component
**File: `components/swipe/SwipeableCard.tsx`**

**Features:**
- Full-screen or near-full-screen card
- Large, readable text
- Animated position and rotation based on gesture
- Visual feedback (color tint, opacity) based on swipe direction
- Exit animation when threshold exceeded

**Implementation:**
- Use `react-native-reanimated` for animations
- Apply gesture handler from `useSwipeGesture`
- Style with React Native Paper theme colors
- Handle card text display

### 5.3 Card Stack Component
**File: `components/swipe/CardStack.tsx`**

**Features:**
- Display 2-3 cards in stack
- Top card: full opacity, scale 1.0
- Background cards: reduced opacity (60%, 40%), reduced scale (95%, 90%)
- Slight rotation offset for depth
- Animate next card into position when top card is swiped

**Implementation:**
- Manage card index state
- Render cards with z-index and transform styles
- Handle card removal and next card animation

### 5.4 Swipe Buttons Component
**File: `components/swipe/SwipeButtons.tsx`**

**Features:**
- "Yum" button (right, green) - triggers right swipe
- "Ick" button (left, red) - triggers left swipe
- "Maybe" button (center, optional) - triggers up swipe
- Disabled while card is being dragged
- Haptic feedback on press

**Implementation:**
- Use React Native Paper Button components
- Position at bottom of screen
- Trigger same swipe action as gesture

### 5.5 Card Stack Hook
**File: `hooks/useCardStack.ts`**

**Responsibilities:**
- Manage current card index
- Track swipe history
- Handle card progression
- Count swipes (for partner invitation trigger)
- Filter out swiped cards

**Implementation:**
```typescript
export function useCardStack(cards: Card[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<Map<string, SwipeAction>>(new Map());
  const [swipeCount, setSwipeCount] = useState(0);
  
  const handleSwipe = async (action: SwipeAction) => {
    // Save swipe to Supabase
    // Update history
    // Increment counter
    // Move to next card
  };
  
  return { currentCard, handleSwipe, swipeCount, isComplete };
}
```

### 5.6 Swipe Screen
**File: `app/(swipe)/index.tsx`**

**Integration:**
- Use `useCards()` to fetch cards
- Use `useCardStack()` to manage card state
- Render `CardStack` with `SwipeableCard` components
- Render `SwipeButtons` at bottom
- Show "You're all caught up!" when cards run out
- Trigger partner invitation modal after 3rd swipe

---

## Phase 6: Swipe Persistence

### 6.1 Swipe Save Function
**File: `lib/swipes.ts`** (NEW FILE)

**Responsibilities:**
- Save swipe to Supabase `swipes` table
- Handle insert/update (if user changes response)
- Database triggers will automatically create `swipe_events`

**Implementation:**
```typescript
type SwipeResponse = 'yum' | 'ick' | 'maybe';

export async function saveSwipe(
  cardId: string,
  response: SwipeResponse
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { error } = await supabase
    .from('swipes')
    .upsert({
      user_id: user.id,
      card_id: cardId,
      response,
    }, {
      onConflict: 'user_id,card_id'
    });
    
  if (error) throw error;
}
```

---

## Phase 7: Partner Invitation

### 7.1 Partner Invitation Modal
**File: `components/partner/PartnerInviteModal.tsx`**

**Features:**
- Modal overlay (React Native Paper Modal)
- Title: "Invite Your Partner"
- Description text
- QR code display (generated from invitation code)
- "Copy Link" button
- "Share via..." button (native share)
- "Not Now" / "X" dismiss button
- Show only once per session (track in state)

### 7.2 Partner Invitation Functions
**File: `lib/partnerInvitations.ts`** (NEW FILE)

**Functions:**
```typescript
export async function createPartnerInvitation() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Generate unique code
  const code = generateUniqueCode();
  
  // Create invitation with 24h expiry
  const { data, error } = await supabase
    .from('partner_invitations')
    .insert({
      code,
      inviter_id: user.id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function acceptPartnerInvitation(code: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Update invitation (trigger will link partners)
  const { error } = await supabase
    .from('partner_invitations')
    .update({
      invitee_id: user.id,
      used_at: new Date().toISOString(),
    })
    .eq('code', code)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString());
    
  if (error) throw error;
}
```

### 7.3 QR Code Generation
- Use `react-native-qrcode-svg` or `expo-qrcode`
- Generate QR code from invitation link: `mrick://partner/invite/{code}`
- Display in modal

### 7.4 Partner Invitation Flow
**Integration in Swipe Screen:**
- Track swipe count
- Show modal after 3rd swipe (once per session)
- Generate invitation on modal open
- Handle QR code display and sharing
- Handle invitation acceptance (if user scans QR)

---

## Phase 8: Navigation & Guards

### 8.1 Navigation Guard
**File: `app/_layout.tsx`** (UPDATE)

**Logic:**
- Check authentication status
- If not authenticated → redirect to `(auth)/login`
- If authenticated but profile incomplete → redirect to `(auth)/age-range`
- If authenticated and profile complete → allow access to `(swipe)`

**Implementation:**
```typescript
export default function RootLayout() {
  const { isAuthenticated, isProfileComplete, isLoading } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  
  return (
    <PaperProvider theme={theme}>
      <Stack>
        {!isAuthenticated ? (
          <Stack.Screen name="(auth)/login" />
        ) : !isProfileComplete ? (
          <Stack.Screen name="(auth)/age-range" />
        ) : (
          <Stack.Screen name="(swipe)/index" />
        )}
      </Stack>
    </PaperProvider>
  );
}
```

### 8.2 Route Structure
```
app/
  _layout.tsx (root with guards)
  (auth)/
    login.tsx
    age-range.tsx
    gender.tsx (NEW)
  (swipe)/
    index.tsx
```

---

## Phase 9: Error Handling & Loading States

### 9.1 Error Handling
- Add try-catch blocks around all Supabase operations
- Display user-friendly error messages
- Handle network errors gracefully
- Handle authentication errors (session expired, etc.)

### 9.2 Loading States
- Show loading indicators during:
  - Authentication
  - Profile updates
  - Card fetching
  - Swipe saving
  - Partner invitation creation

### 9.3 Error Components
- Create reusable error display components
- Use React Native Paper Snackbar for transient errors

---

## Phase 10: Testing & Polish

### 10.1 User Flow Testing
- [ ] Complete login flow (email and Google)
- [ ] Complete onboarding flow (age range → sexual preference → gender)
- [ ] Swipe through multiple cards
- [ ] Verify swipes save to database
- [ ] Trigger partner invitation modal
- [ ] Generate and share QR code
- [ ] Test partner invitation acceptance

### 10.2 Edge Cases
- [ ] Handle empty card deck
- [ ] Handle network failures
- [ ] Handle expired sessions
- [ ] Handle rapid swipes
- [ ] Handle interrupted swipes

### 10.3 Performance
- [ ] Optimize card animations (60fps)
- [ ] Lazy load cards
- [ ] Cache profile data
- [ ] Optimize Supabase queries

---

## File Structure Summary

```
app/
  lib/
    supabase.ts (NEW)
    profiles.ts (NEW)
    swipes.ts (NEW)
    partnerInvitations.ts (NEW)
  hooks/
    useAuth.ts (UPDATE)
    useCards.ts (NEW)
    useCardStack.ts (UPDATE)
    useSwipeGesture.ts (UPDATE)
  components/
    auth/
      LoginForm.tsx (UPDATE)
      AgeRangeSelector.tsx (UPDATE)
    swipe/
      SwipeableCard.tsx (UPDATE)
      CardStack.tsx (UPDATE)
      SwipeButtons.tsx (UPDATE)
    partner/
      PartnerInviteModal.tsx (UPDATE)
  app/
    _layout.tsx (UPDATE - add guards)
    (auth)/
      login.tsx (UPDATE)
      age-range.tsx (UPDATE)
      gender.tsx (NEW)
    (swipe)/
      index.tsx (UPDATE)
  utils/
    cardData.ts (UPDATE)
    animations.ts (UPDATE)
```

---

## Implementation Order

1. **Phase 1**: Foundation (Supabase setup)
2. **Phase 2**: Authentication (login, signup)
3. **Phase 3**: Profile setup (onboarding)
4. **Phase 4**: Card fetching
5. **Phase 5**: Swiping interface (core feature)
6. **Phase 6**: Swipe persistence
7. **Phase 7**: Partner invitation
8. **Phase 8**: Navigation guards
9. **Phase 9**: Error handling
10. **Phase 10**: Testing & polish

---

## Key Considerations

### Database Integration
- All data operations go through Supabase client
- RLS policies handle security automatically
- Event sourcing triggers handle swipe event logging
- Partner linking handled by database triggers

### State Management
- Use React hooks for local state
- Use Supabase real-time subscriptions only if needed (not for MVP)
- Avoid Context except for auth (per AGENTS.md)
- Props drilling for component communication

### Performance
- Use `react-native-reanimated` for smooth 60fps animations
- Batch Supabase operations when possible
- Cache cards locally to reduce queries
- Lazy load partner invitation modal

### Security
- Never expose service role key in client
- Use RLS policies for all data access
- Validate user input before sending to Supabase
- Handle expired sessions gracefully

---

## Success Criteria Checklist

- [ ] User can authenticate via Google or email/password
- [ ] User can complete profile setup (age range, gender, sexual preference)
- [ ] Cards load from Supabase and display correctly
- [ ] Swiping feels natural and responsive (Tinder-like)
- [ ] All swipe directions (Yum/Ick) work with proper animations
- [ ] Swipes save to database correctly
- [ ] Partner invitation modal appears after 3rd swipe
- [ ] QR code generation and sharing works
- [ ] Partner invitation acceptance works
- [ ] App is stable and performant
- [ ] User can complete full flow without crashes

