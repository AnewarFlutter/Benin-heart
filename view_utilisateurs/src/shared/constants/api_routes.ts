import { APP_CONFIG } from "./app_config";

const BASE = APP_CONFIG.API.baseUrl;

/**
 * Toutes les routes API du backend Benin Heart.
 * Les chemins sont relatifs à APP_CONFIG.API.baseUrl.
 */
export const API_ROUTES = {
    BASE,

    // ─── Auth ────────────────────────────────────────────────────────────────
    AUTH: {
        LOGIN:                    '/login/',
        REFRESH:                  '/token/refresh/',
        REGISTER:                 '/client/register/',
        VERIFY_OTP:               '/client/verify_otp/',
        RESEND_OTP:               '/client/resend_otp/',
        FORGOT_PASSWORD:          '/client/forgot_password/',
        RESEND_OTP_FORGOT:        '/client/resend_otp_forgot_password/',
        VERIFY_OTP_FORGOT:        '/client/verify_otp_forgot_password/',
        RESET_PASSWORD:           '/client/reset_password/',
        LOGOUT:                   '/client/logout/',
        CHANGE_PASSWORD:          '/client/change-password/',
        ME:                       '/client/profile/',
    },

    // ─── Profils ─────────────────────────────────────────────────────────────
    PROFILS: {
        LIST:                     '/client/profils/',
        DETAIL:  (uuid: string) => `/client/profils/${uuid}/`,
        MON_PROFIL:               '/client/mon-profil/',
        PHOTOS:                   '/client/mon-profil/photos/',
        PHOTO_DELETE: (uuid: string) => `/client/mon-profil/photos/${uuid}/`,
        VIDEO:                    '/client/mon-profil/video/',
    },

    // ─── Likes & Matchs ──────────────────────────────────────────────────────
    LIKES: {
        ACTION:                   '/client/likes/',
        MES_LIKES:                '/client/mes-likes/',
        MES_MATCHS:               '/client/mes-matchs/',
        MES_STATS:                '/client/mes-stats/',
    },

    // ─── Conversations ───────────────────────────────────────────────────────
    CONVERSATIONS: {
        LIST:                     '/client/conversations/',
        OUVRIR:                   '/client/conversations/ouvrir/',
        MESSAGES: (uuid: string) => `/client/conversations/${uuid}/messages/`,
    },

    // ─── Abonnements ─────────────────────────────────────────────────────────
    ABONNEMENTS: {
        PLANS:                    '/client/plans/',
        PLAN_DETAIL: (slug: string) => `/client/plans/${slug}/`,
        SOUSCRIRE:                '/client/souscriptions/',
        MON_ABONNEMENT:           '/client/mon-abonnement/',
    },

    // ─── Storefront public ────────────────────────────────────────────────────
    STOREFRONT: {
        HERO_BANNERS:             '/client/hero-banners/',
        TEMOIGNAGES:              '/client/temoignages/',
        FAQ:                      '/client/faq/',
        CONTACT:                  '/client/contacts/',
        CONTACT_INFO:             '/client/contact-info/',
    },

    // ─── WebSocket ────────────────────────────────────────────────────────────
    WS: {
        NOTIFICATIONS:            () => {
            const wsBase = typeof window !== 'undefined'
                ? window.location.host
                : 'localhost';
            const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:'
                ? 'wss'
                : 'ws';
            return `${protocol}://${wsBase}/ws/notifications/`;
        },
        CHAT: (convUuid: string) => {
            const wsBase = typeof window !== 'undefined'
                ? window.location.host
                : 'localhost';
            const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:'
                ? 'wss'
                : 'ws';
            return `${protocol}://${wsBase}/ws/chat/${convUuid}/`;
        },
    },

    // ─── Magasin (référence — module exemple) ────────────────────────────────
    STOCK: {
        LIST:              () => '/magasin/stocks/',
        GET_BY_ID:         (id: string) => `/magasin/stocks/${id}/`,
        CREATE:            () => '/magasin/stocks/',
        UPDATE:            (id: string) => `/magasin/stocks/${id}/`,
        DELETE:            (id: string) => `/magasin/stocks/${id}/`,
    },
    USERS: {
        LIST:              () => '/magasin/users/',
        GET_BY_ID:         (id: string) => `/magasin/users/${id}/`,
        CREATE:            () => '/magasin/users/',
        UPDATE:            (id: string) => `/magasin/users/${id}/`,
        DELETE:            (id: string) => `/magasin/users/${id}/`,
    },

    // ─── Admin ────────────────────────────────────────────────────────────────
    ADMIN: {
        PLANS:                          '/admin/plans/',
        PLAN_DETAIL:  (pk: number) =>   `/admin/plans/${pk}/`,
        SOUSCRIPTIONS:                  '/admin/souscriptions/',
        SOUSCRIPTION: (pk: number) =>   `/admin/souscriptions/${pk}/`,
        SOUSCRIPTION_VALIDER: (pk: number) => `/admin/souscriptions/${pk}/valider/`,
        SOUSCRIPTION_ANNULER: (pk: number) => `/admin/souscriptions/${pk}/annuler/`,
        PROFILS:                        '/admin/profils/',
        PROFIL: (pk: number) =>         `/admin/profils/${pk}/`,
        PROFIL_SUSPENDRE: (pk: number) => `/admin/profils/${pk}/suspendre/`,
        PROFIL_BANNIR:    (pk: number) => `/admin/profils/${pk}/bannir/`,
        PROFIL_VERIFIER:  (pk: number) => `/admin/profils/${pk}/verifier/`,
        USERS:                          '/admin/users/',
        USER: (uuid: string) =>         `/admin/users/${uuid}/`,
    },
};
