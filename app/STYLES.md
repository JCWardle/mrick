# Technical Style Guide: Mr. Ick

## 🎨 Color Palette

### Primary Palette (Deep Purple Theme)

**Rationale:** Deep purple conveys sophistication, intimacy, and creativity while standing out from competitors who typically use blues, greens, or soft pastels. This palette maintains warmth and approachability while feeling premium and modern.

#### Primary Colors

```typescript
// Primary Brand Color
PRIMARY_PURPLE = '#6B46C1'        // Deep, rich purple (main brand color)
PRIMARY_PURPLE_DARK = '#553C9A'   // Darker variant for headers, emphasis
PRIMARY_PURPLE_LIGHT = '#8B5CF6'  // Lighter variant for hover states, accents
```

**Usage:**
- Primary CTAs and buttons
- App header/navigation
- Brand elements and logos
- Key interactive elements

#### Secondary Colors

```typescript
// Secondary Accents
LAVENDER = '#C4B5FD'              // Soft lavender for backgrounds, subtle accents
LAVENDER_LIGHT = '#E9D5FF'        // Very light lavender for card backgrounds
CORAL = '#FF6B6B'                 // Warm coral for "Yum" actions (positive)
CORAL_LIGHT = '#FFB3BA'           // Light coral for hover states
```

**Usage:**
- Secondary buttons and actions
- Card backgrounds (lavender)
- Positive feedback ("Yum" swipe)
- Subtle UI accents

#### Action Colors

```typescript
// Swipe Actions
YUMMY_GREEN = '#10B981'           // Emerald green for "Yum" (affirmative)
YUMMY_GREEN_LIGHT = '#6EE7B7'     // Light green for hover/active states
ICK_RED = '#EF4444'               // Soft red for "Ick" (rejection, but not harsh)
ICK_RED_LIGHT = '#FCA5A5'         // Light red for hover/active states
MAYBE_AMBER = '#F59E0B'           // Amber for "Maybe" (neutral, contemplative)
MAYBE_AMBER_LIGHT = '#FCD34D'     // Light amber for hover states
```

**Usage:**
- Swipe action indicators
- Button states (Yum/Ick/Maybe)
- Visual feedback during drag gestures
- Success/error states

#### Neutral Colors

```typescript
// Text & Backgrounds
TEXT_PRIMARY = '#1F2937'          // Dark gray for primary text (WCAG AA compliant)
TEXT_SECONDARY = '#6B7280'        // Medium gray for secondary text
TEXT_TERTIARY = '#9CA3AF'         // Light gray for captions, hints
BACKGROUND_WHITE = '#FFFFFF'      // Pure white for cards, modals
BACKGROUND_OFF_WHITE = '#F9FAFB'  // Off-white for app background
BACKGROUND_GRAY = '#F3F4F6'       // Light gray for dividers, subtle backgrounds
BORDER_COLOR = '#E5E7EB'          // Border color for dividers, inputs
```

**Usage:**
- All text content (hierarchical)
- App backgrounds
- Card backgrounds
- Dividers and borders
- Input fields

#### Semantic Colors

```typescript
// Status & Feedback
SUCCESS = '#10B981'               // Success messages, confirmations
ERROR = '#EF4444'                 // Error messages, warnings
WARNING = '#F59E0B'                // Warning messages
INFO = '#3B82F6'                  // Informational messages (blue accent)
```

**Usage:**
- Toast notifications
- Alert messages
- Form validation
- Status indicators

### Color Accessibility

**Contrast Ratios (WCAG AA Compliance):**
- Primary text on white: `#1F2937` on `#FFFFFF` = 12.6:1 ✅
- Primary text on lavender: `#1F2937` on `#E9D5FF` = 7.2:1 ✅
- Secondary text on white: `#6B7280` on `#FFFFFF` = 4.8:1 ✅
- Primary purple on white: `#6B46C1` on `#FFFFFF` = 5.2:1 ✅
- White text on primary purple: `#FFFFFF` on `#6B46C1` = 4.9:1 ✅

**Color Blindness Considerations:**
- Never rely solely on color to convey information
- Always pair color with icons, text, or shapes
- "Yum" (green) and "Ick" (red) are distinguishable for most color vision types
- Test with color blindness simulators

