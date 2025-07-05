# Create Zod Schema

Your goal is to create a new Zod validation schema for the Learning English Platform.

Ask for the schema purpose and data structure if not provided.

Requirements for the schema:

- Use Zod with strict validation using `.strict()` to prevent extra properties
- Include proper TypeScript type inference with `z.infer<typeof schema>`
- Add descriptive error messages for user-facing validation
- Use appropriate Zod methods for different data types
- Include proper validation for English learning context (levels A1-C2, educational terms)
- Follow the existing schema structure in [src/schema/](../../src/schema/)
- Export both the schema and the inferred type
- Include JSDoc comments explaining the schema purpose

Schema structure should follow this pattern:

```typescript
import { z } from "zod";

export const schemaNameSchema = z
  .object({
    // Define validation rules here
    field: z.string().min(1, "Field is required"),
    // Add more fields as needed
  })
  .strict();

export type SchemaName = z.infer<typeof schemaNameSchema>;
```

Common patterns for this platform:

- English levels: `z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])`
- Email validation: `z.string().email('Invalid email format')`
- UUID validation: `z.string().uuid('Invalid UUID format')`
- Required strings: `z.string().min(1, 'Field is required')`
- Optional fields: `z.string().optional()`
- Arrays: `z.array(z.string()).min(1, 'At least one item required')`
- Nested objects: Use composition with other schemas

Make sure to:

- Include proper error messages for UX
- Use transforms when needed for data normalization
- Add refinements for complex validation rules
- Consider the educational context of the platform
- Include examples in JSDoc comments
