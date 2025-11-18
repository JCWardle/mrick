# Quick Screenshot Analysis Prompt

Copy and paste this prompt, replacing the placeholders:

---

Analyze the provided app screenshots of **[SCREEN TYPE]** screens and create a design system document.

**Instructions:**
1. Evaluate common elements across ALL screenshots (don't describe each screen individually)
2. Describe components in plain English using design system language
3. Use colors from @constants/colors.ts - reference colors by constant name with hex codes
4. Be concise and focus on reusable patterns
5. Describe how components are laid out and fit together

**Requirements:**
- Identify common layout structure (sections from top to bottom)
- List all common components with their properties (position, style, colors, size)
- Specify colors using constant names from the colors file
- Include spacing patterns between elements
- Document typography patterns (sizes, weights)
- Note layout principles (alignment, hierarchy, etc.)

**[ADD ANY SPECIFIC REQUIREMENTS HERE, e.g.:**
- Background: deep purple gradient from primary to black
- Exclude: status bar
- Focus on: button styles and form inputs
**]**

**Output:** Create a markdown document with sections for Layout Structure, Common Components, Color Patterns, Spacing Patterns, Typography Patterns, and Layout Principles.

