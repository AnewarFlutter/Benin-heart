import { APP_CONFIG } from "./app_config";

/**
 *  This file contains all the routes of the API.
 *  It is used to standardize how to build the URLs of the API endpoints.
 */
export const API_ROUTES = {
    // BASE
    BASE: `${APP_CONFIG.API.baseUrl}`,

    // Users API
    USERS: {
        BASE: `${APP_CONFIG.API.baseUrl}/v1/users`,
        LIST:() => `${API_ROUTES.USERS.BASE}/`,
        CREATE: () => `${API_ROUTES.USERS.BASE}/`,
        GET_BY_ID: (id: string) => `${API_ROUTES.USERS.BASE}/${id}`,
        UPDATE: (id: string) => `${API_ROUTES.USERS.BASE}/${id}`,
        PARTIAL_UPDATE: (id: string) => `${API_ROUTES.USERS.BASE}/${id}`,
        DELETE: (id: string) => `${API_ROUTES.USERS.BASE}/${id}`,
        HEALTH: () => `${API_ROUTES.USERS.BASE}/healthz`,
        ADMIN: () => `${APP_CONFIG.API.baseUrl}/users-admin/`,
    },

    // Stock API
    STOCK: {
        BASE: `${APP_CONFIG.API.baseUrl}/v1/items`,
        LIST: () => `${API_ROUTES.STOCK.BASE}/`,
        CREATE: () => `${API_ROUTES.STOCK.BASE}/`,
        GET_BY_ID: (id: string) => `${API_ROUTES.STOCK.BASE}/${id}`,
        UPDATE: (id: string) => `${API_ROUTES.STOCK.BASE}/${id}`,
        PARTIAL_UPDATE: (id: string) => `${API_ROUTES.STOCK.BASE}/${id}`,
        DELETE: (id: string) => `${API_ROUTES.STOCK.BASE}/${id}`,
        HEALTH: () => `${API_ROUTES.STOCK.BASE}/healthz`,
        ADMIN: () => `${APP_CONFIG.API.baseUrl}/stock-admin/`,
    },

    // Gateway API
    GATEWAY: {
        BASE: "/",
        INFO: "/",
        HEALTH: "/healthz",
    },

    // Auth (si tu veux brancher sur ton système interne)
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        VERIFY_OTP: "/auth/verify-otp",
    },

    // Products / Items (legacy ou externe)
    PRODUCTS: {
        BASE: "/products",
        GET_BY_ID: (id: string) => `/products/${id}`,
        SEARCH: "/products/search",
    },

    // MOCK USER API (externe JSONPlaceholder)
    MOCK_USER: {
        BASE: "https://jsonplaceholder.typicode.com",
        GET_BY_ID: (id: string) => `${API_ROUTES.MOCK_USER.BASE}/users/${id}`,
    },
};
