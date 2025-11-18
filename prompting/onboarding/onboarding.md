# Onboarding Screen Design System

## Overview
Multi-step onboarding flow with one question per screen. Each screen follows the same layout pattern, asking users to select from radio button options. The flow includes three required steps: Age Range, Sexual Preference, and Gender (plus optional pronoun selection as shown in screenshots).

## Layout Structure (Top to Bottom)

1. **Status Bar** (system default, excluded from design)
2. **Progress Indicator Bar** - Horizontal progress bar with skip button
3. **Main Content Area** - Centered question and instruction text
4. **Selection Options** - Vertical stack of radio button options
5. **Continue Button** - Fixed at bottom of screen

## Common Components

### Progress Indicator Bar
- **Position:** Below status bar, full width
- **Structure:** 
  - Left: Horizontal progress bar (light gray background with darker gray filled portion)
  - Right: Skip button (double arrow ">>" icon in light gray circle)
- **Progress Bar:**
  - Background: `backgroundGray` (#F3F4F6)
  - Filled portion: `textTertiary` (#9CA3AF) or slightly darker gray
  - Height: ~4px
  - Border radius: 2px
- **Skip Button:**
  - Icon: Double arrow ">>" symbol
  - Background: Light gray circle
  - Size: ~32px diameter
  - Position: Right-aligned with padding

### Main Question
- **Text:** Large serif-style heading (e.g., "How can we refer to you?")
- **Typography:** 
  - Size: ~32-36px (similar to `Typography.h1`)
  - Weight: Bold/700
  - Color: `textPrimary` (#1F2937) - dark brown/charcoal
  - Font: Serif (elegant, formal)
  - Alignment: Center
  - Line height: ~1.2

### Instruction Text
- **Text:** Smaller instruction below question (e.g., "Please select one option:")
- **Typography:**
  - Size: ~14-16px (similar to `Typography.caption` or `Typography.body`)
  - Weight: Regular/400
  - Color: `textSecondary` (#6B7280) - light gray
  - Font: Sans-serif
  - Alignment: Center
  - Spacing: ~8-12px below question

### Radio Button Option
- **Structure:** Horizontal container with radio indicator on left, text on right
- **Container:**
  - Background (unselected): `backgroundWhite` (#FFFFFF) or very light beige
  - Background (selected): Warm light golden-brown/tan (custom color, not in current palette - could use `maybeLight` #FCD34D with opacity)
  - Border: Light gray outline when unselected, none when selected
  - Border radius: ~12-16px
  - Padding: ~16px vertical, ~20px horizontal
  - Height: ~56-64px
  - Spacing between options: ~12-16px
- **Radio Indicator:**
  - Position: Left side, ~16px from left edge
  - Size: ~20-24px diameter
  - Unselected: Empty circle with light gray border (`border` #E5E7EB)
  - Selected: Filled circle with golden-yellow (`maybe` #F59E0B or similar vibrant yellow)
- **Option Text:**
  - Typography: `Typography.body` (16px, regular weight)
  - Color: `textPrimary` (#1F2937) - dark brown
  - Position: Left of center, ~48px from left edge (after radio indicator + spacing)

### Continue Button
- **Position:** Fixed at bottom of screen, full width with padding
- **Style:**
  - Background: Vibrant golden-yellow (`maybe` #F59E0B or brighter yellow like #FFD700)
  - Text: "Continue" in white
  - Typography: `Typography.button` (16px, semibold/600)
  - Border radius: ~12-16px
  - Height: ~56px
  - Padding: Horizontal ~24px
  - Shadow: Subtle elevation shadow (optional)
- **State:**
  - Enabled: Full opacity, golden-yellow background
  - Disabled: Reduced opacity (50-60%), same background color

## Color Patterns

### Background
- **Screen Background:** Very light beige/off-white (`background` #F9FAFB or slightly warmer custom beige)

### Text Colors
- **Primary Question:** `textPrimary` (#1F2937) - dark brown/charcoal
- **Instruction Text:** `textSecondary` (#6B7280) - medium gray
- **Option Text:** `textPrimary` (#1F2937) - dark brown
- **Button Text:** `backgroundWhite` (#FFFFFF) - white

### Interactive Elements
- **Selected Option Background:** Warm light golden-brown/tan (custom - could approximate with `maybeLight` #FCD34D at 30-40% opacity)
- **Selected Radio Indicator:** Vibrant golden-yellow (`maybe` #F59E0B or brighter #FFD700)
- **Unselected Option Background:** `backgroundWhite` (#FFFFFF)
- **Unselected Radio Indicator Border:** `border` (#E5E7EB) - light gray
- **Continue Button:** Vibrant golden-yellow (`maybe` #F59E0B or brighter #FFD700)
- **Progress Bar Background:** `backgroundGray` (#F3F4F6)
- **Progress Bar Filled:** `textTertiary` (#9CA3AF) or slightly darker

## Spacing Patterns

- **Screen Padding:** `Spacing.xl` (32px) horizontal padding
- **Progress Bar to Question:** `Spacing.xxl` (48px) or more
- **Question to Instruction:** `Spacing.sm` (8px) to `Spacing.md` (16px)
- **Instruction to Options:** `Spacing.lg` (24px) to `Spacing.xl` (32px)
- **Between Options:** `Spacing.md` (16px)
- **Options to Button:** `Spacing.xxl` (48px) or more (flexible space)
- **Button Bottom Padding:** `Spacing.xl` (32px) plus safe area inset
- **Button Horizontal Padding:** `Spacing.lg` (24px)

## Typography Patterns

### Question Heading
- **Size:** 32-36px (larger than `Typography.h1`)
- **Weight:** 700 (bold)
- **Font Family:** Serif (elegant, formal style)
- **Color:** `textPrimary` (#1F2937)
- **Line Height:** ~1.2
- **Letter Spacing:** Slightly negative (-0.5px)

### Instruction Text
- **Size:** 14-16px (`Typography.caption` or `Typography.body`)
- **Weight:** 400 (regular)
- **Font Family:** Sans-serif
- **Color:** `textSecondary` (#6B7280)
- **Line Height:** ~1.4

### Option Text
- **Size:** 16px (`Typography.body`)
- **Weight:** 400 (regular)
- **Font Family:** Sans-serif
- **Color:** `textPrimary` (#1F2937)
- **Line Height:** 24px

### Button Text
- **Size:** 16px (`Typography.button`)
- **Weight:** 600 (semibold)
- **Font Family:** Sans-serif
- **Color:** `backgroundWhite` (#FFFFFF)
- **Letter Spacing:** 0.2px

## Layout Principles

### Hierarchy
1. **Primary:** Question text (largest, boldest, serif font)
2. **Secondary:** Instruction text (smaller, lighter color)
3. **Tertiary:** Option text (standard body text)
4. **Action:** Continue button (vibrant color, prominent position)

### Alignment
- **Question & Instruction:** Center-aligned horizontally
- **Options:** Left-aligned text within centered container
- **Radio Indicators:** Left-aligned within option container
- **Button:** Center-aligned text, full-width container

### Visual Flow
- Top-to-bottom progression: Progress → Question → Options → Action
- Clear visual separation between sections using spacing
- Selected state uses warm golden colors to draw attention
- Button uses same golden color as selected state for consistency

### Interaction Patterns
- Only one option can be selected at a time (radio button behavior)
- Selected option has distinct visual feedback (background color change + filled radio indicator)
- Button remains enabled once any option is selected (for single-question screens)
- Button may be disabled until selection is made (implementation-dependent)

## Multi-Step Flow Notes

This design pattern is used for each step in the onboarding flow:
1. **Step 1:** Age Range selection
2. **Step 2:** Sexual Preference selection  
3. **Step 3:** Gender selection
4. **Optional Step:** Pronoun selection (as shown in screenshots)

Each screen follows the same layout and component structure, with only the question text and option values changing. The progress bar updates to reflect the current step in the flow.

