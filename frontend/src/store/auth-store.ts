import { create } from "zustand";
import type { UserPerfil } from "@/types/api";

interface User {
  id: string;
  nome: string;
  email: string;
  perfil: UserPerfil;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, user: User) => void;
  clearAuth: () => void;
}

// Sem persist — o estado fica só em memória.
// A fonte da verdade para proteção de rotas é o cookie,
// lido pelo middleware.ts antes de qualquer render.
export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setAuth: (accessToken, user) =>
    set({ accessToken, user, isAuthenticated: true }),
  clearAuth: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),
}));