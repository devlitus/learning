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
 * Simular base de datos de usuarios (en una aplicación real esto sería una base de datos)
 */
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Administrator'
  },
  {
    id: '2', 
    email: 'user@example.com',
    name: 'Test User'
  }
];

// Simular contraseñas (en una aplicación real estarían hasheadas)
const MOCK_PASSWORDS: Record<string, string> = {
  'admin@example.com': 'password123',
  'user@example.com': 'password123'
};

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
    
    // Verificar credenciales contra la "base de datos" mock
    const user = MOCK_USERS.find(u => u.email === validatedCredentials.email);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    const correctPassword = MOCK_PASSWORDS[validatedCredentials.email];
    if (correctPassword !== validatedCredentials.password) {
      return { success: false, error: 'Contraseña incorrecta' };
    }
    
    // Guardar usuario en cookies
    cookies.set('auth-user', JSON.stringify(user), COOKIE_OPTIONS);
    
    return { success: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Error de autenticación' };
  }
}

/**
 * Registrar nuevo usuario
 */
export async function registerUser(
  userData: { email: string; name: string; password: string; confirmPassword: string },
  cookies: AstroCookies
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Validar que las contraseñas coincidan
    if (userData.password !== userData.confirmPassword) {
      return { success: false, error: 'Las contraseñas no coinciden' };
    }
    
    // Validar contraseña
    const credentialsValidation = authCredentialSchema.safeParse({
      email: userData.email,
      password: userData.password
    });
    
    if (!credentialsValidation.success) {
      return { 
        success: false, 
        error: credentialsValidation.error.issues[0]?.message || 'Datos inválidos' 
      };
    }
    
    // Verificar que el usuario no exista
    const existingUser = MOCK_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'El usuario ya existe' };
    }
    
    // Crear nuevo usuario
    const newUser: User = {
      id: crypto.randomUUID(),
      email: userData.email,
      name: userData.name
    };
    
    // Validar datos del usuario
    const validatedUser = userSchema.parse(newUser);
    
    // En una aplicación real, aquí guardarías en la base de datos
    MOCK_USERS.push(validatedUser);
    MOCK_PASSWORDS[userData.email] = userData.password;
    
    // Guardar usuario en cookies
    cookies.set('auth-user', JSON.stringify(validatedUser), COOKIE_OPTIONS);
    
    return { success: true, user: validatedUser };
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Error en el registro' };
  }
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