import {z} from "zod";

export const userPreferencesSchema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced"]),
  topics: z.string() //select only one topic
}).strict();

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(2).max(100),
});
export type User = z.infer<typeof userSchema>;