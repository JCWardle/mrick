# Instagram Login Screen Design System

## Layout Structure

The login screen follows a vertical, centered layout structure from top to bottom:

1. **Top Section**: Status bar (excluded from design system)
2. **Logo Section**: Centered Instagram logo with generous top spacing
3. **Form Section**: Two input fields stacked vertically with consistent spacing
4. **Action Section**: Primary login button, followed by secondary link
5. **Secondary Action Section**: Outlined button for account creation
6. **Branding Section**: Small text indicating parent company
7. **Footer Section**: Dark bar with app branding and attribution

## Common Components

### Logo Component
- **Position**: Centered horizontally, positioned near top of content area
- **Size**: Large (approximately 80-100px square)
- **Style**: Square with rounded corners, contains gradient icon (purple, pink, orange, yellow)
- **Spacing**: Generous top margin, moderate bottom margin

### Text Input Fields
- **Layout**: Stacked vertically with consistent spacing between
- **Background**: `backgroundWhite` (#FFFFFF)
- **Border**: Light gray (`border` - #E5E7EB), 1px solid
- **Border Radius**: `BorderRadius.md` (8px)
- **Padding**: Horizontal `Spacing.md` (16px), vertical `Spacing.sm` (8px)
- **Placeholder Text**: `textSecondary` (#6B7280), `Typography.body` (16px, 400 weight)
- **Text Color**: `textPrimary` (#1F2937)
- **Height**: Approximately 48-52px

### Primary Button (Log in)
- **Position**: Full width, directly below input fields
- **Background**: `info` (#3B82F6) - blue
- **Text**: `Typography.button` (16px, 600 weight, white)
- **Border Radius**: `BorderRadius.md` (8px)
- **Padding**: Vertical `Spacing.md` (16px)
- **Spacing**: Top margin `Spacing.lg` (24px) from inputs

### Text Link (Forgot password?)
- **Position**: Centered, directly below primary button
- **Text**: `Typography.body` (16px, 400 weight)
- **Color**: `textSecondary` (#6B7280)
- **Spacing**: Top margin `Spacing.md` (16px)

### Secondary Button (Create new account)
- **Position**: Full width, centered
- **Background**: `backgroundWhite` (#FFFFFF)
- **Border**: `info` (#3B82F6), 1px solid
- **Text**: `Typography.button` (16px, 600 weight) with `info` color (#3B82F6)
- **Border Radius**: `BorderRadius.md` (8px)
- **Padding**: Vertical `Spacing.md` (16px)
- **Spacing**: Top margin `Spacing.xl` (32px) from previous element

### Branding Text (∞ Meta)
- **Position**: Centered, below secondary button
- **Text**: `Typography.caption` (14px, 400 weight)
- **Color**: `textSecondary` (#6B7280)
- **Spacing**: Top margin `Spacing.lg` (24px)

### Footer Bar
- **Position**: Fixed at bottom of screen
- **Background**: Dark gray (approximately `textPrimary` - #1F2937 or darker)
- **Height**: Approximately 48-56px
- **Content**: Left-aligned app logo + name, right-aligned attribution text
- **Text Color**: `backgroundWhite` (#FFFFFF)
- **Padding**: Horizontal `Spacing.xl` (32px), vertical `Spacing.md` (16px)

## Color Patterns

### Background
- **Main Background**: Subtle gradient from light orange/pink (top-left) to light blue/purple (bottom-right)
  - Note: This is a custom gradient not in the current color system
  - Could use: `lavenderLight` (#E9D5FF) to `coralLight` (#FFB3BA) gradient
  - Alternative: Light version using `background` (#F9FAFB) with gradient overlay

### Input Fields
- **Background**: `backgroundWhite` (#FFFFFF)
- **Border**: `border` (#E5E7EB)
- **Text**: `textPrimary` (#1F2937)
- **Placeholder**: `textSecondary` (#6B7280)

### Primary Action
- **Button Background**: `info` (#3B82F6)
- **Button Text**: `backgroundWhite` (#FFFFFF)

### Secondary Action
- **Button Background**: `backgroundWhite` (#FFFFFF)
- **Button Border**: `info` (#3B82F6)
- **Button Text**: `info` (#3B82F6)

### Links
- **Text Color**: `textSecondary` (#6B7280)

### Footer
- **Background**: `textPrimary` (#1F2937) or darker
- **Text**: `backgroundWhite` (#FFFFFF)

## Spacing Patterns

### Vertical Spacing (Top to Bottom)
- **Logo to Inputs**: `Spacing.xxl` (48px) or larger
- **Between Input Fields**: `Spacing.md` (16px)
- **Inputs to Primary Button**: `Spacing.lg` (24px)
- **Primary Button to Link**: `Spacing.md` (16px)
- **Link to Secondary Button**: `Spacing.xl` (32px)
- **Secondary Button to Branding**: `Spacing.lg` (24px)

### Horizontal Spacing
- **Screen Padding**: `Spacing.xl` (32px) on left and right
- **Input Padding**: `Spacing.md` (16px) horizontal
- **Footer Padding**: `Spacing.xl` (32px) horizontal

## Typography Patterns

### Headings
- **Logo**: Not text-based, but positioned as primary visual element

### Body Text
- **Input Placeholders**: `Typography.body` (16px, 400 weight, `textSecondary`)
- **Input Text**: `Typography.body` (16px, 400 weight, `textPrimary`)
- **Link Text**: `Typography.body` (16px, 400 weight, `textSecondary`)

### Buttons
- **Primary Button**: `Typography.button` (16px, 600 weight, white)
- **Secondary Button**: `Typography.button` (16px, 600 weight, blue)

### Captions
- **Branding Text**: `Typography.caption` (14px, 400 weight, `textSecondary`)
- **Footer Text**: `Typography.caption` (14px, 400 weight, `backgroundWhite`)

## Layout Principles

### Alignment
- **Horizontal**: All content centered except footer (left/right aligned)
- **Vertical**: Content flows top to bottom with consistent spacing
- **Inputs**: Full width within screen padding
- **Buttons**: Full width within screen padding

### Hierarchy
1. **Primary**: Logo (visual anchor)
2. **Secondary**: Input fields (main interaction)
3. **Tertiary**: Primary action button (blue, prominent)
4. **Quaternary**: Secondary actions (links, outlined button)

### Visual Weight
- **Heavy**: Primary button (solid blue background)
- **Medium**: Input fields (white with border)
- **Light**: Links and secondary button (outlined, minimal)

### Interaction States
- **Input Fields**: Should have focus state (border color change to `info` - #3B82F6)
- **Buttons**: Should have pressed/active states (slight opacity change or darker shade)
- **Links**: Should have pressed state (underline or color change)

### Accessibility
- **Touch Targets**: All interactive elements minimum 44x44px
- **Contrast**: Text meets WCAG AA standards (white on blue, dark on light)
- **Spacing**: Adequate spacing between interactive elements to prevent mis-taps

