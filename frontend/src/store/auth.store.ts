import { create } from 'zustand';

type Role = 'superadmin' | 'customer';

type AuthState = {
  accessToken: string | null;
  user: { id: string; email: string; role: Role } | null;
  setAuth: (payload: { accessToken: string | null; user: AuthState['user'] }) => void;
  clearAuth: () => void;
};

export const authStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: ({ accessToken, user }) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null })
}));
