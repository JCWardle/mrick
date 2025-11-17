# MVP Specification: Mr. Ick

## Overview
The MVP focuses on the core swiping experience with basic partner linking. This version establishes the foundational user flow and interaction patterns that will scale in future releases.

---

## 🔐 Authentication

### Login Options
1. **Google Sign-In**
   - One-tap Google authentication
   - Minimal friction onboarding
   - Store user profile (name, email, profile picture if available)

2. **Email + Password**
   - Email: Valid email format validation
   - Password: Minimum 8 characters
   - Basic validation and error handling
   - "Forgot password" flow (optional for MVP, can be placeholder)

### Onboarding Flow
- After authentication, proceed through profile setup screens in sequence:
  1. Age Range & Sexual Preference Selection (combined screen)
  2. Gender Selection
- All selections are **required** before proceeding to swiping interface
- Can be updated later in settings (optional for MVP)

---

## 👤 Profile Setup

### Age Range & Sexual Preference Selection

#### Purpose
- Content filtering and age-appropriate card curation
- Legal compliance and safety
- Partner matching compatibility

#### Implementation
- **Combined selection screen** after login
- **Age ranges:**
  - 18-24
  - 25-34
  - 35-44
  - 45-54
  - 55+
- **Sexual preference options:**
  - Straight
  - Gay
  - Lesbian
  - Bisexual
  - Pansexual
  - Asexual
  - Prefer not to say
- Both selections are **required** before proceeding
- After both selections are made, proceed to Gender Selection

### Gender Selection

#### Purpose
- Personal identification and card personalization
- Partner matching and filtering

#### Implementation
- **Single selection screen** after age range & sexual preference
- **Gender options:**
  - Male
  - Female
  - Non-binary
  - Prefer not to say
- Selection is **required** before proceeding
- After selection, proceed directly to swiping interface

---

## 🎴 Swiping Interface (Tinder-like Behavior)

### Card Stack Layout
- **Single card visible** at a time (top of stack)
- Cards are **stacked** with slight offset/rotation for depth perception
- Next card(s) peek from behind with reduced opacity
- Cards are **full-screen** or near-full-screen (with safe area padding)

### Card Content
- **Text-based cards** (no images for MVP)
- Large, readable text displaying the sexual act/preference/scenario
- Clean, minimal design
- Card background: solid color or subtle gradient
- Text color: high contrast for readability

### Swipe Gestures & Physics

#### 1. **Drag Interaction**
- User can **touch and drag** the card in any direction
- Card follows finger movement with 1:1 tracking
- Card rotates slightly based on horizontal drag distance:
  - Drag right → slight clockwise rotation (max ~15-20°)
  - Drag left → slight counter-clockwise rotation (max ~15-20°)
  - Rotation is proportional to horizontal distance from center

#### 2. **Swipe Thresholds**
- **Horizontal threshold:** ~100-120px from center
  - Beyond this threshold, card is "committed" to that direction
  - Visual feedback changes (card becomes more opaque, rotation increases)
- **Vertical threshold:** ~80-100px from center
  - Upward drag = "Maybe" (if implemented in MVP, otherwise ignored)
  - Downward drag = "Super Like" or ignored (optional for MVP)

#### 3. **Release Behavior**
- **If within threshold:**
  - Card **snaps back** to center with spring animation
  - Smooth, elastic bounce effect
  - Animation duration: ~300-400ms
- **If beyond threshold:**
  - Card **flies off screen** in the direction of swipe
  - Exit animation: ~200-300ms
  - Card fades out as it exits
  - Next card immediately animates into position

#### 4. **Swipe Directions & Actions**
- **Swipe Right (→) = "Yum"**
  - Green accent color or positive indicator
  - Card exits to the right
  - Haptic feedback: positive/light vibration
- **Swipe Left (←) = "Ick"**
  - Red accent color or negative indicator
  - Card exits to the left
  - Haptic feedback: negative/heavier vibration
- **Swipe Up (↑) = "Maybe"** (optional for MVP)
  - Yellow/amber accent color
  - Card exits upward
  - If not in MVP, upward swipes are ignored or snap back

#### 5. **Button Alternatives**
- **Action buttons** at bottom of screen:
  - "Yum" button (right side, green)
  - "Ick" button (left side, red)
  - "Maybe" button (center, optional for MVP)
- Tapping button triggers same exit animation as swipe
- Buttons are **disabled** while card is being dragged
- Button tap = instant action (no drag required)

#### 6. **Animation Details**
- **Card entrance:** Next card slides up from bottom with slight scale animation (0.95 → 1.0)
- **Card exit:** 
  - Horizontal swipes: Card moves off-screen with rotation and fade
  - Exit velocity should feel natural (not too fast, not too slow)
