# Screenshot Analysis Prompt Template

Use this prompt to analyze app screenshots and create design system documentation for React Native implementation.

## Prompt Structure

```
Analyze the provided app screenshots of [SCREEN TYPE] screens and create a design system document.

**Instructions:**
1. Evaluate common elements across ALL screenshots (don't describe each screen individually)
2. Describe components in plain English using design system language
3. Use colors from the app's color constants file (@constants/colors.ts)
4. Be concise and focus on reusable patterns
5. Describe how components are laid out and fit together

**Requirements:**
- Identify common layout structure (vertical stack, sections, etc.)
- List all common components with their properties
- Specify colors using constant names (e.g., `primary`, `backgroundWhite`, `textPrimary`)
- Include spacing patterns between elements
- Document typography patterns (sizes, weights)
- Note layout principles (alignment, hierarchy, etc.)

**Output Format:**
Create a markdown document with:
- Layout Structure (sections from top to bottom)
- Common Components (detailed descriptions)
- Color Patterns (using app's color constants)
- Spacing Patterns
- Typography Patterns
- Layout Principles

**Style Guidelines:**
- Use plain English, not technical jargon
- Reference color constants by name with hex codes in parentheses
- Focus on what's common, not what's unique to each screen
- Keep descriptions concise but complete enough for implementation
```

## Example Usage

For a login screen:
```
Analyze the provided app screenshots of login screens and create a design system document.

**Instructions:**
1. Evaluate common elements across ALL screenshots (don't describe each screen individually)
2. Describe components in plain English using design system language
3. Use colors from the app's color constants file (@constants/colors.ts)
4. Be concise and focus on reusable patterns
5. Describe how components are laid out and fit together

[Attach screenshots]
[Attach constants/colors.ts]
```

## Customization Options

### For Specific Background Requirements
Add to instructions:
```
- Background: [SPECIFIC REQUIREMENT, e.g., "deep purple gradient from primary to black"]
- Exclude: [ELEMENTS TO OMIT, e.g., "status bar"]
```

### For Specific Color Themes
Add to instructions:
```
- Apply color theming from @constants/colors.ts
- Background should be: [COLOR REQUIREMENT]
- All text colors should contrast appropriately with background
```

### For Component-Specific Analysis
Add to instructions:
```
- Focus particularly on: [COMPONENT TYPE, e.g., "form inputs", "navigation bars", "cards"]
- Document interaction states: [e.g., "pressed", "focused", "disabled"]
```

## Tips for Best Results

1. **Provide multiple screenshots** - More examples = better pattern recognition
2. **Include color constants** - Ensures consistent theming
3. **Specify requirements upfront** - Background colors, excluded elements, etc.
4. **Ask for common elements only** - Avoids screen-by-screen descriptions
5. **Request plain English** - Makes documentation more accessible

