
import { EntityRegisterInput } from "../../domain/entities/entity_session";
import { ModelPendingRegistration, ModelSession } from "../models/model_session";

/**
 * AuthDataSource defines the contract for authentication data access.
 */
export interface AuthDataSource {
    login(email: string, password: string): Promise<ModelSession | null>;
    register(input: EntityRegisterInput): Promise<ModelPendingRegistration | null>;
    verifyOTP(email: string, otpCode: string): Promise<ModelSession | null>;
    resendOTP(email: string): Promise<boolean>;
    logout(refreshToken: string): Promise<boolean>;
    forgotPassword(email: string): Promise<boolean>;
    verifyOTPForgotPassword(email: string, otpCode: string): Promise<boolean>;
    resetPassword(email: string, otpCode: string, newPassword: string, newPasswordConfirm: string): Promise<boolean>;
    refreshToken(refresh: string): Promise<{ access: string } | null>;
}
