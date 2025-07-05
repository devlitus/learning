import type { AstroCookies } from 'astro';
import { createServerSupabaseClient } from '../lib/supabase';

/**
 * Utilidades simplificadas para autenticación con cookies no-httpOnly en desarrollo
 */

interface SimpleUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const isDev = process.env.NODE_ENV === 'development';

const COOKIE_OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 días
  httpOnly: !isDev, // No httpOnly en desarrollo para debugging
  secure: !isDev ? true : false, // HTTPS solo en producción
  sameSite: 'lax' as const
};

/**
 * Establecer tokens de autenticación en cookies
 */
export function setAuthTokens(
  cookies: AstroCookies, 
  accessToken: string, 
  refreshToken: string
): void {
    
  cookies.set('sb-access-token', accessToken, COOKIE_OPTIONS);
  cookies.set('sb-refresh-token', refreshToken, COOKIE_OPTIONS);
  
    
}

/**
 * Obtener tokens de autenticación desde cookies
 */
export function getAuthTokens(cookies: AstroCookies): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  const accessToken = cookies.get('sb-access-token')?.value || null;
  const refreshToken = cookies.get('sb-refresh-token')?.value || null;  
  return { accessToken, refreshToken };
}

/**
 * Limpiar tokens de autenticación
 */
export function clearAuthTokens(cookies: AstroCookies): void {
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
}

/**
 * Obtener usuario autenticado (versión simplificada)
 */
export async function getAuthenticatedUser(cookies: AstroCookies): Promise<SimpleUser | null> {
  try {
    const { accessToken, refreshToken } = getAuthTokens(cookies);
    
    if (!accessToken || !refreshToken) {
     
      return null;
    }
    
    const supabase = createServerSupabaseClient(accessToken);
    
    // Verificar el token
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
     
      clearAuthTokens(cookies);
      return null;
    }
    
    // Obtener datos del usuario desde la base de datos
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, name, email')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData) {
      console.error('[AUTH] Error getting user data:', userError);
      return null;
    }
    
    return {
      id: userData.id,
      name: userData.name || '',
      email: userData.email || '',
      createdAt: user.created_at || new Date().toISOString()
    };
    
  } catch (error) {
    console.error('[AUTH] Error in getAuthenticatedUser:', error);
    clearAuthTokens(cookies);
    return null;
  }
}
