# Card Swipe Screen Design Description

## Overview

A full-screen card-based interface for viewing and interacting with exploration cards. The design centers around a single large card that occupies most of the screen, with card information overlaid on the bottom portion and action buttons positioned below the card. Cards help couples discover shared interests through a playful, swipeable interface.

## Layout Structure

### Top Section
- **Header Bar**: Contains the app logo/branding on the left side
- **Header Actions**: Menu and settings/filter icons positioned on the right side of the header
- **Progress Indicator**: Small horizontal lines or dots below the header indicating position in the card stack (excluding image indicators)

### Main Content Area
- **Card**: A large, full-width card that takes up the majority of the screen space
  - The card displays a single card illustration that fills the entire card area
  - The illustration serves as the background for the entire card component
  - Card information is overlaid on the bottom portion of the card
  - The illustration is fun, cartoony, and uses soft, rounded shapes with warm tones

### Card Information Overlay
The card details are displayed as an overlay on the bottom portion of the card, with a semi-transparent or gradient background to ensure text readability:

- **Intensity Badge**: A small rounded badge positioned at the top-left of the overlay area, indicating the intensity level (0-5 scale)
  - Uses color coding based on intensity level (lighter colors for lower intensity, deeper colors for higher intensity)
  - Rounded pill/oval shape
  - May display the intensity number or a label (e.g., "Mild", "Medium", "Intense")

- **Card Title**: Large, prominent text displaying the card's main text (2-5 words)
  - White or light-colored text for contrast
  - Bold, large typography
  - This is the primary identifier for the card

- **Category Badge**: A small badge or tag displaying the card's category
  - Positioned near the title or intensity badge
  - Uses a secondary accent color
  - Examples: "playful", "romantic", "kink", "toys", "roleplay"

- **Card Labels/Tags**: A collection of small, rounded rectangular tags displaying the card's labels
  - Each tag contains text representing a label
  - Examples: "playful", "teasing", "consent", "communication", "beginner-friendly"
  - Tags use a dark semi-transparent background with white text
  - Typically 3-5 tags displayed horizontally or in a wrap layout

- **More Details Button**: A circular button with an upward-pointing arrow icon
  - Positioned on the right side of the overlay area
  - White background with dark icon
  - Allows users to view the full card description and conversation templates

### Action Buttons Section
Below the card, centered horizontally, is a row of circular action buttons:

- **Undo Button**: Circular button with a curved arrow icon pointing left
  - Uses a secondary accent color (yellow in the reference)
  - Positioned on the far left
  - Allows users to go back to the previous card

- **Pass/Skip Button**: Circular button with an "X" icon
  - Uses a primary accent color (red in the reference)
  - Positioned second from left
  - Indicates the user is not interested in this card

- **Save/Bookmark Button**: Circular button with a star or bookmark icon
  - Uses a secondary accent color (blue in the reference)
  - Positioned in the center
  - Allows users to save the card for later review

- **Like/Interest Button**: Circular button with a heart icon
  - Uses a primary accent color (green in the reference)
  - Positioned second from right
  - Indicates the user is interested in exploring this card

- **Info/Details Button**: Circular button with an "i" or info icon
  - Uses a secondary accent color (purple in the reference)
  - Positioned on the far right
  - Opens a modal or expanded view with full description and conversation templates

All action buttons are:
- Equal size and circular
- Positioned on a white or light background
- Spaced evenly across the width
- Clearly visible with high contrast icons

### Bottom Navigation Bar
A persistent navigation bar at the very bottom of the screen contains navigation icons (number and type may vary based on app structure):

- **Home/Swipe Tab**: App logo or primary icon (highlighted/active state)
  - Uses primary brand color when active
  - Grey/neutral color when inactive

- **Matches/Interests Tab**: Heart or checkmark icon showing cards both partners liked
  - Grey/neutral color

- **Saved Tab**: Bookmark or star icon for saved cards
  - Grey/neutral color

- **Profile/Settings Tab**: User silhouette or profile icon
  - Grey/neutral color

