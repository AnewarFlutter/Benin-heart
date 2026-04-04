import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
    id: string;       // uuid
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    is_active: boolean;
}

export interface PendingRegisterProfile {
    prenom: string;
    dateNaissance?: string;
    genre?: 'HOMME' | 'FEMME' | 'AUTRE';
    pays?: string;
}

export interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: AuthUser | null;
    pendingEmail: string | null; // email en attente de vérification OTP
    pendingRegisterProfile: PendingRegisterProfile | null; // données profil post-register (non-persisté)
}

export interface AuthActions {
    setTokens: (access: string, refresh: string) => void;
    setUser: (user: AuthUser) => void;
    setPendingEmail: (email: string | null) => void;
    setPendingRegisterProfile: (data: PendingRegisterProfile | null) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            pendingEmail: null,
            pendingRegisterProfile: null,

            setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
            setUser: (user) => set({ user }),
            setPendingEmail: (email) => set({ pendingEmail: email ?? null }),
            setPendingRegisterProfile: (data) => set({ pendingRegisterProfile: data }),
            logout: () => set({ accessToken: null, refreshToken: null, user: null, pendingEmail: null, pendingRegisterProfile: null }),
            isAuthenticated: () => !!get().accessToken,
        }),
        {
            name: 'beninheart-auth',
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user,
                pendingEmail: state.pendingEmail,
            }),
        }
    )
);
