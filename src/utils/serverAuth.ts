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
 * Inicializar autenticación del lado cliente
 * Esta función puede ser llamada desde el navegador
 */
export async function initAuth(): Promise<void> {
  console.log('[AUTH] Initializing client-side authentication');
  // En el lado cliente, no necesitamos hacer mucho
  // La autenticación se maneja principalmente server-side
}

/**
 * Establecer tokens de autenticación en cookies
 */
export function setAuthTokens(
  cookies: AstroCookies, 
  accessToken: string, 
  refreshToken: string
): void {
  console.log('[AUTH] Setting auth tokens in cookies');
  console.log('[AUTH] Cookie options:', COOKIE_OPTIONS);
  
  cookies.set('sb-access-token', accessToken, COOKIE_OPTIONS);
  cookies.set('sb-refresh-token', refreshToken, COOKIE_OPTIONS);
  
  // Verificar inmediatamente
  const verifyAccess = cookies.get('sb-access-token')?.value;
  const verifyRefresh = cookies.get('sb-refresh-token')?.value;
  
  console.log('[AUTH] Verification after setting:', {
    accessSet: !!verifyAccess,
    refreshSet: !!verifyRefresh,
    accessLength: verifyAccess?.length || 0,
    refreshLength: verifyRefresh?.length || 0
  });
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
  
  console.log('[AUTH] Reading tokens from cookies:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenLength: accessToken?.length || 0,
    refreshTokenLength: refreshToken?.length || 0
  });
  
  return { accessToken, refreshToken };
}

/**
 * Limpiar tokens de autenticación
 */
export function clearAuthTokens(cookies: AstroCookies): void {
  console.log('[AUTH] Clearing auth tokens');
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
      console.log('[AUTH] No tokens found, user not authenticated');
      return null;
    }
    
    const supabase = createServerSupabaseClient(accessToken);
    
    // Verificar el token
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('[AUTH] Token invalid or expired:', error?.message);
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
    
    console.log('[AUTH] User authenticated successfully:', userData.email);
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
