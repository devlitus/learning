import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { authCredentialSchema, type AuthCredential } from "../schema/authCredential.schema";
import { userSchema, type User } from "../schema/user.schema";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: AuthCredential) => Promise<void>;
  logout: () => void;
  initialize: () => void;
  setUser: (user: User) => void;
}

// Utilidades para localStorage
const STORAGE_KEY = 'auth-user';

const setLocalStorage = (key: string, value: any) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const getLocalStorage = (key: string): any | null => {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const removeLocalStorage = (key: string) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Crear el store usando vanilla
export const authStore = createStore<AuthState>()(
  subscribeWithSelector((set, get) => ({
    isAuthenticated: false,
    user: null,
    
    initialize: () => {
      const userData = getLocalStorage(STORAGE_KEY);
      if (userData) {
        try {
          // Validar los datos del usuario con el esquema de Zod
          const validatedUser = userSchema.parse(userData);
          set({ isAuthenticated: true, user: validatedUser });
        } catch (error) {
          console.error('Invalid user data in localStorage:', error);
          // Limpiar datos corruptos
          removeLocalStorage(STORAGE_KEY);
          set({ isAuthenticated: false, user: null });
        }
      }
    },
    
    login: async (credentials) => {
      try {
        // Validar credenciales con el esquema de Zod
        const validatedCredentials = authCredentialSchema.parse(credentials);
        
        // Aquí normalmente harías una llamada a tu API
        // Por ahora, simulamos un usuario basado en las credenciales
        const mockUser: User = {
          id: crypto.randomUUID(),
          email: validatedCredentials.email,
          name: validatedCredentials.email.split('@')[0], // Nombre temporal basado en email
        };
        
        // Validar el usuario simulado
        const validatedUser = userSchema.parse(mockUser);
        
        // Guardar en localStorage
        setLocalStorage(STORAGE_KEY, validatedUser);
        
        // Actualizar el estado
        set({ isAuthenticated: true, user: validatedUser });
      } catch (error) {
        console.error('Login error:', error);
        throw new Error(error instanceof Error ? error.message : "Invalid credentials");
      }
    },
    
    logout: () => {
      removeLocalStorage(STORAGE_KEY);
      set({ isAuthenticated: false, user: null });
    },
    
    setUser: (user: User) => {
      try {
        // Validar el usuario con el esquema de Zod
        const validatedUser = userSchema.parse(user);
        setLocalStorage(STORAGE_KEY, validatedUser);
        set({ isAuthenticated: true, user: validatedUser });
      } catch (error) {
        console.error('Error setting user:', error);
        throw new Error("Invalid user data");
      }
    },
  }))
);

// Hook para usar el store en componentes
export const useAuthStore = () => {
  return {
    ...authStore.getState(),
    subscribe: authStore.subscribe,
  };
};