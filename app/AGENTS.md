# Agent Guidelines for Mr. Ick

## Component Library
Use **React Native Paper** for all UI components (buttons, modals, inputs, cards, etc.).

- Install: `npm install react-native-paper react-native-vector-icons`
- Import pattern: `import { Button, Modal, TextInput } from 'react-native-paper'`
- Use Paper components instead of custom styled components when possible
- For swipeable cards, use custom implementation with `react-native-reanimated` + `react-native-gesture-handler` (already installed)

## File Structure
Organize code into focused, single-responsibility files:

```
app/
  (auth)/
    login.tsx
    age-range.tsx
  (swipe)/
    index.tsx
components/
  swipe/
    SwipeableCard.tsx
    CardStack.tsx
    SwipeButtons.tsx
  auth/
    LoginForm.tsx
    AgeRangeSelector.tsx
  partner/
    PartnerInviteModal.tsx
hooks/
  useSwipeGesture.ts
  useCardStack.ts
  useAuth.ts
utils/
  cardData.ts
  animations.ts
constants/
  swipeThresholds.ts
```

## Principles

### ✅ Good: Small, focused files
- `components/swipe/SwipeableCard.tsx` - Only card component
- `hooks/useSwipeGesture.ts` - Only gesture logic

### ❌ Bad: Monolithic files
- `components/SwipeScreen.tsx` - Contains card, buttons, stack, and logic
- `utils/helpers.ts` - All utility functions mixed together

### ✅ Good: Clear naming
- `SwipeableCard.tsx` - Component name matches file
- `useSwipeGesture.ts` - Hook prefix, descriptive name
- `SWIPE_THRESHOLD_X` - Constants in UPPER_SNAKE_CASE

### ❌ Bad: Vague naming
- `Card.tsx` - Too generic
- `swipe.ts` - Unclear if component, hook, or type
- `threshold` - Constant without prefix

### ✅ Good: Types inline in files
```typescript
// components/swipe/SwipeableCard.tsx
type SwipeAction = 'yum' | 'ick' | 'maybe';

interface Card {
  id: string;
  text: string;
}

export function SwipeableCard({ card }: { card: Card }) {
  // Component implementation
}
```

### ❌ Bad: Separate types folder
```typescript
// types/card.ts - Don't create separate type files
export type SwipeAction = 'yum' | 'ick' | 'maybe';
```

### ✅ Good: Reusable hooks with inline types
```typescript
// hooks/useSwipeGesture.ts
type SwipeAction = 'yum' | 'ick' | 'maybe';

export function useSwipeGesture(onSwipe: (action: SwipeAction) => void) {
  // Gesture logic
}
```

### ❌ Bad: Logic in components
```typescript
// In component
const panResponder = PanResponder.create({...}) // 100+ lines
```

### ✅ Good: Props drilling over Context
```typescript
// Pass data via props
function SwipeScreen({ cards, onSwipe }: { cards: Card[], onSwipe: (action: SwipeAction) => void }) {
  return <CardStack cards={cards} onSwipe={onSwipe} />
}
```

### ❌ Bad: Context for everything
```typescript
// Don't create Context for card state, UI state, etc.
const CardContext = createContext() // Only use for auth
```

### ✅ Good: Context only for authentication
- Use `useContext` only for authentication state
- Pass all other data via props
- Use hooks for shared logic, not Context

## Component Structure
1. **Screens** (`app/`) - Route handlers, minimal logic
2. **Components** (`components/`) - Reusable UI, props-based
3. **Hooks** (`hooks/`) - Stateful logic, side effects
4. **Utils** (`utils/`) - Pure functions, no React
5. **Types** - Define inline in the same file where they're used

## When Adding Features
- Create new file for each component/hook
- Define types inline in the same file where they're used
- Keep files under 200 lines
- One component/hook per file
- Use barrel exports (`index.ts`) only for convenience, not required

