import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.js";

// Configuración de Supabase
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

// Cliente principal para uso en el navegador
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-auth-token', // Clave única para evitar conflictos
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Función para crear un cliente específico para SSR
export const createServerSupabaseClient = (accessToken?: string) => {
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: `sb-server-auth-${accessToken ? 'with-token' : 'no-token'}`, // Clave única
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

  console.log('SSR: Created Supabase client', { 
    hasToken: !!accessToken, 
    tokenLength: accessToken?.length || 0 
  });

  return client;
};