- **Stack depth:** 2-3 cards visible in background with:
  - Reduced scale (95%, 90%)
  - Reduced opacity (60%, 40%)
  - Slight rotation offset for visual interest

#### 7. **Haptic Feedback**
- **Light tap:** When card is picked up (optional)
- **Medium vibration:** When threshold is crossed
- **Strong vibration:** When card is released and action is committed
- **Button tap:** Light vibration for button interactions

#### 8. **Visual Feedback During Drag**
- **Before threshold:**
  - Card follows finger naturally
  - Subtle rotation based on horizontal position
  - Background color hint (green tint for right, red tint for left)
- **After threshold:**
  - Card becomes more opaque
  - Background color becomes more pronounced
  - Rotation increases slightly
  - Optional: Text overlay appears ("Yum" or "Ick")

#### 9. **Edge Cases**
- **Rapid swipes:** Multiple quick swipes should queue properly
- **Interrupted swipe:** If user releases mid-drag, card snaps back
- **Diagonal swipes:** Horizontal component determines action (right = Yum, left = Ick)
- **Card limit:** When cards run out, show "You're all caught up!" message

---

## 👥 Partner Invitation (After 3rd Swipe)

### Trigger
- After the **3rd card swipe** (regardless of Yum/Ick/Maybe)
- Modal appears **once per session** (can be dismissed and won't reappear until next session)

### Modal Content
- **Title:** "Invite Your Partner"
- **Description:** Brief text explaining partner linking benefits
- **QR Code:**
  - Generated unique session/link code
  - Scannable QR code displayed prominently
  - Code expires after 24 hours (or configurable time)
- **Alternative Options:**
  - "Copy Link" button
  - "Share via..." button (native share sheet)
- **Dismissal:**
  - "Not Now" or "X" button (clearly dismissable)
  - Tapping outside modal (optional, but recommended)
  - Modal can be reopened from settings/menu (optional for MVP)

### Partner Linking Flow (Basic)
- Partner scans QR code or uses link
- Partner creates account (same auth options)
- Partner completes profile setup (age range, gender, sexual preference)
- Both users are now "linked"
- **Note:** Full matching/comparison features may be out of scope for MVP (can show placeholder)

---

## 📊 Data & State Management

### User State
- Store authentication status
- Store age range selection
- Store gender selection
- Store sexual preference selection
- Track swipe history (Yum/Ick/Maybe per card)
- Track partner link status (if linked, partner ID)

### Card State
- Pre-loaded card deck (curated set for MVP)
- Track which cards have been swiped
- Maintain card order/randomization
- Store user responses per card

### Session State
- Track swipe count (for partner invitation trigger)
- Track whether partner invitation modal has been shown
- Session persistence (resume where left off)

---

## 🎨 UI/UX Requirements

### Design Principles
- **Clean and minimal:** No distractions from core swiping experience
- **Playful but respectful:** Tone should be fun, not clinical
- **Safe and comfortable:** Colors, typography, and spacing should feel inviting
- **Accessible:** Large touch targets, readable text, clear visual feedback

### Screen Flow
1. **Splash/Launch Screen** → Authentication
2. **Login Screen** → Age Range & Sexual Preference Selection
3. **Age Range & Sexual Preference Selection** → Gender Selection
4. **Gender Selection** → Swiping Interface
5. **Swiping Interface** → (After 3rd swipe) Partner Invitation Modal
6. **Swiping Interface** → (Continue swiping) → Results/Summary (optional for MVP)

### Navigation
- **Minimal navigation** for MVP
- Back button/gesture to return to previous screen (where applicable)
- Settings/Profile accessible via menu (basic for MVP)

---

## 🚫 Out of Scope for MVP

- Full partner matching/comparison results screen
- Premium packs or paid features
- Educational content or card explanations
- Conversation mode or guided prompts
- Session history or preference evolution tracking
- Advanced analytics or compatibility scores
- Social features or public profiles
- Card customization or user-generated content
- Push notifications (beyond basic partner linking)
- Multi-language support
- Advanced settings or preferences

---

## ✅ MVP Success Criteria

1. User can authenticate via Google or email/password
2. User can select age range, gender, and sexual preference and proceed to swiping
3. Swiping feels natural and responsive (Tinder-like)
4. All swipe directions (Yum/Ick) work correctly with proper animations
5. Partner invitation modal appears after 3rd swipe
6. QR code generation and sharing works
7. Basic partner linking is functional
8. App is stable and performant on target devices
9. User can complete a full swipe session without crashes

---

## 🔄 Post-MVP Enhancements (Future)

- Full matching results and comparison screens
- "Maybe" swipe option with dedicated handling
- Enhanced partner linking with real-time sync
- Card pack expansion and premium features
- Educational content and safety information
- Conversation prompts and guided discussions
- Session history and preference tracking
- Advanced analytics and insights

