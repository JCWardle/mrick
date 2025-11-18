# Required Onboarding Form Fields

The onboarding form requires users to input three pieces of demographic information before they can proceed to the swiping experience. All three fields are mandatory and must be selected before the "Start Swiping" button becomes enabled.

## 1. Age Range
- **Label:** "Select your age range"
- **Type:** Dropdown/Select menu
- **Required:** Yes
- **Options:**
  - 18-24
  - 25-34
  - 35-44
  - 45-54
  - 55+
- **Purpose:** Used to personalize the user's experience and match them with appropriate content

## 2. Sexual Preference
- **Label:** "Sexual preference"
- **Type:** Dropdown/Select menu
- **Required:** Yes
- **Options:**
  - Straight
  - Gay
  - Lesbian
  - Bisexual
  - Pansexual
  - Asexual
  - Prefer not to say
- **Purpose:** Helps the app understand the user's preferences for matching and content personalization

## 3. Gender
- **Label:** "Gender"
- **Type:** Dropdown/Select menu
- **Required:** Yes
- **Options:**
  - Male
  - Female
  - Non-binary
  - Prefer not to say
- **Purpose:** Used for profile creation and matching algorithm

## Form Behavior
- All three fields must be selected before the user can proceed
- The "Start Swiping" button is disabled until all required fields are completed
- If the user attempts to continue without completing all fields, an error message is displayed: "Please select age range, sexual preference, and gender"
- Once all fields are completed and saved, the user is navigated to the swipe screen

## UI Design Notes
- Fields are displayed as light purple, rounded rectangular input fields
- Selected values are displayed in darker purple text
- The form has a clean, minimalist design with clear visual hierarchy
- Title: "Tell us about yourself"
- Subtitle: "This helps us personalize your experience"

