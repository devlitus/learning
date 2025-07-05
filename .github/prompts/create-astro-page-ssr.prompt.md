# Create Astro Page with SSR

Your goal is to create a new Astro page with server-side rendering for the Learning English Platform.

Ask for the page purpose and required functionality if not provided.

Requirements for the page:

- Use Astro SSR patterns with proper server-side logic
- Include proper TypeScript typing for all variables
- Use server-side authentication checks when needed
- Handle form submissions with POST method processing
- Include proper error handling and user feedback
- Use cookies for state management between pages
- Follow the existing page structure in [src/pages/](../../src/pages/)
- Include proper SEO meta tags and structured data
- Use semantic HTML and accessibility attributes
- Make it responsive with Tailwind CSS v4

Page structure should follow this pattern:

```astro
---
import Layout from '../layouts/Layout.astro';
import { z } from 'zod';

// Server-side logic here
if (Astro.request.method === 'POST') {
  // Handle form submission
  const formData = await Astro.request.formData();

  // Validate with Zod
  // Process data
  // Set cookies if needed
  // Redirect or set state
}

// Get data from cookies or database
const currentData = Astro.cookies.get('key')?.value;
---

<Layout title="Page Title">
  <div class="container mx-auto px-4 py-8">
    <!-- Page content here -->
  </div>
</Layout>
```

Common patterns for this platform:

- Authentication checks and redirects
- Form handling with validation
- Cookie management for user state
- Database operations for user data
- English level and topic management
- Onboarding flow logic
- Educational content display

Make sure to:

- Include proper authentication checks for protected pages
- Use server-side validation for all form inputs
- Add proper error handling and user feedback
- Include loading states and optimistic updates
- Use proper SEO meta tags for educational content
- Include structured data for search engines
- Handle edge cases and error states
- Use proper accessibility attributes
- Include proper TypeScript types for all data
- Follow the mobile-first responsive design approach
