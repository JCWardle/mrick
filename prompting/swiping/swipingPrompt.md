# Swipe Screen Design Description

## Overview

A full-screen card-based interface for viewing and interacting with user profiles. The design centers around a single large profile card that occupies most of the screen, with profile information overlaid on the bottom portion and action buttons positioned below the card.

## Layout Structure

### Top Section
- **Header Bar**: Contains the app logo/branding on the left side
- **Header Actions**: Notification and settings/filter icons positioned on the right side of the header
- **Status Indicators**: Small horizontal lines or dots below the header indicating profile content (excluding image indicators)

### Main Content Area
- **Profile Card**: A large, full-width card that takes up the majority of the screen space
  - The card displays a single profile image that fills the entire card area
  - The image serves as the background for the entire card component
  - Profile information is overlaid on the bottom portion of the card

### Profile Information Overlay
The profile details are displayed as an overlay on the bottom portion of the profile card, with a semi-transparent or gradient background to ensure text readability:

- **Status Badge**: A small rounded badge positioned at the top-left of the overlay area, indicating user activity status (e.g., "Active")
  - Uses a secondary accent color (green in the reference)
  - Rounded pill/oval shape

- **Name and Age**: Large, prominent text displaying the user's name and age
  - White or light-colored text for contrast
  - Includes a verification badge icon next to the name if the user is verified
  - Bold, large typography

- **Preference Match Indicator**: Text indicating compatibility or matched preferences
  - Accompanied by small heart icons
  - Positioned below the name

- **Profile Tags/Badges**: A collection of small, rounded rectangular tags displaying various profile attributes
  - Each tag contains an icon and text
  - Tags include checkmarks to indicate verified attributes
  - Examples: photo count, relationship status, communication preferences, lifestyle choices, bio indicator
  - Tags use a dark semi-transparent background with white text
  - Icons are small and positioned within each tag

- **More Details Button**: A circular button with an upward-pointing arrow icon
  - Positioned on the right side of the overlay area
  - White background with dark icon
  - Allows users to view additional profile information

### Action Buttons Section
Below the profile card, centered horizontally, is a row of circular action buttons:

- **Undo Button**: Circular button with a curved arrow icon pointing left
  - Uses a secondary accent color (yellow in the reference)
  - Positioned on the far left

- **Dislike/Nope Button**: Circular button with an "X" icon
  - Uses a primary accent color (red in the reference)
  - Positioned second from left

- **Super Like Button**: Circular button with a star icon
  - Uses a secondary accent color (blue in the reference)
  - Positioned in the center

- **Like Button**: Circular button with a heart icon
  - Uses a primary accent color (green in the reference)
  - Positioned second from right

- **Boost/Premium Button**: Circular button with a lightning bolt icon
  - Uses a secondary accent color (purple in the reference)
  - Positioned on the far right

All action buttons are:
- Equal size and circular
- Positioned on a white or light background
- Spaced evenly across the width
- Clearly visible with high contrast icons

### Bottom Navigation Bar
A persistent navigation bar at the very bottom of the screen contains five icons:

- **Home/Discover Tab**: App logo or primary icon (highlighted/active state)
  - Uses primary brand color when active
  - Grey/neutral color when inactive

- **Explore Tab**: Grid or discovery icon
  - Grey/neutral color

- **Premium Tab**: Diamond or premium feature icon
  - Grey/neutral color

- **Messages Tab**: Speech bubble or message icon
  - Grey/neutral color

- **Profile Tab**: User silhouette or profile icon
  - Grey/neutral color

The active tab is indicated by using the primary brand color, while inactive tabs use neutral grey tones.

## Color Scheme

- **Primary Colors**: Used for main actions (like, dislike buttons) and active states
  - Red for negative actions (dislike)
  - Green for positive actions (like, active status)

- **Secondary Colors**: Used for additional actions and accents
  - Yellow for undo/back actions
  - Blue for special actions (super like)
  - Purple for premium/boost features

- **Neutral Colors**: 
  - White/light backgrounds for buttons and overlays
  - Dark semi-transparent overlays for text readability
  - Grey for inactive states and secondary elements

- **Text Colors**:
  - White/light text on dark backgrounds
  - Dark text on light backgrounds
  - High contrast for readability

## Typography

- **Large, Bold Text**: For user names and primary information
- **Medium Text**: For secondary information and tags
- **Small Text**: For metadata and indicators
- All text uses high contrast colors relative to backgrounds for optimal readability

## Interaction Patterns

- The profile card is swipeable (though image swiping through multiple photos is excluded from this design)
- Action buttons provide tap targets for user interactions
- The overlay information is always visible on the bottom portion of the card
- Navigation tabs allow switching between different app sections

## Visual Hierarchy

1. **Primary Focus**: The profile card and image
2. **Secondary Focus**: Profile information overlay
3. **Tertiary Elements**: Action buttons and navigation bar
4. **Supporting Elements**: Header icons and status indicators

## Design Principles

- **Full-Screen Immersion**: The profile card dominates the screen for focused viewing
- **Clear Action Affordances**: Large, colorful buttons make actions obvious
- **Information Density**: Profile details are compactly organized in the overlay
- **Visual Feedback**: Color coding helps users understand different action types
- **Persistent Navigation**: Bottom navigation bar remains accessible at all times

