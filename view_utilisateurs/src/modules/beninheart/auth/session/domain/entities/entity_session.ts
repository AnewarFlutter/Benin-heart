
/**
 * EntityUser represents an authenticated user.
 */
export interface EntityUser {
    id?: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    isActive?: boolean | null;
}

/**
 * EntitySession represents a user session with tokens.
 */
export interface EntitySession {
    accessToken?: string | null;
    refreshToken?: string | null;
    user?: EntityUser | null;
}

/**
 * EntityRegisterInput represents the registration payload.
 */
export interface EntityRegisterInput {
    email: string;
    password: string;
    passwordConfirm: string;
    firstName: string;
    lastName: string;
    phone: string;
}

/**
 * EntityPendingRegistration is returned after register (before OTP).
 */
export interface EntityPendingRegistration {
    id?: string | null;
    email?: string | null;
}
