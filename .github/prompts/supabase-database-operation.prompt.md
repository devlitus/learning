# Add Supabase Database Operation

Your goal is to create database operations using Supabase for the Learning English Platform.

Ask for the operation type and table/data structure if not provided.

Requirements for database operations:

- Use the Supabase client from [src/lib/supabase.ts](../../src/lib/supabase.ts)
- Include proper TypeScript types from [src/types/database.ts](../../src/types/database.ts)
- Add proper error handling with try-catch blocks
- Use Row Level Security (RLS) patterns
- Include proper authentication checks when needed
- Follow the existing utility patterns in [src/utils/](../../src/utils/)
- Use async/await for all database operations
- Include proper validation with Zod schemas before database operations

Database operation patterns:

```typescript
import { supabase } from "../lib/supabase";
import { Database } from "../types/database";

type TableRow = Database["public"]["Tables"]["table_name"]["Row"];
type TableInsert = Database["public"]["Tables"]["table_name"]["Insert"];
type TableUpdate = Database["public"]["Tables"]["table_name"]["Update"];

export const operationName = async (
  params: ParamsType
): Promise<ReturnType> => {
  try {
    const { data, error } = await supabase
      .from("table_name")
      .select("*") // or specific columns
      .eq("column", value);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Operation failed:", error);
    throw error;
  }
};
```

Common operations for this platform:

- User level management (A1-C2 levels)
- Topic and category operations
- User progress tracking
- Authentication-related data
- Learning content management

Make sure to:

- Include proper error handling and logging
- Use TypeScript types for all parameters and return values
- Add JSDoc comments explaining the operation
- Include authentication checks for protected operations
- Use RLS policies appropriately
- Handle edge cases and null values
- Include proper validation before database operations
- Consider performance with proper indexing and queries
