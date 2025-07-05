# New Astro Component

Your goal is to generate a new Astro component for the Learning English Platform.

Ask for the component name and purpose if not provided.

Requirements for the component:

- Use TypeScript with strict typing for all props
- Follow kebab-case naming convention for files and CSS classes
- Use Tailwind CSS v4 syntax with @theme directive when needed
- Include proper accessibility attributes and ARIA labels
- Make it responsive with mobile-first approach
- Use semantic HTML elements
- Include proper TypeScript interfaces for props
- Use destructuring for props with default values
- Add JSDoc comments for complex props
- Follow the existing component structure in [src/components/](../../src/components/)

Component structure should follow this pattern:

```astro
---
interface Props {
  // Define props here with proper TypeScript types
}

const { /* destructured props */ } = Astro.props;
---

<!-- Semantic HTML with accessibility -->
<element class="tailwind classes" role="..." aria-label="...">
  <slot />
</element>
```

Make sure to:

- Export proper TypeScript types if the component will be used elsewhere
- Include variants if the component needs different styles
- Add proper error handling for required props
- Use CSS custom properties for theming when appropriate
- Include hover, focus, and active states for interactive elements
