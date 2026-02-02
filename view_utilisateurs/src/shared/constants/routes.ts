import { set } from "date-fns";
import { se } from "date-fns/locale";
import { Settings } from "lucide-react";

/**
 * Routes of the application.
 *
 * This constant contains all the routes of the application.
 * It is used by the router to map the routes to the corresponding components.
 *
 * @constant
 * @type {Object}
 * @property {string} root - The root route of the application.
 */
export const APP_ROUTES = {
    // Root
    home:{
        root: "/",
        // Pages principales
        pourquoiNousChoisir: "/#pourquoi-nous-choisir",
        nosService:"/#nos-services",
        abonnements: "/abonnements",
        contact: "/contact",
        faq: "/faq",
        testimonials: "/#testimonials",
    },
    // Auth Customer
    auth: {
        login: "/customer/auth/login",
        register: "/customer/auth/register",
        logout: "/logout",
        otp: "/customer/auth/otp",
        forgotPassword: "/customer/auth/forgot-password",
        resetPassword: "/customer/auth/reset-password",
    },
   
   

    //Checkout
    checkout: {
        root: "/checkout"
    },

    // Customer Dashboard
    customer: {
        root: "/customer/home",
        dashboard: "/customer/dashboard",
        tomeetsomeone: "/customer/tomeetsomeone",
        settings: "/customer/settings",
        coversations: "/customer/chatlike",
        likes: "/customer/likes",
        favorites: "/customer/favorites",
        abonnement: "/customer/abonnement",
    },

    // Profil utilisateur
    profile: {
        root: "/profile",
        settings: "/profile/settings",
        billing: "/profile/billing",
        history: "/profile/history",
    },


} as const;

/**
 * Type helper pour obtenir toutes les routes de l'application
 */
export type AppRoutesType = typeof APP_ROUTES;