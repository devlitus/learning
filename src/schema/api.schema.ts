import {z} from "zod";

export const apiResponseSchema = z.object({
  data: z.any(),
  message: z.string().optional(),
  success: z.boolean(),
  status: z.number().optional(),
  error: z.string().optional()
});

export const apiRequestSchema = z.object({
  body: z.any(),
  params: z.any(),
  query: z.any()
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type ApiRequest = z.infer<typeof apiRequestSchema>;
