# Add Zustand Store Function

Your goal is to add functionality to the Zustand store for the Learning English Platform.

Ask for the store function purpose and data structure if not provided.

Requirements for store functions:

- Use Zustand/vanilla store pattern (not React hooks)
- Include proper TypeScript typing for all state and actions
- Add Zod validation for data before storing
- Include localStorage persistence when appropriate
- Use proper error handling with try-catch blocks
- Follow the existing store structure in [src/store/](../../src/store/)
- Include proper state immutability patterns
- Add utility functions for easy access to store data

Store function patterns:

```typescript
import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { schemaName } from "../schema/schema.schema";

interface StoreState {
  // Define state structure
  data: DataType | null;
  isLoading: boolean;
  error: string | null;
}

interface StoreActions {
  // Define actions
  setData: (data: DataType) => void;
  clearData: () => void;
  // Add more actions as needed
}

export const store = createStore<StoreState & StoreActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    data: null,
    isLoading: false,
    error: null,

    // Actions
    setData: (data) => {
      try {
        // Validate with Zod
        const validatedData = schemaName.parse(data);

        // Update state
        set({ data: validatedData, error: null });

        // Persist to localStorage if needed
        if (typeof window !== "undefined") {
          localStorage.setItem("key", JSON.stringify(validatedData));
        }
      } catch (error) {
        console.error("Store error:", error);
        set({ error: error.message });
      }
    },

    clearData: () => {
      set({ data: null, error: null });
      if (typeof window !== "undefined") {
        localStorage.removeItem("key");
      }
    },
  }))
);
```

Common patterns for this platform:

- Authentication state management
- User level and topic preferences
- Learning progress tracking
- Form state management
- Error and loading states
- Educational content state

Make sure to:

- Include proper TypeScript types for all state and actions
- Add Zod validation for data integrity
- Handle localStorage operations safely (check for window)
- Include proper error handling and logging
- Use immutable state update patterns
- Add utility functions for common operations
- Include JSDoc comments for complex functions
- Consider performance with proper state structure
- Handle edge cases and null values
- Include proper initialization and cleanup
