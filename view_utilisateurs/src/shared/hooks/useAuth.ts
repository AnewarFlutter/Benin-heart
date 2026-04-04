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
        console.log('[useAuth] login() → email:', email);
        const session = await featuresDi.authController.login(email, password);
        console.log('[useAuth] login() ← session:', session);
        if (!session?.accessToken || !session.refreshToken) {
            console.warn('[useAuth] login() — tokens manquants dans la réponse');
            toast.error('Identifiants incorrects.');
            return false;
        }
        setTokens(session.accessToken, session.refreshToken);
        console.log('[useAuth] login() — tokens stockés, récupération profil /me ...');

        const me = await apiClient<{
            id: string; email: string; first_name: string; last_name: string;
            phone: string; is_active: boolean;
        }>(API_ROUTES.AUTH.ME, { token: session.accessToken });
        console.log('[useAuth] login() /me ←', me);
        if (me.data) {
            setUser({
                id: me.data.id,
                email: me.data.email,
                first_name: me.data.first_name,
                last_name: me.data.last_name,
                phone: me.data.phone,
                is_active: me.data.is_active,
            });
            console.log('[useAuth] login() — user stocké');
        } else {
            console.warn('[useAuth] login() — /me échoué, status:', me.status, 'error:', me.error);
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
        console.log('[useAuth] register() → payload:', { ...data, password: '***', password_confirm: '***' });
        const result = await featuresDi.authController.register({
            email: data.email,
            password: data.password,
            passwordConfirm: data.password_confirm,
            firstName: data.first_name,
            lastName: data.last_name,
            phone: data.phone,
        });
        console.log('[useAuth] register() ← result:', result);
        if (!result) {
            console.warn('[useAuth] register() — échec, result est null');
            toast.error("Erreur lors de l'inscription.");
            return false;
        }
        setPendingEmail(data.email);
        console.log('[useAuth] register() — pendingEmail défini:', data.email);
        toast.success('Inscription réussie ! Vérifiez votre email pour le code OTP.');
        return true;
    }

    async function verifyOTP(email: string, otp_code: string): Promise<boolean> {
        console.log('[useAuth] verifyOTP() → email:', email, 'code:', otp_code);
        const success = await featuresDi.authController.verifyOTP(email, otp_code);
        console.log('[useAuth] verifyOTP() ← success:', success);
        if (!success) {
            console.warn('[useAuth] verifyOTP() — code invalide ou erreur backend');
            toast.error('Code OTP invalide.');
            return false;
        }
        toast.success('Email vérifié ! Connectez-vous pour accéder à votre compte.');
        return true;
    }

    async function resendOTP(email: string): Promise<boolean> {
        console.log('[useAuth] resendOTP() → email:', email);
        const success = await featuresDi.authController.resendOTP(email);
        console.log('[useAuth] resendOTP() ← success:', success);
        if (!success) {
            console.warn('[useAuth] resendOTP() — échec');
            toast.error('Erreur lors du renvoi du code OTP.');
            return false;
        }
        toast.success('Code OTP renvoyé.');
        return true;
    }

    async function forgotPassword(email: string): Promise<boolean> {
        console.log('[useAuth] forgotPassword() → email:', email);
        const success = await featuresDi.authController.forgotPassword(email);
        console.log('[useAuth] forgotPassword() ← success:', success);
        if (!success) {
            console.warn('[useAuth] forgotPassword() — échec');
            toast.error("Erreur lors de l'envoi du code de réinitialisation.");
            return false;
        }
        setPendingEmail(email);
        toast.success('Code de réinitialisation envoyé par email.');
        return true;
    }

    async function resetPassword(email: string, otp_code: string, new_password: string, new_password_confirm: string): Promise<boolean> {
        console.log('[useAuth] resetPassword() → email:', email);
        const success = await featuresDi.authController.resetPassword(email, otp_code, new_password, new_password_confirm);
        console.log('[useAuth] resetPassword() ← success:', success);
        if (!success) {
            console.warn('[useAuth] resetPassword() — échec');
            toast.error('Erreur lors de la réinitialisation du mot de passe.');
            return false;
        }
        toast.success('Mot de passe réinitialisé avec succès.');
        return true;
    }

    async function logout() {
        const refreshToken = useAuthStore.getState().refreshToken;
        console.log('[useAuth] logout() → refreshToken présent:', !!refreshToken);
        if (refreshToken) {
            await featuresDi.authController.logout(refreshToken).catch((e) => {
                console.warn('[useAuth] logout() — erreur backend (ignorée):', e);
            });
        }
        clearAuth();
        console.log('[useAuth] logout() — store vidé, redirection login');
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
