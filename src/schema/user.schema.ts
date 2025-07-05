import { z } from "zod";
import type { User as SupabaseUser, UserInsert as SupabaseUserInsert, UserUpdate as SupabaseUserUpdate } from "../types/database";

// Schema de validación para el usuario (compatible con Supabase)
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  name: z.string().min(1).max(100),
  password: z.string().nullable(), // En producción, esto no debería estar expuesto
});

// Schema para insertar un usuario
export const userInsertSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email().optional(),
  name: z.string().min(1).max(100),
  password: z.string().optional(),
});

// Schema para actualizar un usuario
export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
  password: z.string().optional(),
});

// Tipos TypeScript derivados de los schemas
export type User = z.infer<typeof userSchema>;
export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;

// Función para convertir un usuario de Supabase a nuestro tipo interno
export const fromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return userSchema.parse({
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.name,
    password: supabaseUser.password,
  });
};

// Función para convertir nuestro tipo interno a Supabase
export const toSupabaseUser = (user: User): SupabaseUser => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    password: user.password,
  };
};