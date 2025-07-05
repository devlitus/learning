# Learning English Platform - Custom Instructions

We use Astro v5.11.0 with SSR for this English learning platform, not standard client-side rendering, so always provide server-side solutions and SSR patterns.

We use Tailwind CSS v4, not v3, so use the new @theme directive and updated syntax when generating CSS.

We use Zustand/vanilla for state management, not React hooks, so provide vanilla JavaScript solutions that work without React.

We use Zod for all data validation with strict schemas, so always validate inputs and outputs with Zod schemas.

We use TypeScript in strict mode, so always provide fully typed code with explicit types.

We use Supabase for the database and authentication, not other providers, so use Supabase client methods and patterns.

We use .astro components for UI, not JSX or other frameworks, so generate Astro component syntax.

We follow a component-based architecture with these directories:

- `src/components/` for reusable UI components
- `src/layouts/` for page layouts
- `src/pages/` for routes and pages
- `src/store/` for Zustand state management
- `src/schema/` for Zod validation schemas
- `src/types/` for TypeScript definitions
- `src/utils/` for utility functions

We use kebab-case for file names and component names, not camelCase or PascalCase.

We use server-side authentication with cookies and SSR, not client-side only authentication.

We use form actions and server-side form handling, not client-side form libraries.

We use English language levels (A1, A2, B1, B2, C1, C2) and educational terminology in our business logic.

We use semantic HTML with proper accessibility attributes and ARIA labels.

We use responsive design with mobile-first approach using Tailwind CSS classes.

We use modern CSS features like CSS custom properties and grid/flexbox for layouts.

We use async/await for all asynchronous operations, not Promise chains.

We use destructuring in function parameters and props.

We use const assertions for readonly arrays and objects.

We use early returns for error handling and validation.

We use descriptive variable names that clearly indicate their purpose.

We use single quotes for strings in JavaScript/TypeScript, not double quotes.

We use trailing commas in objects and arrays.

We use 2 spaces for indentation, not tabs.

We use semicolons at the end of statements.

We use arrow functions for callbacks and utility functions.

We use template literals for string interpolation, not string concatenation.

We use optional chaining and nullish coalescing operators when appropriate.

We use type guards for runtime type checking.

We use proper error boundaries and error handling for user-facing errors.

We use loading states and optimistic updates for better user experience.

We use proper SEO meta tags and structured data for educational content.

We use performance optimization techniques like lazy loading and code splitting.

We use proper caching strategies for API responses and static assets.

We use proper logging for debugging and monitoring.

We prefer functional programming patterns over object-oriented patterns.

We prefer composition over inheritance.

We prefer explicit over implicit code.

We prefer readable code over clever code.

We prefer small, focused functions over large, complex functions.

We prefer pure functions without side effects when possible.

We prefer immutable data structures over mutable ones.

We prefer declarative code over imperative code.
