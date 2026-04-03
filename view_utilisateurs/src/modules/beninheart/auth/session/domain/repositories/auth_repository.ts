
import { EntityPendingRegistration, EntityRegisterInput, EntitySession } from "../entities/entity_session";

/**
 * AuthRepository defines the contract for authentication operations.
 */
export interface AuthRepository {
    login(email: string, password: string): Promise<EntitySession | null>;
    register(input: EntityRegisterInput): Promise<EntityPendingRegistration | null>;
    verifyOTP(email: string, otpCode: string): Promise<EntitySession | null>;
    resendOTP(email: string): Promise<boolean>;
    logout(refreshToken: string): Promise<boolean>;
    forgotPassword(email: string): Promise<boolean>;
    verifyOTPForgotPassword(email: string, otpCode: string): Promise<boolean>;
    resetPassword(email: string, otpCode: string, newPassword: string, newPasswordConfirm: string): Promise<boolean>;
    refreshToken(refresh: string): Promise<{ access: string } | null>;
}