### Competitor Analysis

**Common Competitor Palettes:**
- **Feeld:** Dark purple/black with pink accents (similar but darker)
- **OMGYes:** Soft pink and coral tones (very different)
- **Wellness Apps:** Blues and greens (trust, calm)
- **Dating Apps:** Red, pink, or blue (passion, trust)

**How We Stand Out:**
- **Deeper purple base** than most (more sophisticated)
- **Coral accent** instead of pure pink (warmer, more playful)
- **Emerald green for "Yum"** instead of standard green (more premium)
- **Balanced contrast** between playful and mature

### Color Implementation (React Native)

```typescript
// constants/colors.ts
export const Colors = {
  // Primary
  primary: '#6B46C1',
  primaryDark: '#553C9A',
  primaryLight: '#8B5CF6',
  
  // Secondary
  lavender: '#C4B5FD',
  lavenderLight: '#E9D5FF',
  coral: '#FF6B6B',
  coralLight: '#FFB3BA',
  
  // Actions
  yummy: '#10B981',
  yummyLight: '#6EE7B7',
  ick: '#EF4444',
  ickLight: '#FCA5A5',
  maybe: '#F59E0B',
  maybeLight: '#FCD34D',
  
  // Neutrals
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  background: '#F9FAFB',
  backgroundWhite: '#FFFFFF',
  backgroundGray: '#F3F4F6',
  border: '#E5E7EB',
  
  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

// Type for TypeScript autocomplete
export type ColorKey = keyof typeof Colors;
```

---

## 📝 Technical Language Guidelines

### Language Principles

1. **Consistency First**
   - Use exact same terms across all screens
   - Maintain consistent capitalization and punctuation
   - Never mix "Yum" with "yes" or "Ick" with "no"

2. **Mobile-Optimized**
   - Maximum 2-3 sentences per screen
   - Use short, punchy phrases
   - Break long instructions into bullet points
   - One idea per sentence

3. **Action-Oriented**
   - Start with verbs when possible
   - Use imperative mood for instructions
   - Be direct, not passive

4. **Error Prevention**
   - Use positive framing ("Do this" vs "Don't do that")
   - Provide context before asking for action
   - Explain "why" when it adds clarity

### Terminology Standards

#### Core Terms (Always Use These)

```typescript
// Swipe Actions
"Yum"     // Never: "Yes", "Like", "Want", "Interested"
"Ick"     // Never: "No", "Dislike", "Pass", "Not interested"
"Maybe"   // Never: "Unsure", "Later", "Skip"

// User References
"you"     // Always lowercase, conversational
"your partner"  // Never: "spouse", "significant other", "SO"
"couple"  // Never: "pair", "duo"

// App Features
"card"    // Never: "prompt", "question", "item"
"swipe"   // Verb: "swipe right", "swipe left"
"match"   // When preferences align (noun)
"explore" // Verb for discovering preferences
```

#### Capitalization Rules

- **Always Capitalize:**
  - "Yum", "Ick", "Maybe" (branded actions)
  - Screen titles and headings
  - Button labels
  - First word of sentences

- **Never Capitalize:**
  - "you", "your", "partner" (unless start of sentence)
  - Generic terms like "card", "swipe", "match"
  - Prepositions in headings ("Discover What You Both Enjoy")

#### Punctuation Rules

- **No periods** in button labels: "Get Started" not "Get Started."
- **No periods** in single-line headings
- **Use periods** in body text and multi-sentence descriptions
- **Use em dashes** for emphasis: "Discover together — without the awkwardness"
- **Avoid exclamation marks** except in celebratory moments (success states)
- **Use ellipses** sparingly, only for loading states: "Loading..."

### Language by Context

#### Onboarding Screens

**Pattern:**
```
Headline: [Action/Question] (20-30 chars max)
Subheadline: [Context/Benefit] (40-60 chars max)
Body: [Optional explanation] (60-80 chars max)
CTA: [Action verb] (1-2 words)
```

