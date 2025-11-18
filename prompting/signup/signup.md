# Signup Screen Design System

## Layout Structure

The signup screen follows a vertical, scrollable layout structure from top to bottom:

1. **Top Section**: Status bar (excluded from design system) with navigation control (back arrow or close button)
2. **Header Section**: Title text ("Create an Account", "Sign up", or "Welcome to [App Name]")
3. **Form Section**: Email and password input fields stacked vertically with consistent spacing
4. **Password Requirements Section**: Optional password strength indicator or requirement text
5. **Terms Section**: Terms of service and privacy policy agreement text with clickable links
6. **Primary Action Section**: Main signup/continue button
7. **Separator Section**: Optional "or" divider with horizontal line
8. **Social Login Section**: Google and Apple login buttons stacked vertically
9. **Footer Section**: Optional dark bar with app branding and attribution

## Common Components

### Navigation Control
- **Position**: Top-left corner, below status bar
- **Type**: Back arrow (left-pointing chevron) or close button (X icon)
- **Size**: Touch target minimum 44x44px
- **Color**: `textPrimary` (#1F2937) or `textSecondary` (#6B7280)
- **Function**: Returns user to welcome page
- **Spacing**: Top margin `Spacing.md` (16px), left margin `Spacing.lg` (24px)

### Header Title
- **Position**: Below navigation control, left-aligned or centered
- **Text**: "Create an Account", "Sign up", or "Welcome to [App Name]"
- **Typography**: `Typography.h1` (32px, 700 weight, `textPrimary`)
- **Spacing**: Top margin `Spacing.xl` (32px), bottom margin `Spacing.lg` (24px)
- **Padding**: Horizontal `Spacing.xl` (32px)

### Email Input Field
- **Layout**: Full width within screen padding
- **Label**: "Email" or "Email*" above input field
- **Label Typography**: `Typography.body` (16px, 400 weight, `textSecondary`)
- **Label Spacing**: Bottom margin `Spacing.xs` (4px)
- **Background**: `backgroundWhite` (#FFFFFF)
- **Border**: `border` (#E5E7EB), 1px solid
- **Border Radius**: `BorderRadius.md` (8px)
- **Padding**: Horizontal `Spacing.md` (16px), vertical `Spacing.sm` (12px)
- **Text Color**: `textPrimary` (#1F2937)
- **Typography**: `Typography.body` (16px, 400 weight)
- **Height**: Approximately 48-52px
- **Validation Icon**: Optional green checkmark on right side when valid (using `success` - #10B981)
- **Spacing**: Bottom margin `Spacing.md` (16px) to next field

### Password Input Field
- **Layout**: Full width within screen padding
- **Label**: "Password" or "Password*" above input field
- **Label Typography**: `Typography.body` (16px, 400 weight, `textSecondary`)
- **Label Spacing**: Bottom margin `Spacing.xs` (4px)
- **Background**: `backgroundWhite` (#FFFFFF)
- **Border**: `border` (#E5E7EB), 1px solid
- **Border Radius**: `BorderRadius.md` (8px)
- **Padding**: Horizontal `Spacing.md` (16px), vertical `Spacing.sm` (12px)
- **Text Color**: `textPrimary` (#1F2937)
- **Typography**: `Typography.body` (16px, 400 weight)
- **Height**: Approximately 48-52px
- **Right Icons**: 
  - Eye icon (toggle password visibility) - `textSecondary` (#6B7280)
  - Clear icon (X) - `textSecondary` (#6B7280)
  - Icons positioned on right side with `Spacing.sm` (8px) spacing between them
- **Spacing**: Bottom margin `Spacing.md` (16px) to next section

### Password Requirements/Strength Indicator
- **Position**: Below password field
- **Text**: "Passwords must contain at least 8 characters" or "Password strength"
- **Typography**: `Typography.caption` (14px, 400 weight, `textSecondary`)
- **Strength Indicator** (if shown):
  - Three horizontal bars representing strength
  - Active bars: `yummy` (#10B981) or `primary` (#6B46C1)
  - Inactive bars: `border` (#E5E7EB)
  - Strength label: "Strong", "Medium", "Weak" in `yummy` (#10B981) or `textSecondary` (#6B7280)
- **Spacing**: Top margin `Spacing.xs` (4px), bottom margin `Spacing.md` (16px)

### Terms and Conditions Text
- **Position**: Below password section, before primary button
- **Typography**: `Typography.caption` (14px, 400 weight, `textSecondary`)
- **Text**: "By signing up you are agreeing to our Terms of Service. View our Privacy Policy." or similar
- **Links**: "Terms of Service", "Privacy Policy", "Terms and Conditions" are clickable
- **Link Color**: `primary` (#6B46C1) or `info` (#3B82F6)
- **Link Style**: Underlined or colored text
- **Spacing**: Top margin `Spacing.md` (16px), bottom margin `Spacing.lg` (24px)
- **Padding**: Horizontal `Spacing.xl` (32px)

### Primary Signup Button
- **Position**: Full width, below terms section
- **Background**: `primary` (#6B46C1) or brand accent color (e.g., orange `maybe` - #F59E0B)
- **Text**: "Sign Up", "Continue", or "Create Account"
- **Typography**: `Typography.button` (16px, 600 weight, white)
- **Border Radius**: `BorderRadius.md` (8px) or `BorderRadius.lg` (12px)
- **Padding**: Vertical `Spacing.md` (16px)
- **Height**: Approximately 48-52px
- **Icon**: Optional right-pointing arrow icon in white
- **Spacing**: Top margin `Spacing.lg` (24px), bottom margin `Spacing.xl` (32px) if separator follows

### Separator ("or" Divider)
- **Position**: Between primary button and social login buttons
- **Layout**: Horizontal line with centered "or" text
- **Line**: `border` (#E5E7EB), 1px solid, extends across width with padding
- **Text**: "or" centered on line
- **Text Background**: `background` (#F9FAFB) or `backgroundWhite` (#FFFFFF) to cover line
- **Text Typography**: `Typography.caption` (14px, 400 weight, `textSecondary`)
- **Text Padding**: Horizontal `Spacing.sm` (8px)
- **Spacing**: Top margin `Spacing.xl` (32px), bottom margin `Spacing.lg` (24px)

### Google Login Button
- **Position**: Full width, below separator
- **Background**: `backgroundWhite` (#FFFFFF)
- **Border**: `border` (#E5E7EB), 1px solid
- **Border Radius**: `BorderRadius.md` (8px)
- **Padding**: Vertical `Spacing.md` (16px), horizontal `Spacing.md` (16px)
- **Height**: Approximately 48-52px
- **Layout**: Horizontal flex with icon on left, text centered
- **Google Logo**: 
  - Position: Left side with `Spacing.md` (16px) left padding
  - Size: Approximately 20x20px
  - Colors: Official Google logo (multicolored: blue, red, yellow, green, blue)
- **Text**: "Continue with Google"
- **Typography**: `Typography.button` (16px, 600 weight, `textPrimary`)
- **Text Position**: Centered horizontally
- **Spacing**: Bottom margin `Spacing.md` (16px) to next social button

### Apple Login Button
- **Position**: Full width, below Google button
- **Background**: `backgroundWhite` (#FFFFFF)
- **Border**: `border` (#E5E7EB), 1px solid
- **Border Radius**: `BorderRadius.md` (8px)
- **Padding**: Vertical `Spacing.md` (16px), horizontal `Spacing.md` (16px)
- **Height**: Approximately 48-52px
- **Layout**: Horizontal flex with icon on left, text centered
- **Apple Logo**: 
  - Position: Left side with `Spacing.md` (16px) left padding
  - Size: Approximately 20x20px
  - Color: Black (`textPrimary` - #1F2937) or dark gray
  - Style: Solid black Apple logo icon
- **Text**: "Continue with Apple"
- **Typography**: `Typography.button` (16px, 600 weight, `textPrimary`)
- **Text Position**: Centered horizontally
- **Spacing**: Bottom margin `Spacing.xl` (32px) to footer

### Footer Bar
- **Position**: Fixed at bottom of screen (optional)
- **Background**: `textPrimary` (#1F2937) or dark gray
- **Height**: Approximately 48-56px
- **Content**: 
  - Left: App logo + app name in white
  - Right: "curated by" + Mobbin logo/text in white
- **Text Color**: `backgroundWhite` (#FFFFFF)
- **Typography**: `Typography.caption` (14px, 400 weight)
- **Padding**: Horizontal `Spacing.xl` (32px), vertical `Spacing.md` (16px)
- **Layout**: Flex row with space-between alignment

## Color Patterns

### Background
- **Main Background**: `background` (#F9FAFB) or `backgroundWhite` (#FFFFFF)
- **Alternative**: Subtle gradient from light purple to light green (using `lavenderLight` - #E9D5FF to `yummyLight` - #6EE7B7)

### Input Fields
- **Background**: `backgroundWhite` (#FFFFFF)
- **Border**: `border` (#E5E7EB)
- **Text**: `textPrimary` (#1F2937)
- **Label**: `textSecondary` (#6B7280)
- **Focus Border**: `primary` (#6B46C1) or `info` (#3B82F6)
- **Validation Success**: `success` (#10B981)

### Primary Action
- **Button Background**: `primary` (#6B46C1) or brand accent (e.g., `maybe` - #F59E0B for orange)
- **Button Text**: `backgroundWhite` (#FFFFFF)

### Social Login Buttons
- **Background**: `backgroundWhite` (#FFFFFF)
- **Border**: `border` (#E5E7EB)
- **Text**: `textPrimary` (#1F2937)
- **Icon**: Google (multicolored official logo), Apple (black `textPrimary`)

### Links
- **Text Color**: `primary` (#6B46C1) or `info` (#3B82F6)
- **Hover/Active**: Slightly darker shade

### Footer
- **Background**: `textPrimary` (#1F2937) or darker
- **Text**: `backgroundWhite` (#FFFFFF)

## Spacing Patterns

### Vertical Spacing (Top to Bottom)
- **Navigation to Title**: `Spacing.xl` (32px)
- **Title to Email Field**: `Spacing.lg` (24px)
- **Between Input Fields**: `Spacing.md` (16px)
- **Password to Requirements**: `Spacing.xs` (4px)
- **Requirements to Terms**: `Spacing.md` (16px)
- **Terms to Primary Button**: `Spacing.lg` (24px)
- **Primary Button to Separator**: `Spacing.xl` (32px)
- **Separator to Social Buttons**: `Spacing.lg` (24px)
- **Between Social Buttons**: `Spacing.md` (16px)
- **Social Buttons to Footer**: `Spacing.xl` (32px)

### Horizontal Spacing
- **Screen Padding**: `Spacing.xl` (32px) on left and right
- **Input Padding**: `Spacing.md` (16px) horizontal
- **Button Padding**: `Spacing.md` (16px) horizontal
- **Social Button Icon Padding**: `Spacing.md` (16px) from left edge
- **Footer Padding**: `Spacing.xl` (32px) horizontal

## Typography Patterns

### Headings
- **Title**: `Typography.h1` (32px, 700 weight, `textPrimary`)

### Body Text
- **Input Labels**: `Typography.body` (16px, 400 weight, `textSecondary`)
- **Input Text**: `Typography.body` (16px, 400 weight, `textPrimary`)
- **Password Requirements**: `Typography.caption` (14px, 400 weight, `textSecondary`)

### Buttons
- **Primary Button**: `Typography.button` (16px, 600 weight, white)
- **Social Login Buttons**: `Typography.button` (16px, 600 weight, `textPrimary`)

### Captions
- **Terms Text**: `Typography.caption` (14px, 400 weight, `textSecondary`)
- **Link Text**: `Typography.caption` (14px, 400 weight, `primary` or `info`)
- **Footer Text**: `Typography.caption` (14px, 400 weight, `backgroundWhite`)

## Layout Principles

### Alignment
- **Horizontal**: Content left-aligned or centered depending on design
- **Vertical**: Content flows top to bottom with consistent spacing
- **Inputs**: Full width within screen padding
- **Buttons**: Full width within screen padding
- **Social Buttons**: Full width, icons left-aligned, text centered

### Hierarchy
1. **Primary**: Title (visual anchor)
2. **Secondary**: Input fields (main interaction)
3. **Tertiary**: Primary action button (prominent, colored)
4. **Quaternary**: Social login buttons (secondary actions, outlined)
5. **Supporting**: Terms text, password requirements

### Visual Weight
- **Heavy**: Primary button (solid colored background)
- **Medium**: Input fields (white with border)
- **Light**: Social login buttons (outlined, minimal)
- **Minimal**: Links and captions (text only)

### Interaction States
- **Input Fields**: 
  - Focus state: Border color changes to `primary` (#6B46C1) or `info` (#3B82F6)
  - Error state: Border color `error` (#EF4444)
  - Success state: Green checkmark icon
- **Buttons**: 
  - Pressed/active state: Slight opacity change (0.8) or darker shade
  - Disabled state: Reduced opacity (0.5) and disabled interaction
- **Social Buttons**: 
  - Pressed state: Background changes to `backgroundGray` (#F3F4F6)
  - Border may darken slightly
- **Links**: 
  - Pressed state: Underline appears or color darkens
  - Hover state: Slight color change

### Accessibility
- **Touch Targets**: All interactive elements minimum 44x44px
- **Contrast**: Text meets WCAG AA standards
  - White on primary purple: `#FFFFFF` on `#6B46C1` = 4.9:1 ✅
  - Dark text on white: `#1F2937` on `#FFFFFF` = 12.6:1 ✅
- **Spacing**: Adequate spacing between interactive elements (minimum `Spacing.md` - 16px) to prevent mis-taps
- **Labels**: All inputs have visible labels above the field
- **Password Visibility**: Toggle available for password field
- **Clear Input**: Clear button available for password field

### Navigation
- **Back Navigation**: Back arrow or close button always present in top-left
- **Return to Welcome**: Navigation control returns user to welcome screen
- **No Promo Codes**: Promo code functionality is excluded from signup flow

