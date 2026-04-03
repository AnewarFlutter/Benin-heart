/**
 * Hook d'authentification — login, register, logout, OTP.
 * Utilise le featuresDi (Clean Architecture) au lieu d'appels directs à l'API.
 */
'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth_store';
import { featuresDi } from '@/di/features_di';
import { APP_ROUTES } from '@/shared/constants/routes';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/api_client';
import { API_ROUTES } from '@/shared/constants/api_routes';

export function useAuth() {
    const router = useRouter();
    const { setTokens, setUser, setPendingEmail, logout: clearAuth, isAuthenticated } = useAuthStore();

    async function login(email: string, password: string): Promise<boolean> {
        const session = await featuresDi.authController.login(email, password);
        if (!session?.accessToken || !session.refreshToken) {
            toast.error('Identifiants incorrects.');
            return false;
        }
        setTokens(session.accessToken, session.refreshToken);

        // Récupérer le profil utilisateur avec le token fraîchement obtenu
        const me = await apiClient<{
            id: string; email: string; first_name: string; last_name: string;
            phone: string; is_active: boolean;
        }>(API_ROUTES.AUTH.ME, { token: session.accessToken });
        if (me.data) {
            setUser({
                id: me.data.id,
                email: me.data.email,
                first_name: me.data.first_name,
                last_name: me.data.last_name,
                phone: me.data.phone,
                is_active: me.data.is_active,
            });
        }

        toast.success('Connexion réussie !');
        return true;
    }

    async function register(data: {
        email: string;
        password: string;
        password_confirm: string;
        first_name: string;
        last_name: string;
        phone: string;
    }): Promise<boolean> {
        const result = await featuresDi.authController.register({
            email: data.email,
            password: data.password,
            passwordConfirm: data.password_confirm,
            firstName: data.first_name,
            lastName: data.last_name,
            phone: data.phone,
        });
        if (!result) {
            toast.error("Erreur lors de l'inscription.");
            return false;
        }
        setPendingEmail(data.email);
        toast.success('Inscription réussie ! Vérifiez votre email pour le code OTP.');
        return true;
    }

    async function verifyOTP(email: string, otp_code: string): Promise<boolean> {
        const session = await featuresDi.authController.verifyOTP(email, otp_code);
        if (!session?.accessToken || !session.refreshToken) {
            toast.error('Code OTP invalide.');
            return false;
        }
        setTokens(session.accessToken, session.refreshToken);

        const me = await apiClient<{
            id: string; email: string; first_name: string; last_name: string;
            phone: string; is_active: boolean;
        }>(API_ROUTES.AUTH.ME, { token: session.accessToken });
        if (me.data) {
            setUser({
                id: me.data.id,
                email: me.data.email,
                first_name: me.data.first_name,
                last_name: me.data.last_name,
                phone: me.data.phone,
                is_active: me.data.is_active,
            });
        }

        toast.success('Email vérifié ! Bienvenue sur Benin Heart.');
        return true;
    }

    async function resendOTP(email: string): Promise<boolean> {
        const success = await featuresDi.authController.resendOTP(email);
        if (!success) {
            toast.error('Erreur lors du renvoi du code OTP.');
            return false;
        }
        toast.success('Code OTP renvoyé.');
        return true;
    }

    async function forgotPassword(email: string): Promise<boolean> {
        const success = await featuresDi.authController.forgotPassword(email);
        if (!success) {
            toast.error("Erreur lors de l'envoi du code de réinitialisation.");
            return false;
        }
        setPendingEmail(email);
        toast.success('Code de réinitialisation envoyé par email.');
        return true;
    }

    async function resetPassword(email: string, otp_code: string, new_password: string, new_password_confirm: string): Promise<boolean> {
        const success = await featuresDi.authController.resetPassword(email, otp_code, new_password, new_password_confirm);
        if (!success) {
            toast.error('Erreur lors de la réinitialisation du mot de passe.');
            return false;
        }
        toast.success('Mot de passe réinitialisé avec succès.');
        return true;
    }

    async function logout() {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
            await featuresDi.authController.logout(refreshToken).catch(() => {});
        }
        clearAuth();
        router.push(APP_ROUTES.auth.login);
    }

    return {
        isAuthenticated,
        login,
        register,
        verifyOTP,
        resendOTP,
        forgotPassword,
        resetPassword,
        logout,
    };
}
