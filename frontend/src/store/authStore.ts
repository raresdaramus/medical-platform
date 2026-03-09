import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '../types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: Role | null;
  accountId: string | null;
  profileId: string | null; // patient or doctor UUID

  setTokens: (params: {
    accessToken: string;
    refreshToken: string;
    role: Role;
    accountId: string;
  }) => void;
  setAccessToken: (token: string) => void;
  setProfile: (profileId: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      accountId: null,
      profileId: null,

      setTokens: ({ accessToken, refreshToken, role, accountId }) => {
        set({ accessToken, refreshToken, role, accountId });
      },

      setAccessToken: (token: string) => {
        set({ accessToken: token });
      },

      setProfile: (profileId: string) => {
        set({ profileId });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          role: null,
          accountId: null,
          profileId: null,
        });
      },

      isAuthenticated: () => {
        const state = get();
        return state.accessToken !== null && state.role !== null;
      },
    }),
    {
      name: 'mediconnect-auth',
      partialize: (state: AuthState) => ({
        refreshToken: state.refreshToken,
        role: state.role,
        accountId: state.accountId,
        profileId: state.profileId,
      }),
    }
  )
);
