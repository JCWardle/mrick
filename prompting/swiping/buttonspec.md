# Swipe Button Design Specification

## Overview
This specification describes the three primary action buttons used in the swiping interface. These buttons are positioned horizontally in a row at the bottom center of the screen, below the card stack and above the bottom navigation bar.

## Button Layout

### Container
- **Layout**: Horizontal row with three buttons
- **Alignment**: Centered horizontally
- **Spacing**: Equal spacing between buttons (approximately 16-24px between button centers)
- **Position**: Fixed at bottom center, above bottom navigation bar
- **Background**: Transparent (allows underlying content to show through)
- **Padding**: Vertical padding of 24px, horizontal padding of 16px

## Button Specifications

### 1. Cross Button (Nope/Dislike) - Left Position

**Purpose**: Reject or pass on the current card

**Visual Design**:
- **Shape**: Circular button
- **Size**: Approximately 56-64px diameter (touch target should be at least 44x44px for accessibility)
- **Background Color**: Use `error` or `destructive` color from design system (typically a red hue)
- **Icon**: "X" or "close" icon
- **Icon Color**: White or `onError` color (high contrast against error background)
- **Icon Size**: Approximately 24-28px

**States**:
- **Default**: Full opacity, standard size
- **Pressed**: Slight scale down (0.95x) with opacity reduction to 0.8
- **Disabled**: Reduced opacity (0.5), non-interactive

**Interaction**:
- Triggers haptic feedback (light impact) on press
- Executes swipe-left/reject action
- Card animates off screen to the left

**Design System Mapping**:
- Background: `error` or `destructive` color
- Icon: `onError` or `surface` color (white)
- Border: None (solid fill)

---

### 2. Info Button (Center Position)

**Purpose**: Display detailed information about the current card

**Visual Design**:
- **Shape**: Circular button
- **Size**: Approximately 56-64px diameter (touch target should be at least 44x44px for accessibility)
- **Background Color**: Use `primary` color from design system (typically a blue hue, matching Tinder's star button color)
- **Icon**: Information icon (typically "i" in a circle or "information-outline")
- **Icon Color**: White or `onPrimary` color (high contrast against primary background)
- **Icon Size**: Approximately 24-28px

**States**:
- **Default**: Full opacity, standard size
- **Pressed**: Slight scale down (0.95x) with opacity reduction to 0.8
- **Disabled**: Reduced opacity (0.5), non-interactive

**Interaction**:
- Triggers haptic feedback (light impact) on press
- Opens modal or detail view showing full card information
- Does not trigger a swipe action

**Design System Mapping**:
- Background: `primary` color
- Icon: `onPrimary` or `surface` color (white)
- Border: None (solid fill)

---

### 3. Heart Button (Like) - Right Position

**Purpose**: Like or accept the current card

**Visual Design**:
- **Shape**: Circular button
- **Size**: Approximately 56-64px diameter (touch target should be at least 44x44px for accessibility)
- **Background Color**: Use `success` color from design system (typically a green hue)
- **Icon**: Heart icon (filled or outline, typically filled)
- **Icon Color**: White or `onSuccess` color (high contrast against success background)
- **Icon Size**: Approximately 24-28px

**States**:
- **Default**: Full opacity, standard size
- **Pressed**: Slight scale down (0.95x) with opacity reduction to 0.8
- **Disabled**: Reduced opacity (0.5), non-interactive

**Interaction**:
- Triggers haptic feedback (light impact) on press
- Executes swipe-right/like action
- Card animates off screen to the right

**Design System Mapping**:
- Background: `success` color
- Icon: `onSuccess` or `surface` color (white)
- Border: None (solid fill)

---

## Common Design Principles

### Visual Hierarchy
- All three buttons share the same size and visual weight
- Center button (Info) may be slightly emphasized through color (primary) but maintains same size
- Buttons are equally spaced to create visual balance

### Accessibility
- Minimum touch target: 44x44px (iOS) / 48x48px (Android)
- High contrast between icon and background (WCAG AA minimum)
- Clear visual feedback on interaction
- Haptic feedback for tactile confirmation

### Animation & Feedback
- **Press Animation**: Scale down to 0.95x with 0.8 opacity, duration ~100ms
- **Release Animation**: Scale back to 1.0x with full opacity, duration ~100ms
- **Haptic Feedback**: Light impact on button press
- **Card Animation**: Triggered by Cross and Heart buttons only (not Info)

### Spacing & Layout
- Buttons arranged in horizontal row: [Cross] [Info] [Heart]
- Equal spacing between button centers: ~16-24px
- Container padding: 24px vertical, 16px horizontal
- Positioned above bottom navigation bar with appropriate spacing

### Color System Reference
- **Error/Destructive**: Used for Cross button (rejection)
- **Primary**: Used for Info button (information/action)
- **Success**: Used for Heart button (acceptance)
- **OnError/OnPrimary/OnSuccess**: White or light color for icons on colored backgrounds
- **Surface**: Alternative icon color option (white)

### Disabled State
- All buttons: 0.5 opacity
- No haptic feedback
- No interaction possible
- Visual indication that action is not available

## Implementation Notes

1. **Button Order**: Left to right: Cross → Info → Heart
2. **Responsive**: Buttons should maintain size and spacing across different screen sizes
3. **Platform Considerations**: 
   - iOS: Use native haptic feedback
   - Android: Use vibration API for haptic feedback
4. **Icon Library**: Use consistent icon library (Material Icons, Feather, etc.)
5. **State Management**: Buttons should be disabled during card animations or when no card is available

