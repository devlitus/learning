import {z} from "zod";

export const userPreferencesSchema = z.object({
  level: z.enum(["beginner", "elementary", "intermediate", "advanced", "proficient"]),
  topic: z.enum([
    "technology",
    "business", 
    "travel",
    "health",
    "education",
    "entertainment",
    "food",
    "science",
    "sports"
  ]),
  completedOnboarding: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
}).strict();

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  preferences: userPreferencesSchema.optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;