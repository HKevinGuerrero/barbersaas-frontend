import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Definimos los tipos exactos para que TypeScript nos ayude a no cometer errores
export type UserRole = 'cliente' | 'barbero' | 'dueno' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Acciones (Funciones para modificar el estado)
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// 2. Creamos el Store global con Zustand
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Estado inicial (cuando nadie ha iniciado sesión)
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Función para iniciar sesión (Guarda el usuario y el token)
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      // Función para cerrar sesión (Borra todo)
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
      
      // Función para actualizar datos específicos (ej: cuando cambian su foto de perfil)
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    {
      name: 'barbersaas-auth', // Este es el nombre con el que se guardará en el LocalStorage
    }
  )
);