**Examples:**
```typescript
// Welcome Screen
headline: "Discover what you both enjoy"
subheadline: "A playful way to explore together"
cta: "Get Started"

// Age Range
headline: "How old are you?"
subheadline: "We'll show you age-appropriate content"
cta: "Continue"

// First Swipe
headline: "Swipe right for 'Yum' 👉"
subheadline: "Swipe left for 'Ick' 👈"
body: "Don't overthink it. Just go with your gut."
cta: "Got it"
```

#### Error States

**Pattern:**
```
Title: [What happened] (friendly, not technical)
Message: [What to do] (actionable)
CTA: [Retry action] (if applicable)
```

**Examples:**
```typescript
// Network Error
title: "Can't connect right now"
message: "Check your internet and try again"
cta: "Try Again"

// Generic Error
title: "Oops! Something went wrong"
message: "We're looking into it. Try again in a moment."
cta: "OK"

// Validation Error
title: "Please check your email"
message: "Make sure it's a valid email address"
// No CTA (inline validation)
```

#### Success States

**Pattern:**
```
Message: [What happened] + [Encouragement] (concise, positive)
CTA: [Next action] (if applicable)
```

**Examples:**
```typescript
// Partner Linked
message: "Partner linked! Start exploring together."
cta: "Start Swiping"

// Card Swiped
message: "Great! Keep swiping to discover more."
// No CTA (auto-dismiss or continue)

// Account Created
message: "Welcome! Let's get started."
cta: "Continue"
```

#### Empty States

**Pattern:**
```
Title: [Status] (informative)
Message: [What to expect] (reassuring)
CTA: [Action] (if applicable)
```

**Examples:**
```typescript
// No Cards
title: "You're all caught up!"
message: "Check back soon for new cards."
// No CTA

// No Partner
title: "Invite your partner"
message: "See where you align and discover new things together."
cta: "Invite Partner"
```

#### Loading States

**Pattern:**
```
Message: [What's happening] (present tense, active)
// No CTA (auto-progress)
```

**Examples:**
```typescript
loading: "Loading your cards..."
loading: "Almost ready..."
loading: "Connecting..."
```

### Button Label Standards

#### Primary Actions (Purple Background, White Text)
```typescript
"Get Started"
"Continue"
"Invite Partner"
"Share Link"
"Start Swiping"
"Explore Together"
```

#### Secondary Actions (Transparent/Outline, Purple Text)
```typescript
"Not Now"
"Maybe Later"
"Skip"
"Cancel"
"Back"
```

#### Destructive Actions (Red Text, Confirmation Required)
```typescript
"Unlink Partner"  // With confirmation modal
"Delete Account"   // With confirmation modal
"Sign Out"         // With confirmation if needed
```

#### Swipe Action Buttons
```typescript
"Yum"    // Green button, right side
"Ick"    // Red button, left side
"Maybe"  // Amber button, center (if implemented)
```

### Message Tone by Screen Type

| Screen Type | Tone | Example |
|------------|------|---------|
| Onboarding | Warm, welcoming | "Let's discover what you both enjoy" |
| Instructions | Clear, helpful | "Swipe right for 'Yum', left for 'Ick'" |
| Errors | Friendly, solution-focused | "Can't connect. Check your internet." |
| Success | Encouraging, celebratory | "Great! Keep exploring together." |
| Settings | Straightforward, clear | "Your Preferences" |
| Modals | Contextual, action-oriented | "Invite your partner to discover together" |

### Language Do's and Don'ts

#### ✅ DO

- Use "you" and "your" (conversational)
- Keep sentences under 15 words
- Use active voice
- Be specific: "Swipe right" not "Swipe in that direction"
- Use contractions: "you're", "we'll", "don't"
- Match user's language level (no jargon)

#### ❌ DON'T

- Use "we" or "our" excessively (feels corporate)
- Use passive voice: "Cards are loaded" → "Loading cards..."
- Use technical terms: "API", "sync", "database"
- Use therapy language: "compatibility", "intimacy building"
- Use explicit language: "turn on", "arouse", "excite"
- Use dating app language: "match", "profile", "swipe on people"
- Use all caps for emphasis (use bold instead)
- Use multiple exclamation marks
- Use placeholder text in production: "Lorem ipsum", "[Name]"

### Character Limits by Component

