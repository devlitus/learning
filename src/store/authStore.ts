import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import { authCredentialSchema, type AuthCredential } from "../schema/authCredential.schema";
import { userSchema, type User, fromSupabaseUser } from "../schema/user.schema";
import type { AuthSession } from "@supabase/supabase-js";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  login: (credentials: AuthCredential) => Promise<void>;
  register: (credentials: AuthCredential & { name: string }) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: AuthSession | null) => void;
  refreshSession: () => Promise<void>;
}

// Crear el store usando vanilla
export const authStore = createStore<AuthState>()(
  subscribeWithSelector((set, get) => ({
    isAuthenticated: false,
    user: null,
    session: null,
    loading: true,
    
    initialize: async () => {
      try {
        set({ loading: true });
        
        // Obtener la sesión actual de Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          set({ isAuthenticated: false, user: null, session: null, loading: false });
          return;
        }
        
        if (session?.user) {
          // Obtener los datos del usuario desde la base de datos
          const { data: userData, error: userError } = await supabase
            .from('user')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            console.error('Error getting user data:', userError);
            set({ isAuthenticated: false, user: null, session: null, loading: false });
            return;
          }
          
          if (userData) {
            const validatedUser = fromSupabaseUser(userData);
            set({ 
              isAuthenticated: true, 
              user: validatedUser, 
              session: session,
              loading: false 
            });
          }
        } else {
          set({ isAuthenticated: false, user: null, session: null, loading: false });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        set({ isAuthenticated: false, user: null, session: null, loading: false });
      }
    },
    
    login: async (credentials) => {
      try {
        set({ loading: true });
        
        // Validar credenciales con el esquema de Zod
        const validatedCredentials = authCredentialSchema.parse(credentials);
        
        // Iniciar sesión con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: validatedCredentials.email,
          password: validatedCredentials.password,
        });
        
        if (error) {
          set({ loading: false });
          throw new Error(error.message);
        }
        
        if (data.user && data.session) {
          // Obtener los datos del usuario desde la base de datos
          const { data: userData, error: userError } = await supabase
            .from('user')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (userError) {
            set({ loading: false });
            throw new Error('Error obteniendo datos del usuario');
          }
          
          if (userData) {
            const validatedUser = fromSupabaseUser(userData);
            set({ 
              isAuthenticated: true, 
              user: validatedUser, 
              session: data.session,
              loading: false 
            });
          }
        }
      } catch (error) {
        set({ loading: false });
        console.error('Login error:', error);
        throw error;
      }
    },
    
    register: async (credentials) => {
      try {
        set({ loading: true });
        
        // Validar credenciales
        const validatedCredentials = authCredentialSchema.parse(credentials);
        
        // Registrar usuario con Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: validatedCredentials.email,
          password: validatedCredentials.password,
        });
        
        if (error) {
          set({ loading: false });
          throw new Error(error.message);
        }
        
        if (data.user) {
          // Crear el registro en la tabla user
          const { error: insertError } = await supabase
            .from('user')
            .insert({
              id: data.user.id,
              email: validatedCredentials.email,
              name: credentials.name,
            });
          
          if (insertError) {
            set({ loading: false });
            throw new Error('Error creando el perfil del usuario');
          }
          
          // Si hay sesión, actualizar el estado
          if (data.session) {
            const newUser: User = {
              id: data.user.id,
              email: validatedCredentials.email,
              name: credentials.name,
              password: null,
            };
            
            set({ 
              isAuthenticated: true, 
              user: newUser, 
              session: data.session,
              loading: false 
            });
          } else {
            set({ loading: false });
          }
        }
      } catch (error) {
        set({ loading: false });
        console.error('Register error:', error);
        throw error;
      }
    },
    
    logout: async () => {
      try {
        set({ loading: true });
        
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Error logging out:', error);
        }
        
        set({ 
          isAuthenticated: false, 
          user: null, 
          session: null,
          loading: false 
        });
      } catch (error) {
        console.error('Logout error:', error);
        set({ 
          isAuthenticated: false, 
          user: null, 
          session: null,
          loading: false 
        });
      }
    },
    
    setUser: (user: User | null) => {
      set({ user, isAuthenticated: !!user });
    },
    
    setSession: (session: AuthSession | null) => {
      set({ session, isAuthenticated: !!session });
    },
    
    refreshSession: async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Error refreshing session:', error);
          set({ isAuthenticated: false, user: null, session: null });
          return;
        }
        
        if (data.session) {
          set({ session: data.session });
        }
      } catch (error) {
        console.error('Error refreshing session:', error);
        set({ isAuthenticated: false, user: null, session: null });
      }
    },
  }))
);

// Configurar listener para cambios de autenticación (solo una vez)
let authListenerConfigured = false;

const setupAuthListener = () => {
  if (authListenerConfigured) return;
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    const { setSession, setUser, initialize } = authStore.getState();
    
    console.log('Auth state changed:', event, session);
    
    switch (event) {
      case 'SIGNED_IN':
        if (session?.user) {
          // Inicializar completamente para obtener datos del usuario
          await initialize();
        }
        break;
      case 'SIGNED_OUT':
        setSession(null);
        setUser(null);
        break;
      case 'TOKEN_REFRESHED':
        setSession(session);
        break;
    }
  });
  
  authListenerConfigured = true;
};

// Configurar listener solo en el cliente
if (typeof window !== 'undefined') {
  setupAuthListener();
}

// Hook para usar el store en componentes
export const useAuthStore = () => {
  return {
    ...authStore.getState(),
    subscribe: authStore.subscribe,
  };
};

// Inicializar el store una sola vez
let storeInitialized = false;

export const initializeAuthStore = async () => {
  if (storeInitialized) return;
  
  try {
    await authStore.getState().initialize();
    storeInitialized = true;
  } catch (error) {
    console.error('Error initializing auth store:', error);
  }
};

// Auto-inicializar en el cliente
if (typeof window !== 'undefined') {
  initializeAuthStore();
}