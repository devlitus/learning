import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.js";

// Configuración de Supabase
const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://jddktbrjnbarmwmwtjyh.supabase.co';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZGt0YnJqbmJhcm13bXd0anloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTYyNzgsImV4cCI6MjA2NzI5MjI3OH0.vljo7dpb4pCAsdlC9MmjjBfzl5tzf3zddTrUAeYyIOU';

// Cliente principal para uso general
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Cliente para uso server-side (con opciones específicas)
export const supabaseServer = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Función para crear un cliente con token específico (útil para SSR)
export const createServerSupabaseClient = (accessToken?: string) => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : undefined
    }
  });
};