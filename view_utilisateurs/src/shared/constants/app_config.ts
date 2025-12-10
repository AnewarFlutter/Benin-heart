import { AppStatus } from "../enums/app_status";
import { AppLocalesValues } from "../types/global";
import { config } from 'dotenv';
import { resolve } from 'path';

// Charger le fichier .env.frontend-local
config({ path: resolve(process.cwd(), '.env.local') });

export const APP_CONFIG = {

    APP_NAME: "NextJS Clean Template",

    COOKIES_KEYS: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
    },

    DEFAULT_LOCALE: "fr" satisfies AppLocalesValues,
    SUPPORTED_LOCALES: AppLocalesValues,

    IMAGES_SETTINGS: {
        placeholder: "https://via.placeholder.com/150",
        mainThumbnail: {
            unit: "px",
            width: 150,
            height: 150,
            formatsAllowed: ["jpeg", "png", "jpg"],
            defaultFormat: "jpeg",
        }
    },

    /**
     * App Status
     */
    APP_STATUS: process.env.NEXT_PUBLIC_APP_STATUS as keyof typeof AppStatus | undefined,

    /**
     * API endpoints
     */
    API: {
        baseUrl: (() => {
            // Côté serveur (SSR dans Docker): utiliser le nom du service nginx
            if (typeof window === "undefined") {
                return "http://nginx-local/api";
            }
            // Côté client (navigateur): utiliser localhost ou l'URL configurée
            return process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";
        })(),
        timeout: 10000, // ms
    },

    /**
     * Auth
     */
    AUTH: {
        jwtSecret: process.env.JWT_SECRET || "default_secret", // côté serveur uniquement
        googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    },

    /**
     * Storage
     */
    STORAGE: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        firebaseBucket: process.env.NEXT_PUBLIC_FIREBASE_BUCKET,
    },

    /**
     * Services tiers
     */
    THIRD_PARTY: {
        stripeKey: process.env.NEXT_PUBLIC_STRIPE_KEY,
        sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },

    DEFAULT_ENVIRONMENT: () => {
        if (process.env.NEXT_PUBLIC_APP_ENV === "PRODUCTION") return "prod";
        if (process.env.NEXT_PUBLIC_APP_ENV === "STAGING") return "test";
        return "dev";
    },

};