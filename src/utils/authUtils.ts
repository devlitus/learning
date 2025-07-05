import { authStore } from '../store/authStore';
import type { User } from '../schema/user.schema';
import type { AuthCredential } from '../schema/authCredential.schema';

/**
 * Funciones utilitarias para manejar la autenticación
 * Estas funciones trabajan directamente con el store sin necesidad de hooks
 */

/**
 * Inicializar el estado de autenticación
 * Debe llamarse al inicio de la aplicación
 */
export const initAuth = (): void => {
  const { initialize } = authStore.getState();
  initialize();
};

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean} true si está autenticado, false si no
 */
export const isLoggedIn = (): boolean => {
  const state = authStore.getState();
  return state.isAuthenticated && state.user !== null;
};

/**
 * Obtener la información del usuario actual
 * @returns {User | null} datos del usuario o null si no está autenticado
 */
export const getCurrentUser = (): User | null => {
  const state = authStore.getState();
  return state.user;
};

/**
 * Obtener el ID del usuario actual
 * @returns {string | null} ID del usuario o null si no está autenticado
 */
export const getUserId = (): string | null => {
  const state = authStore.getState();
  return state.user?.id ?? null;
};

/**
 * Obtener el nombre del usuario actual
 * @returns {string | null} nombre del usuario o null si no está autenticado
 */
export const getUserName = (): string | null => {
  const state = authStore.getState();
  return state.user?.name ?? null;
};

/**
 * Obtener el email del usuario actual
 * @returns {string | null} email del usuario o null si no está autenticado
 */
export const getUserEmail = (): string | null => {
  const state = authStore.getState();
  return state.user?.email ?? null;
};

/**
 * Verificar si el usuario tiene un email específico
 * @param email - email a verificar
 * @returns {boolean} true si el usuario actual tiene ese email
 */
export const hasEmail = (email: string): boolean => {
  const state = authStore.getState();
  return state.user?.email === email;
};

/**
 * Iniciar sesión con credenciales
 * @param credentials - email y password del usuario
 * @returns {Promise<void>} Promise que resuelve cuando el login es exitoso
 */
export const signIn = async (credentials: AuthCredential): Promise<void> => {
  try {
    const { login } = authStore.getState();
    await login(credentials);
  } catch (error) {
    console.error('Error en signIn:', error);
    throw error;
  }
};

/**
 * Cerrar sesión del usuario
 */
export const signOut = (): void => {
  const { logout } = authStore.getState();
  logout();
};

/**
 * Actualizar los datos del usuario
 * @param userData - nuevos datos del usuario
 */
export const updateUser = (userData: User): void => {
  const { setUser } = authStore.getState();
  setUser(userData);
};

/**
 * Obtener el estado completo de autenticación
 * @returns {object} estado completo del store
 */
export const getAuthState = () => {
  return authStore.getState();
};

/**
 * Suscribirse a cambios en el estado de autenticación
 * @param callback - función que se ejecuta cuando cambia el estado
 * @returns {function} función para cancelar la suscripción
 */
export const subscribeToAuthChanges = (callback: () => void) => {
  return authStore.subscribe(callback);
};

/**
 * Verificar si el usuario está autenticado y redirigir si no lo está
 * @param redirectUrl - URL a la que redirigir si no está autenticado
 * @returns {boolean} true si está autenticado, false si se redirigió
 */
export const requireAuth = (redirectUrl: string = '/auth/login'): boolean => {
  initAuth();
  if (!isLoggedIn()) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
    return false;
  }
  return true;
};

/**
 * Obtener información resumida del usuario para mostrar en la UI
 * @returns {object | null} información del usuario o null si no está autenticado
 */
export const getUserInfo = (): { id: string; name: string; email: string } | null => {
  const user = getCurrentUser();
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
};

/**
 * Verificar si hay datos de usuario en localStorage
 * @returns {boolean} true si hay datos guardados
 */
export const hasStoredAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem('auth-user');
    return stored !== null;
  } catch {
    return false;
  }
};

/**
 * Obtener datos de usuario desde localStorage (para debugging)
 * @returns {object | null} datos del usuario o null si no hay datos
 */
export const getStoredAuthData = (): any | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('auth-user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Limpiar datos de autenticación (logout + limpieza de localStorage)
 */
export const clearAuth = (): void => {
  signOut();
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('auth-user');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}; 