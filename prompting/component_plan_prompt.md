# Component Implementation Plan Prompt Template

Use this prompt template to create implementation plans for new components. Replace the placeholders with your specific component details.

---

## Prompt Template

```
@[design-document-path] Create a plan to implement [component-name] in the app

[Optional: Add any specific requirements or constraints here, such as:]
- Use existing UI components from the component library
- Follow the design system in [design-system-file]
- Integrate with [specific feature/hook/API]
- Consider [specific constraint or requirement]
```

---

## Example Usage

### Example 1: Sign In Screen
```
@prompting/signin/signin.md Create a plan to implement the sign in screen in the app

- Use the existing Text and Button components from app/components/ui
- Follow the design system patterns established in the welcome screen
- Integrate with the existing useAuth hook
- Ensure proper error handling and validation
```

### Example 2: Form Component
```
@prompting/forms/form-design.md Create a plan to implement the [FormName] form component in the app

- Create reusable form input components in app/components/ui
- Use react-native-paper for base components where appropriate
- Follow validation patterns from existing forms
- Integrate with [specific API/backend]
```

---

## What the Plan Should Include

When creating a plan, ensure it covers:

1. **Overview**: Brief description of what will be implemented
2. **Dependencies**: Any packages that need to be installed
3. **Component Structure**: 
   - New components to create (if any)
   - Existing components to use
   - File organization
4. **Implementation Steps**: 
   - Detailed step-by-step breakdown
   - Specific file paths
   - Code structure and patterns
5. **Styling Details**:
   - Design system constants to use
   - Color, spacing, typography choices
   - Layout patterns
6. **Integration Points**:
   - Hooks to use
   - Navigation/routing
   - API calls
   - State management
7. **Files to Create/Modify**: Clear list of all files
8. **Notes**: Any considerations, edge cases, or future improvements

---

## Best Practices

1. **Reference Existing Patterns**: Always check similar components in the codebase first
2. **Use Design System**: Leverage existing constants (Colors, Spacing, Typography, BorderRadius)
3. **Component Reusability**: Consider if new components should be in `app/components/ui` for reuse
4. **Type Safety**: Ensure TypeScript types are properly defined
5. **Error Handling**: Plan for error states and edge cases
6. **Accessibility**: Consider accessibility requirements
7. **Testing**: Note any testing considerations (even if not implementing tests yet)

---

## Quick Checklist

Before finalizing a plan, verify:
- [ ] All dependencies identified
- [ ] File paths are correct
- [ ] Design system constants are referenced
- [ ] Integration with existing code is clear
- [ ] Navigation/routing is specified
- [ ] Error states are considered
- [ ] Component reusability is evaluated
- [ ] TypeScript types are planned

---

## Notes

- Plans should be specific and actionable
- Cite specific file paths and code patterns
- Reference existing implementations when similar patterns exist
- Keep plans proportional to complexity (don't over-engineer simple tasks)