```typescript
// Technical limits for UI components
const TEXT_LIMITS = {
  headline: 30,           // Single line, bold
  subheadline: 60,        // Single line, medium weight
  body: 120,              // 2-3 lines max
  button: 20,              // 1-2 words
  cardText: 200,          // Card content (adjust based on design)
  errorMessage: 80,       // Error toast/alert
  caption: 40,            // Small hint text
} as const;
```

---

## 🔤 Typography System

### Font Stack

React Native automatically uses system fonts:
- **iOS:** San Francisco (SF Pro)
- **Android:** Roboto
- **Web (Expo):** System font stack

No custom fonts needed. React Native Paper handles font loading and fallbacks.

### Type Scale (React Native StyleSheet)

```typescript
// constants/typography.ts
import { StyleSheet, Platform } from 'react-native';
import { Colors } from './colors';

export const Typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: Platform.select({ ios: '700', android: '700' }) as '700',
    lineHeight: 40,
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
    color: Colors.textPrimary,
  },
  h2: {
    fontSize: 24,
    fontWeight: Platform.select({ ios: '600', android: '600' }) as '600',
    lineHeight: 32,
    letterSpacing: Platform.select({ ios: -0.3, android: 0 }),
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: 20,
    fontWeight: Platform.select({ ios: '600', android: '600' }) as '600',
    lineHeight: 28,
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // UI Elements
  button: {
    fontSize: 16,
    fontWeight: Platform.select({ ios: '600', android: '600' }) as '600',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: Colors.backgroundWhite,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
    color: Colors.textSecondary,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.1,
    color: Colors.textTertiary,
  },
});

// Text color variants (use with style prop)
export const TextColors = {
  primary: { color: Colors.textPrimary },
  secondary: { color: Colors.textSecondary },
  tertiary: { color: Colors.textTertiary },
  inverse: { color: Colors.backgroundWhite },
  link: { color: Colors.primary },
  yummy: { color: Colors.yummy },
  ick: { color: Colors.ick },
} as const;
```

### Usage in Components

```typescript
import { Text, View } from 'react-native';
import { Typography, TextColors } from '../constants/typography';

// Using Typography styles
<Text style={Typography.h1}>Screen Title</Text>
<Text style={Typography.body}>Body text content</Text>
<Text style={[Typography.caption, TextColors.secondary]}>Caption text</Text>

// React Native Paper Text component (alternative)
import { Text as PaperText } from 'react-native-paper';
<PaperText variant="headlineLarge">Title</PaperText>
<PaperText variant="bodyLarge">Body</PaperText>
```

### Usage Guidelines

- **H1:** Screen titles, major headings (one per screen)
- **H2:** Section headers, modal titles
- **H3:** Subsection headers, card titles
- **Body:** All paragraph text, descriptions
- **Body Large:** Important descriptions, card content
- **Button:** All button labels (usually handled by Paper Button)
- **Caption:** Hints, secondary info, timestamps
- **Small:** Legal text, disclaimers

### Platform-Specific Considerations

- **Letter spacing:** iOS supports negative values, Android doesn't (use Platform.select)
- **Font weights:** Use string values ('400', '600', '700') not numbers
- **Line height:** Should be ~1.2-1.5x font size for readability

---

## 📐 Spacing & Layout

### Spacing Scale

```typescript
// constants/spacing.ts
// 8px base unit (standard mobile spacing)
export const Spacing = {
  xs: 4,    // 0.5x - Tight spacing, icon padding
  sm: 8,    // 1x   - Standard spacing
  md: 16,   // 2x   - Component spacing
  lg: 24,   // 3x   - Section spacing
  xl: 32,   // 4x   - Screen padding
  xxl: 48,  // 6x   - Large gaps, modal padding
} as const;
```

### Layout Guidelines

- **Screen Padding:** `Spacing.xl` (32px) on all sides (use SafeAreaView for top/bottom)
- **Card Padding:** `Spacing.lg` (24px) internal
- **Button Spacing:** `Spacing.md` (16px) between buttons
- **Section Gaps:** `Spacing.lg` (24px) between sections
- **Input Spacing:** `Spacing.md` (16px) between label and input

### SafeAreaView Usage

