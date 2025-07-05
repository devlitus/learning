import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";
import { clearAuthTokens } from "../../utils/serverAuth";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  try {
    console.log("[SIGNOUT] Iniciando proceso de cierre de sesión");
    
    // Cerrar sesión en Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("[SIGNOUT] Error al cerrar sesión en Supabase:", error);
    } else {
      console.log("[SIGNOUT] Sesión cerrada exitosamente en Supabase");
    }
    
    // Limpiar cookies locales
    clearAuthTokens(cookies);
    console.log("[SIGNOUT] Cookies de autenticación limpiadas");
    
    // Redirigir al inicio
    return redirect("/signin?message=logout-success");
    
  } catch (error) {
    console.error("[SIGNOUT] Error en el proceso de cierre de sesión:", error);
    
    // Limpiar cookies de todas formas
    clearAuthTokens(cookies);
    
    return redirect("/signin?error=logout-error");
  }
};

export const GET: APIRoute = async ({ cookies, redirect }) => {
  clearAuthTokens(cookies);
  return redirect("/signin");
};