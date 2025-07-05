import type { AstroCookies } from 'astro';
import { createServerSupabaseClient } from '../lib/supabase';
import { authCredentialSchema, type AuthCredential } from '../schema/authCredential.schema';
import { userSchema, type User, fromSupabaseUser } from '../schema/user.schema';
import type { AuthSession } from '@supabase/supabase-js';

/**
 * Utilidades para manejar autenticación server-side con Supabase
 */

// Configuración de cookies para tokens de Supabase
const COOKIE_OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 días
  httpOnly: true, // Seguridad - solo accesible desde el servidor
  secure: process.env.NODE_ENV === 'production', // HTTPS en producción
  sameSite: 'lax' as const
};

/**
 * Obtener tokens de Supabase desde las cookies
 */
export function getSupabaseTokens(cookies: AstroCookies): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  const accessToken = cookies.get('sb-access-token')?.value || null;
  const refreshToken = cookies.get('sb-refresh-token')?.value || null;
  
  return { accessToken, refreshToken };
}

/**
 * Obtener usuario autenticado desde Supabase usando tokens de cookies
 */
export async function getAuthenticatedUser(cookies: AstroCookies): Promise<User | null> {
  try {
    const { accessToken } = getSupabaseTokens(cookies);
    
    if (!accessToken) {
      return null;
    }
    
    // Crear cliente de Supabase con el token de acceso
    const supabase = createServerSupabaseClient(accessToken);
    
    // Obtener el usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Error getting authenticated user:', authError);
      // Limpiar cookies corruptas
      clearAuthCookies(cookies);
      return null;
    }
    
    // Obtener datos del usuario desde la base de datos
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData) {
      console.error('Error getting user data:', userError);
      return null;
    }
    
    return fromSupabaseUser(userData);
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    clearAuthCookies(cookies);
    return null;
  }
}

/**
 * Obtener sesión de Supabase desde cookies
 */
export async function getSupabaseSession(cookies: AstroCookies): Promise<AuthSession | null> {
  try {
    const { accessToken } = getSupabaseTokens(cookies);
    
    if (!accessToken) {
      return null;
    }
    
    const supabase = createServerSupabaseClient(accessToken);
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Verificar si el usuario está autenticado
 */
export async function isAuthenticated(cookies: AstroCookies): Promise<boolean> {
  const user = await getAuthenticatedUser(cookies);
  return user !== null;
}

/**
 * Autenticar usuario con credenciales usando Supabase
 */
export async function authenticateUser(
  credentials: AuthCredential,
  cookies: AstroCookies
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Validar credenciales
    const validatedCredentials = authCredentialSchema.parse(credentials);
    
    // Crear cliente de Supabase
    const supabase = createServerSupabaseClient();
    
    // Autenticar con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedCredentials.email,
      password: validatedCredentials.password,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data.user || !data.session) {
      return { success: false, error: 'No se pudo iniciar sesión' };
    }
    
    // Obtener datos del usuario desde la base de datos
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError || !userData) {
      return { success: false, error: 'Error obteniendo datos del usuario' };
    }
    
    // Guardar tokens en cookies
    setAuthCookies(cookies, data.session);
    
    const validatedUser = fromSupabaseUser(userData);
    return { success: true, user: validatedUser };
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Error de autenticación' };
  }
}

/**
 * Registrar nuevo usuario con Supabase
 */
export async function registerUser(
  userData: { email: string; name: string; password: string },
  cookies: AstroCookies
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Validar credenciales
    const validatedCredentials = authCredentialSchema.parse({
      email: userData.email,
      password: userData.password,
    });
    
    const supabase = createServerSupabaseClient();
    
    // Registrar usuario con Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: validatedCredentials.email,
      password: validatedCredentials.password,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data.user) {
      return { success: false, error: 'Error al crear el usuario' };
    }
    
    // Crear registro en la tabla user
    const { error: insertError } = await supabase
      .from('user')
      .insert({
        id: data.user.id,
        email: validatedCredentials.email,
        name: userData.name,
      });
    
    if (insertError) {
      return { success: false, error: 'Error creando el perfil del usuario' };
    }
    
    // Si hay sesión, guardar tokens
    if (data.session) {
      setAuthCookies(cookies, data.session);
      
      const newUser: User = {
        id: data.user.id,
        email: validatedCredentials.email,
        name: userData.name,
        password: null,
      };
      
      return { success: true, user: newUser };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Error de registro' };
  }
}

/**
 * Cerrar sesión del usuario
 */
export async function logoutUser(cookies: AstroCookies): Promise<{ success: boolean; error?: string }> {
  try {
    const { accessToken } = getSupabaseTokens(cookies);
    
    if (accessToken) {
      const supabase = createServerSupabaseClient(accessToken);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error logging out:', error);
      }
    }
    
    // Limpiar cookies
    clearAuthCookies(cookies);
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    clearAuthCookies(cookies);
    return { success: false, error: 'Error al cerrar sesión' };
  }
}

/**
 * Establecer cookies de autenticación
 */
export function setAuthCookies(cookies: AstroCookies, session: AuthSession): void {
  cookies.set('sb-access-token', session.access_token, COOKIE_OPTIONS);
  cookies.set('sb-refresh-token', session.refresh_token, COOKIE_OPTIONS);
}

/**
 * Limpiar cookies de autenticación
 */
export function clearAuthCookies(cookies: AstroCookies): void {
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
}

/**
 * Middleware para requerir autenticación
 */
export async function requireAuth(cookies: AstroCookies, redirectTo: string = '/signin'): Promise<{ 
  isAuthenticated: boolean; 
  user: User | null; 
  redirectResponse?: Response 
}> {
  const user = await getAuthenticatedUser(cookies);
  
  if (!user) {
    return {
      isAuthenticated: false,
      user: null,
      redirectResponse: new Response(null, {
        status: 302,
        headers: { Location: redirectTo }
      })
    };
  }
  
  return {
    isAuthenticated: true,
    user
  };
}

/**
 * Refrescar tokens de sesión
 */
export async function refreshAuthTokens(cookies: AstroCookies): Promise<{ success: boolean; error?: string }> {
  try {
    const { refreshToken } = getSupabaseTokens(cookies);
    
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }
    
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    
    if (error || !data.session) {
      clearAuthCookies(cookies);
      return { success: false, error: 'Error refreshing session' };
    }
    
    // Actualizar cookies con nuevos tokens
    setAuthCookies(cookies, data.session);
    
    return { success: true };
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    clearAuthCookies(cookies);
    return { success: false, error: 'Error refreshing session' };
  }
} 