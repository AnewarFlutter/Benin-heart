/**
 * Service API Benin Heart.
 * Toutes les fonctions d'appel HTTP vers le backend.
 */
import { apiClient } from './api_client';
import { API_ROUTES } from '@/shared/constants/api_routes';
import { useAuthStore } from '@/stores/auth_store';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToken(): string | undefined {
    return useAuthStore.getState().accessToken ?? undefined;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string) {
    return apiClient<{ access: string; refresh: string }>(API_ROUTES.AUTH.LOGIN, {
        method: 'POST',
        body: { email, password },
    });
}

export async function apiRegister(data: {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone: string;
}) {
    return apiClient<{ id: string; email: string }>(API_ROUTES.AUTH.REGISTER, {
        method: 'POST',
        body: data,
    });
}

export async function apiVerifyOTP(email: string, otp_code: string) {
    return apiClient<{ access: string; refresh: string }>(API_ROUTES.AUTH.VERIFY_OTP, {
        method: 'POST',
        body: { email, otp_code },
    });
}

export async function apiResendOTP(email: string) {
    return apiClient(API_ROUTES.AUTH.RESEND_OTP, {
        method: 'POST',
        body: { email },
    });
}

export async function apiForgotPassword(email: string) {
    return apiClient(API_ROUTES.AUTH.FORGOT_PASSWORD, {
        method: 'POST',
        body: { email },
    });
}

export async function apiVerifyOTPForgotPassword(email: string, otp_code: string) {
    return apiClient(API_ROUTES.AUTH.VERIFY_OTP_FORGOT, {
        method: 'POST',
        body: { email, otp_code },
    });
}

export async function apiResetPassword(email: string, otp_code: string, new_password: string, new_password_confirm: string) {
    return apiClient(API_ROUTES.AUTH.RESET_PASSWORD, {
        method: 'POST',
        body: { email, otp_code, new_password, new_password_confirm },
    });
}

export async function apiLogout() {
    const token = getToken();
    return apiClient(API_ROUTES.AUTH.LOGOUT, {
        method: 'POST',
        token,
    });
}

export async function apiGetMe() {
    return apiClient<{
        id: string; email: string; first_name: string; last_name: string;
        phone: string; is_active: boolean;
    }>(API_ROUTES.AUTH.ME, { token: getToken() });
}

// ─── Plans d'abonnement ────────────────────────────────────────────────────────

export interface PlanAbonnement {
    uuid: string;
    slug: string;
    titre: string;
    description: string;
    prix: string;
    prix_affiche: string;
    duree: string;
    fonctionnalites: string[];
    fonctionnalites_exclues: string[];
    est_populaire: boolean;
    icone: 'heart' | 'star' | 'crown';
    ordre: number;
}

export async function apiGetPlans() {
    return apiClient<PlanAbonnement[]>(API_ROUTES.ABONNEMENTS.PLANS);
}

export async function apiSouscrire(data: {
    plan_slug: string;
    nombre_mois: number;
    prenom: string;
    nom: string;
    telephone: string;
    adresse: string;
    ville: string;
    code_postal: string;
    code_promo?: string;
}) {
    return apiClient(API_ROUTES.ABONNEMENTS.SOUSCRIRE, {
        method: 'POST',
        body: data,
        token: getToken(),
    });
}

export async function apiGetMonAbonnement() {
    return apiClient(API_ROUTES.ABONNEMENTS.MON_ABONNEMENT, { token: getToken() });
}

// ─── Profils ───────────────────────────────────────────────────────────────────

export interface ProfilPublic {
    uuid: string;
    prenom: string;
    age: number;
    genre: string;
    ville: string;
    pays: string;
    bio: string;
    photo_principale: string | null;
    photos: { uuid: string; image: string; ordre: number; est_principale: boolean }[];
    est_verifie: boolean;
    est_en_ligne: boolean;
}

export async function apiGetProfils() {
    return apiClient<ProfilPublic[]>(API_ROUTES.PROFILS.LIST, { token: getToken() });
}

export async function apiGetMonProfil() {
    return apiClient(API_ROUTES.PROFILS.MON_PROFIL, { token: getToken() });
}

export async function apiCreerProfil(data: FormData) {
    return apiClient(API_ROUTES.PROFILS.MON_PROFIL, {
        method: 'POST',
        body: data as any,
        token: getToken(),
        headers: {},  // laisser le navigateur définir le Content-Type multipart
    });
}

export async function apiUploadPhotoProfil(formData: FormData) {
    return apiClient(API_ROUTES.PROFILS.PHOTOS, {
        method: 'POST',
        body: formData as any,
        token: getToken(),
        headers: {},
    });
}

// ─── Likes ─────────────────────────────────────────────────────────────────────

export async function apiLike(profil_uuid: string, type_action: 'LIKE' | 'SUPERLIKE' | 'DISLIKE') {
    return apiClient<{ action: string; est_match: boolean; created: boolean }>(
        API_ROUTES.LIKES.ACTION,
        { method: 'POST', body: { profil_uuid, type_action }, token: getToken() }
    );
}

export async function apiGetMesMatchs() {
    return apiClient<any[]>(API_ROUTES.LIKES.MES_MATCHS, { token: getToken() });
}

export async function apiGetMesLikes() {
    return apiClient<any[]>(API_ROUTES.LIKES.MES_LIKES, { token: getToken() });
}

export async function apiGetMesStats() {
    return apiClient<{
        total_likes_reçus: number;
        total_superlikes_reçus: number;
        total_matchs: number;
        total_likes_envoyés: number;
    }>(API_ROUTES.LIKES.MES_STATS, { token: getToken() });
}

// ─── Conversations ─────────────────────────────────────────────────────────────

export async function apiGetConversations() {
    return apiClient<any[]>(API_ROUTES.CONVERSATIONS.LIST, { token: getToken() });
}

export async function apiOuvrirConversation(match_uuid: string) {
    return apiClient<any>(API_ROUTES.CONVERSATIONS.OUVRIR, {
        method: 'POST',
        body: { match_uuid },
        token: getToken(),
    });
}

export async function apiGetMessages(convUuid: string) {
    return apiClient<any[]>(API_ROUTES.CONVERSATIONS.MESSAGES(convUuid), { token: getToken() });
}

// ─── Storefront ────────────────────────────────────────────────────────────────

export async function apiGetHeroBanners() {
    return apiClient<any[]>(API_ROUTES.STOREFRONT.HERO_BANNERS);
}

export async function apiGetTemoignages() {
    return apiClient<any[]>(API_ROUTES.STOREFRONT.TEMOIGNAGES);
}

export async function apiGetFaq() {
    return apiClient<any[]>(API_ROUTES.STOREFRONT.FAQ);
}

export async function apiEnvoyerContact(data: {
    full_name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}) {
    return apiClient(API_ROUTES.STOREFRONT.CONTACT, {
        method: 'POST',
        body: data,
    });
}
