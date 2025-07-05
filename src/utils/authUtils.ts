import { authStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import type { User } from '../schema/user.schema';
import type { AuthCredential } from '../schema/authCredential.schema';
import type { AuthSession } from '@supabase/supabase-js';

/**
 * Funciones utilitarias para manejar la autenticación del lado cliente
 * Estas funciones trabajan con Supabase Auth y el store de Zustand
 */

/**
 * Inicializar el estado de autenticación
 * Debe llamarse al inicio de la aplicación
 */
export const initAuth = async (): Promise<void> => {
  const { initialize } = authStore.getState();
  await initialize();
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
 * Obtener la sesión actual de Supabase
 * @returns {AuthSession | null} sesión activa o null si no está autenticado
 */
export const getCurrentSession = (): AuthSession | null => {
  const state = authStore.getState();
  return state.session;
};

/**
 * Verificar si el sistema está cargando
 * @returns {boolean} true si está cargando, false si no
 */
export const isLoading = (): boolean => {
  const state = authStore.getState();
  return state.loading;
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
 * Iniciar sesión con credenciales usando Supabase
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
 * Registrar nuevo usuario con Supabase
 * @param userData - datos del usuario (email, password, name)
 * @returns {Promise<void>} Promise que resuelve cuando el registro es exitoso
 */
export const signUp = async (userData: AuthCredential & { name: string }): Promise<void> => {
  try {
    const { register } = authStore.getState();
    await register(userData);
  } catch (error) {
    console.error('Error en signUp:', error);
    throw error;
  }
};

/**
 * Cerrar sesión del usuario
 * @returns {Promise<void>} Promise que resuelve cuando el logout es exitoso
 */
export const signOut = async (): Promise<void> => {
  try {
    const { logout } = authStore.getState();
    await logout();
  } catch (error) {
    console.error('Error en signOut:', error);
    throw error;
  }
};

/**
 * Refrescar la sesión actual
 * @returns {Promise<void>} Promise que resuelve cuando la sesión es refrescada
 */
export const refreshSession = async (): Promise<void> => {
  try {
    const { refreshSession } = authStore.getState();
    await refreshSession();
  } catch (error) {
    console.error('Error en refreshSession:', error);
    throw error;
  }
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
export const subscribeToAuthChanges = (callback: (state: any) => void) => {
  return authStore.subscribe(callback);
};

/**
 * Verificar si el usuario está autenticado y redirigir si no lo está
 * @param redirectUrl - URL a la que redirigir si no está autenticado
 * @returns {boolean} true si está autenticado, false si se redirigió
 */
export const requireAuth = (redirectUrl: string = '/signin'): boolean => {
  if (!isLoggedIn()) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
    return false;
  }
  return true;
};

/**
 * Verificar si el usuario está autenticado de manera asíncrona
 * @param redirectUrl - URL a la que redirigir si no está autenticado
 * @returns {Promise<boolean>} Promise que resuelve si está autenticado
 */
export const requireAuthAsync = async (redirectUrl: string = '/signin'): Promise<boolean> => {
  // Esperar a que termine de cargar
  await new Promise((resolve) => {
    const unsubscribe = authStore.subscribe((state) => {
      if (!state.loading) {
        unsubscribe();
        resolve(state);
      }
    });
    
    // Si ya no está cargando, resolver inmediatamente
    if (!authStore.getState().loading) {
      unsubscribe();
      resolve(authStore.getState());
    }
  });
  
  return requireAuth(redirectUrl);
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
    email: user.email || '',
  };
};

/**
 * Obtener el token de acceso actual
 * @returns {string | null} token de acceso o null si no está autenticado
 */
export const getAccessToken = (): string | null => {
  const session = getCurrentSession();
  return session?.access_token || null;
};

/**
 * Obtener el token de refresh actual
 * @returns {string | null} token de refresh o null si no está autenticado
 */
export const getRefreshToken = (): string | null => {
  const session = getCurrentSession();
  return session?.refresh_token || null;
};

/**
 * Verificar si la sesión ha expirado
 * @returns {boolean} true si la sesión ha expirado
 */
export const isSessionExpired = (): boolean => {
  const session = getCurrentSession();
  if (!session) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return session.expires_at ? now >= session.expires_at : false;
};

/**
 * Obtener el cliente de Supabase autenticado
 * @returns {object} cliente de Supabase con la sesión actual
 */
export const getAuthenticatedSupabaseClient = () => {
  return supabase;
};

/**
 * Sincronizar el estado del cliente con el servidor
 * Útil después de cambios en el servidor
 */
export const syncAuthState = async (): Promise<void> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error syncing auth state:', error);
      return;
    }
    
    const { setSession } = authStore.getState();
    setSession(session);
    
    if (session) {
      await initAuth();
    }
  } catch (error) {
    console.error('Error syncing auth state:', error);
  }
}; 