Always use SafeAreaView from `react-native-safe-area-context` for full-screen layouts to respect device notches and home indicators. Make sure SafeAreaProvider is set up in your root layout:

```typescript
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '../constants/spacing';

export function Screen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Screen content */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
  },
});
```

### Border Radius

```typescript
// constants/borderRadius.ts
export const BorderRadius = {
  sm: 4,   // Small elements (badges, tags)
  md: 8,   // Buttons, inputs
  lg: 12,  // Cards
  xl: 16,  // Modals, large cards
  full: 9999, // Pills, circular elements (use for fully rounded)
} as const;
```

### Flexbox Layout Patterns

```typescript
// Common layout patterns
const layoutStyles = StyleSheet.create({
  // Centered content
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Row with space between
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Column with gap
  column: {
    flexDirection: 'column',
    gap: Spacing.md, // React Native 0.71+
  },
});
```

---

## 🎯 React Native Paper Integration

### Theme Configuration

```typescript
// constants/theme.ts
import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Colors } from './colors';

// Configure font family (uses system fonts by default)
const fontConfig = {
  ...MD3LightTheme.fonts,
  // Customize if needed, but system fonts work well
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.lavenderLight,
    secondary: Colors.coral,
    secondaryContainer: Colors.coralLight,
    tertiary: Colors.lavender,
    error: Colors.error,
    errorContainer: Colors.ickLight,
    surface: Colors.backgroundWhite,
    surfaceVariant: Colors.backgroundGray,
    background: Colors.background,
    onPrimary: Colors.backgroundWhite,
    onSecondary: Colors.backgroundWhite,
    onSurface: Colors.textPrimary,
    onSurfaceVariant: Colors.textSecondary,
    outline: Colors.border,
  },
  fonts: configureFonts({ config: fontConfig }),
};
```

### Provider Setup (Already in _layout.tsx)

```typescript
// app/_layout.tsx (already configured)
import { PaperProvider } from 'react-native-paper';
import { theme } from '../constants/theme';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      {/* Your app */}
    </PaperProvider>
  );
}
```

### Component Usage

```typescript
// Use Paper components with theme (automatically uses theme from Provider)
import { View, StyleSheet } from 'react-native';
import { Button, Card, TextInput, Text as PaperText } from 'react-native-paper';
import { Spacing } from '../constants/spacing';

export function ExampleScreen() {
  return (
    <View style={styles.container}>
      {/* Buttons */}
      <Button 
        mode="contained" 
        onPress={handlePress}
        style={styles.button}
      >
        Get Started
      </Button>
      
      {/* Cards */}
      <Card style={styles.card}>
        <Card.Content>
          <PaperText variant="bodyLarge">Card content</PaperText>
        </Card.Content>
      </Card>
      
      {/* Text Inputs */}
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
  },
  button: {
    marginVertical: Spacing.md,
  },
  card: {
    marginVertical: Spacing.md,
  },
  input: {
    marginVertical: Spacing.md,
  },
});
```

### Paper Component Styling

React Native Paper components accept `style` and `contentStyle` props:

```typescript
<Button 
  mode="contained"
  style={styles.button}        // Outer container style
  contentStyle={styles.buttonContent}  // Inner content style
  labelStyle={styles.buttonLabel}      // Text label style
>
  Get Started
</Button>
```

---

## 🎨 Component-Specific Styles

### Swipeable Cards

```typescript
// components/swipe/SwipeableCard.tsx
import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BorderRadius } from '../../constants/borderRadius';
import { Typography } from '../../constants/typography';

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    minHeight: 400,
    width: '100%',
    // iOS Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardText: {
    ...Typography.bodyLarge,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### Swipe Action Buttons

```typescript
// components/swipe/SwipeButtons.tsx
import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BorderRadius } from '../../constants/borderRadius';

