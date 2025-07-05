import type { AstroCookies } from 'astro';
import { authCredentialSchema, type AuthCredential } from '../schema/authCredential.schema';
import { userSchema, type User } from '../schema/user.schema';

/**
 * Utilidades para manejar autenticación server-side con cookies
 */

// Configuración de cookies
const COOKIE_OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 días
  httpOnly: false, // Necesitamos que sea accesible desde JS para verificaciones client-side
  secure: false, // En producción debería ser true con HTTPS
  sameSite: 'lax' as const
};

/**
 * Usuario único de prueba para la aplicación
 */
const TEST_USER: User = {
  id: 'test-user-001',
  email: 'test@example.com',
  name: 'Test User'
};

// Credenciales del usuario de prueba
const TEST_PASSWORD = '12345678';

/**
 * Obtener usuario autenticado desde cookies
 */
export function getAuthenticatedUser(cookies: AstroCookies): User | null {
  try {
    const userData = cookies.get('auth-user')?.value;
    if (!userData) return null;
    
    const parsedUser = JSON.parse(userData);
    return userSchema.parse(parsedUser);
  } catch (error) {
    console.error('Error parsing user from cookies:', error);
    // Limpiar cookies corruptas
    cookies.delete('auth-user', { path: '/' });
    return null;
  }
}

/**
 * Verificar si el usuario está autenticado
 */
export function isAuthenticated(cookies: AstroCookies): boolean {
  return getAuthenticatedUser(cookies) !== null;
}

/**
 * Autenticar usuario con credenciales
 */
export async function authenticateUser(
  credentials: AuthCredential,
  cookies: AstroCookies
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Validar credenciales
    const validatedCredentials = authCredentialSchema.parse(credentials);
    
    // Verificar credenciales contra el usuario de prueba
    if (validatedCredentials.email !== TEST_USER.email) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    if (validatedCredentials.password !== TEST_PASSWORD) {
      return { success: false, error: 'Contraseña incorrecta' };
    }
    
    // Guardar usuario en cookies
    cookies.set('auth-user', JSON.stringify(TEST_USER), COOKIE_OPTIONS);
    
    return { success: true, user: TEST_USER };
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Error de autenticación' };
  }
}

/**
 * Registrar nuevo usuario (DESHABILITADO - Solo usuario de prueba)
 */
export async function registerUser(
  userData: { email: string; name: string; password: string; confirmPassword: string },
  cookies: AstroCookies
): Promise<{ success: boolean; user?: User; error?: string }> {
  // El registro está deshabilitado ya que solo hay un usuario de prueba
  return { 
    success: false, 
    error: 'El registro está deshabilitado. Usa las credenciales de prueba para iniciar sesión.' 
  };
}

/**
 * Cerrar sesión del usuario
 */
export function logoutUser(cookies: AstroCookies): void {
  cookies.delete('auth-user', { path: '/' });
}

/**
 * Middleware para requerir autenticación
 */
export function requireAuth(cookies: AstroCookies, redirectTo: string = '/auth/login'): { 
  isAuthenticated: boolean; 
  user: User | null; 
  redirectResponse?: Response 
} {
  const user = getAuthenticatedUser(cookies);
  
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