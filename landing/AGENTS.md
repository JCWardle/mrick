# Agent Guidelines for Landing Page

## Tech Stack
- **Next.js 14+** (App Router) - Framework
- **shadcn/ui** - Component library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (via shadcn)

## Component Library
Use **shadcn/ui** components for all UI elements.

- Install: `npx shadcn-ui@latest init` (if not already done)
- Add components: `npx shadcn-ui@latest add button card input`
- Import pattern: `import { Button } from '@/components/ui/button'`
- Use shadcn components instead of custom styled components when possible
- Customize via Tailwind classes, not by modifying shadcn source files

## File Structure
Keep it simple - single page landing page:

```
app/
  page.tsx              # Main landing page
  layout.tsx            # Root layout
components/
  ui/                   # shadcn components (auto-generated)
    button.tsx
    card.tsx
  landing/
    Hero.tsx            # Hero section
    Features.tsx        # Features section
    CTA.tsx             # Call-to-action section
    Footer.tsx          # Footer
lib/
  utils.ts              # cn() utility (from shadcn)
constants/
  site.ts               # Site metadata, links
```

## Principles

### ✅ Good: Reusable, composable components
```typescript
// components/landing/Hero.tsx
interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
}

export function Hero({ title, subtitle, ctaText, onCtaClick }: HeroProps) {
  return (
    <section className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="text-lg mt-4">{subtitle}</p>
      <Button onClick={onCtaClick}>{ctaText}</Button>
    </section>
  );
}
```

### ❌ Bad: Monolithic page component
```typescript
// app/page.tsx - Don't put everything here
export default function Page() {
  return (
    <div>
      {/* 200+ lines of JSX */}
    </div>
  );
}
```

### ✅ Good: Extract sections into components
```typescript
// app/page.tsx
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { CTA } from '@/components/landing/CTA';

export default function Page() {
  return (
    <main>
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
```

### ✅ Good: Types inline in files
```typescript
// components/landing/Features.tsx
interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function Features({ features }: { features: Feature[] }) {
  // Component implementation
}
```

### ❌ Bad: Separate types folder for simple landing page
```typescript
// types/feature.ts - Unnecessary for simple landing page
export interface Feature { ... }
```

### ✅ Good: Constants for reusable data
```typescript
// constants/site.ts
export const SITE_CONFIG = {
  name: 'Peek',
  url: 'https://peek.app',
  links: {
    appStore: '...',
    playStore: '...',
  },
} as const;
```

### ❌ Bad: Hardcoded values in components
```typescript
// In component
<h1>Peek</h1> // Should use constant
```

## Component Structure
1. **Pages** (`app/page.tsx`) - Minimal, compose sections
2. **Components** (`components/landing/`) - Reusable sections, props-based
3. **UI Components** (`components/ui/`) - shadcn components (don't modify)
4. **Constants** (`constants/`) - Site metadata, links, copy

## Best Practices

### Reusability
- Extract repeated patterns into components (e.g., `FeatureCard`, `Section`)
- Use shadcn's composition patterns (e.g., `Card`, `CardHeader`, `CardContent`)
- Create wrapper components for common layouts (e.g., `Container`, `Section`)

### Styling
- Use Tailwind utility classes
- Leverage shadcn's built-in variants (e.g., `Button` variants)
- Keep custom CSS minimal - prefer Tailwind
- Use `cn()` utility for conditional classes

### Performance
- Use Next.js Image component for images
- Lazy load below-the-fold sections if needed
- Keep bundle size small - single page should be fast

## Additional Suggestions

1. **SEO**: Add metadata in `app/layout.tsx` or `app/page.tsx`
   ```typescript
   export const metadata = {
     title: 'Peek - ...',
     description: '...',
   }
   ```

2. **Analytics**: Add tracking (e.g., Vercel Analytics, Google Analytics)

3. **Accessibility**: 
   - Use semantic HTML
   - Ensure proper heading hierarchy
   - Add ARIA labels where needed

4. **Responsive Design**: 
   - Mobile-first approach
   - Test on multiple breakpoints
   - Use Tailwind responsive utilities

5. **Loading States**: Consider skeleton loaders if fetching data

6. **Error Boundaries**: Add error handling for production

7. **Testing**: Consider adding basic tests for critical paths

