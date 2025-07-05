import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { userPreferencesSchema, type UserPreferences } from "../schema/user.schema";

export interface UserPreferencesState {
  preferences: UserPreferences | null;
  setLevel: (level: UserPreferences['level']) => void;
  setTopic: (topic: UserPreferences['topic']) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  completeOnboarding: () => void;
  initialize: () => void;
  clear: () => void;
}

// Utilidades para localStorage
const STORAGE_KEY = 'user-preferences';

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
export const userPreferencesStore = createStore<UserPreferencesState>()(
  subscribeWithSelector((set, get) => ({
    preferences: null,
    
    initialize: () => {
      const preferencesData = getLocalStorage(STORAGE_KEY);
      if (preferencesData) {
        try {
          // Convertir fechas de strings de vuelta a objetos Date
          const parsedData = {
            ...preferencesData,
            createdAt: new Date(preferencesData.createdAt),
            updatedAt: new Date(preferencesData.updatedAt),
          };
          
          // Validar los datos con el esquema de Zod
          const validatedPreferences = userPreferencesSchema.parse(parsedData);
          set({ preferences: validatedPreferences });
        } catch (error) {
          console.error('Invalid preferences data in localStorage:', error);
          // Limpiar datos corruptos
          removeLocalStorage(STORAGE_KEY);
          set({ preferences: null });
        }
      }
    },
    
    setLevel: (level) => {
      const currentPreferences = get().preferences;
      const newPreferences = {
        ...currentPreferences,
        level,
        updatedAt: new Date(),
        // Si no hay preferencias existentes, usar valores por defecto
        topic: currentPreferences?.topic,
        completedOnboarding: currentPreferences?.completedOnboarding || false,
        createdAt: currentPreferences?.createdAt || new Date(),
      };
      
      // Solo actualizar si tenemos un topic válido
      if (newPreferences.topic) {
        try {
          const validatedPreferences = userPreferencesSchema.parse(newPreferences);
          setLocalStorage(STORAGE_KEY, validatedPreferences);
          set({ preferences: validatedPreferences });
        } catch (error) {
          console.error('Error setting level:', error);
        }
      } else {
        // Guardar parcialmente hasta que se complete el onboarding
        set({ preferences: newPreferences as UserPreferences });
      }
    },
    
    setTopic: (topic) => {
      const currentPreferences = get().preferences;
      const newPreferences = {
        ...currentPreferences,
        topic,
        updatedAt: new Date(),
        // Si no hay preferencias existentes, usar valores por defecto
        level: currentPreferences?.level,
        completedOnboarding: currentPreferences?.completedOnboarding || false,
        createdAt: currentPreferences?.createdAt || new Date(),
      };
      
      // Solo actualizar si tenemos un level válido
      if (newPreferences.level) {
        try {
          const validatedPreferences = userPreferencesSchema.parse(newPreferences);
          setLocalStorage(STORAGE_KEY, validatedPreferences);
          set({ preferences: validatedPreferences });
        } catch (error) {
          console.error('Error setting topic:', error);
        }
      } else {
        // Guardar parcialmente hasta que se complete el onboarding
        set({ preferences: newPreferences as UserPreferences });
      }
    },
    
    setPreferences: (newPreferences) => {
      const currentPreferences = get().preferences;
      const updatedPreferences = {
        level: currentPreferences?.level || newPreferences.level,
        topic: currentPreferences?.topic || newPreferences.topic,
        completedOnboarding: currentPreferences?.completedOnboarding || newPreferences.completedOnboarding || false,
        createdAt: currentPreferences?.createdAt || newPreferences.createdAt || new Date(),
        updatedAt: new Date(),
        ...newPreferences,
      };
      
      try {
        const validatedPreferences = userPreferencesSchema.parse(updatedPreferences);
        setLocalStorage(STORAGE_KEY, validatedPreferences);
        set({ preferences: validatedPreferences });
      } catch (error) {
        console.error('Error setting preferences:', error);
        throw new Error('Invalid preferences data');
      }
    },
    
    completeOnboarding: () => {
      const currentPreferences = get().preferences;
      if (currentPreferences?.level && currentPreferences?.topic) {
        const completedPreferences = {
          ...currentPreferences,
          completedOnboarding: true,
          updatedAt: new Date(),
        };
        
        try {
          const validatedPreferences = userPreferencesSchema.parse(completedPreferences);
          setLocalStorage(STORAGE_KEY, validatedPreferences);
          set({ preferences: validatedPreferences });
        } catch (error) {
          console.error('Error completing onboarding:', error);
          throw new Error('Cannot complete onboarding: missing required preferences');
        }
      } else {
        throw new Error('Cannot complete onboarding: missing level or topic');
      }
    },
    
    clear: () => {
      removeLocalStorage(STORAGE_KEY);
      set({ preferences: null });
    },
  }))
);

// Hook para usar el store en componentes
export const useUserPreferencesStore = () => {
  return {
    ...userPreferencesStore.getState(),
    subscribe: userPreferencesStore.subscribe,
  };
}; 