The active tab is indicated by using the primary brand color, while inactive tabs use neutral grey tones.

## Card Data Display

### Primary Information (Always Visible)
- **Card Title**: The main text (2-5 words) - most prominent
- **Intensity Badge**: Visual indicator of intensity level
- **Category**: High-level categorization
- **Labels**: 3-5 tags showing relevant attributes

### Secondary Information (Available on Tap/Expand)
- **Description**: Full 2-sentence explanation of what the card topic is
- **Conversation Templates**: 3-5 open-ended prompts to help start discussions
- **Additional Metadata**: Any other relevant information

## Color Scheme

- **Primary Colors**: Used for main actions (like, pass buttons) and active states
  - Red for negative actions (pass/skip)
  - Green for positive actions (like/interest)

- **Secondary Colors**: Used for additional actions and accents
  - Yellow for undo/back actions
  - Blue for save/bookmark actions
  - Purple for info/details actions
  - Warm coral and mint tones for card illustrations (as per brand style)

- **Intensity Color Coding**:
  - Very Mild (0): Light, soft colors
  - Mild (1): Gentle, warm colors
  - Medium (2): Balanced, moderate colors
  - Moderate (3): Deeper, richer colors
  - Intense (4): Strong, vibrant colors
  - Very Intense (5): Deep, bold colors

- **Neutral Colors**: 
  - White/light backgrounds for buttons and overlays
  - Dark semi-transparent overlays for text readability
  - Grey for inactive states and secondary elements

- **Text Colors**:
  - White/light text on dark backgrounds
  - Dark text on light backgrounds
  - High contrast for readability

## Typography

- **Large, Bold Text**: For card titles (primary information)
- **Medium Text**: For descriptions and secondary information
- **Small Text**: For labels, tags, and metadata
- All text uses high contrast colors relative to backgrounds for optimal readability
- Playful but mature tone in typography choices

## Interaction Patterns

- The card is swipeable in all directions (left to pass, right to like, up for details)
- Action buttons provide tap targets for user interactions
- The overlay information is always visible on the bottom portion of the card
- Tapping the "More Details" button or info button opens a modal with:
  - Full card description (2 sentences)
  - Conversation templates (3-5 prompts)
  - Additional context if needed
- Navigation tabs allow switching between different app sections
- Swipe gestures provide haptic feedback for better user experience

## Visual Hierarchy

1. **Primary Focus**: The card illustration and title
2. **Secondary Focus**: Card information overlay (intensity, category, labels)
3. **Tertiary Elements**: Action buttons and navigation bar
4. **Supporting Elements**: Header icons and progress indicators

## Design Principles

- **Full-Screen Immersion**: The card dominates the screen for focused viewing
- **Clear Action Affordances**: Large, colorful buttons make actions obvious
- **Information Density**: Card details are compactly organized in the overlay
- **Visual Feedback**: Color coding helps users understand different action types and intensity levels
- **Persistent Navigation**: Bottom navigation bar remains accessible at all times
- **Playful but Mature**: Design reflects the app's voice - approachable, shame-free, couples-first
- **Safe and Comfortable**: Visual style ensures users feel comfortable exploring together

## Card Illustration Style

- **Visual Style**: Fun, cartoony illustrations
- **Shapes**: Soft, rounded shapes
- **Colors**: Warm coral and mint tones (brand colors)
- **Content**: Abstract, non-literal elements that symbolically represent the card title
- **Characters**: Simple, cute characters or objects performing activities
- **Tone**: Playful, safe, and PG-13 appropriate
- **Layout**: Minimal, modern layout with no real people and no explicit imagery
- **Text**: Only the card title is displayed on the illustration, centered and clearly readable

## Special Considerations

- **Couples Context**: Design should feel inviting for couples to explore together
- **Intensity Awareness**: Visual cues help users understand intensity levels before engaging
- **Privacy**: Design should feel private and safe for personal exploration
- **Conversation Starters**: Easy access to conversation templates encourages healthy communication
- **Non-Judgmental**: Visual design should normalize exploration and avoid judgmental language or imagery