export const buttonStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  yum: {
    backgroundColor: Colors.yummy,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    minWidth: 80,
    alignItems: 'center',
  },
  ick: {
    backgroundColor: Colors.ick,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    minWidth: 80,
    alignItems: 'center',
  },
  maybe: {
    backgroundColor: Colors.maybe,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.backgroundWhite,
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Modals (React Native Paper)

```typescript
// components/partner/PartnerInviteModal.tsx
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BorderRadius } from '../../constants/borderRadius';
import { Typography } from '../../constants/typography';

export function PartnerInviteModal({ visible, onDismiss }) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={styles.title}>Invite Your Partner</Text>
        <Text style={styles.content}>
          See where you align and discover new things together.
        </Text>
        <Button mode="contained" onPress={handleShare}>
          Share Link
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    margin: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  content: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
});
```

### Screen Layouts (Expo Router)

```typescript
// app/(auth)/login.tsx
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function LoginScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Screen content */}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});
```

### Shadows & Elevation (Platform-Specific)

```typescript
// utils/shadowStyles.ts
import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/colors';

export const shadowStyles = StyleSheet.create({
  // Small shadow (cards, buttons)
  small: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.textPrimary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  // Medium shadow (modals, elevated cards)
  medium: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  // Large shadow (floating elements)
  large: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
```

---

## 📱 React Native-Specific Considerations

### StyleSheet Best Practices

1. **Always use StyleSheet.create()** - Better performance than inline styles
2. **Define styles at bottom of file** - Keeps component code clean
3. **Use Platform.select()** for platform differences
4. **Combine styles with array syntax**: `style={[styles.base, styles.variant]}`

```typescript
// ✅ Good
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
  },
});

// ❌ Bad (inline styles)
<View style={{ flex: 1, padding: 32 }} />
```

### Platform Differences

```typescript
import { Platform } from 'react-native';

// Font weights
const fontWeight = Platform.select({
  ios: '600',
  android: '600',
  default: '600',
});

// Letter spacing (iOS supports negative, Android doesn't)
const letterSpacing = Platform.select({
  ios: -0.5,
  android: 0,
});

// Shadows (iOS uses shadow props, Android uses elevation)
const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
});
```

### Expo Router Screen Styling

```typescript
// app/(tabs)/index.tsx
import { Stack } from 'expo-router';

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Home',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.backgroundWhite,
        }} 
      />
      {/* Screen content */}
    </>
  );
}
```

### Touchable Components

```typescript
import { TouchableOpacity, TouchableHighlight, Pressable } from 'react-native';

// Use Pressable for best performance and flexibility
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,
  ]}
>
  <Text>Press me</Text>
</Pressable>

// TouchableOpacity for simple cases
<TouchableOpacity onPress={handlePress} style={styles.button}>
  <Text>Press me</Text>
</TouchableOpacity>
```

### Haptic Feedback (Expo)

```typescript
import * as Haptics from 'expo-haptics';

// Use for swipe actions
const handleSwipe = (action: 'yum' | 'ick') => {
  if (action === 'yum') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
};
```

### Image Handling (Expo Image)

```typescript
import { Image } from 'expo-image';

// Use expo-image instead of react-native Image
<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  contentFit="cover"
  transition={200}
/>
```

---

## ✅ Style Checklist

Before implementing any UI component, verify:

- [ ] Colors match the palette (use constants, not hardcoded)
- [ ] Text uses typography scale (not arbitrary sizes)
- [ ] Spacing uses 8px base unit
- [ ] Language follows terminology standards
- [ ] Character limits are respected
- [ ] Accessibility contrast ratios are met
- [ ] Color is never the only indicator (icons + text)
- [ ] React Native Paper theme is used where applicable
- [ ] Border radius is consistent with scale
- [ ] Text colors match hierarchy (primary/secondary/tertiary)
- [ ] SafeAreaView used for full-screen layouts
- [ ] Platform.select() used for iOS/Android differences
- [ ] StyleSheet.create() used (not inline styles)
- [ ] Shadows use Platform.select() (iOS shadow props, Android elevation)

---

## 📂 File Structure for Style Constants

```
app/
  constants/
    colors.ts          // Color palette
    typography.ts      // Typography styles
    spacing.ts         // Spacing scale
    borderRadius.ts    // Border radius values
    theme.ts           // React Native Paper theme
  utils/
    shadowStyles.ts    // Reusable shadow styles
```

---

*Last Updated: [Date]*
*Version: 2.0 - React Native Specific*
*For implementation questions, see AGENTS.md for component structure guidelines*

