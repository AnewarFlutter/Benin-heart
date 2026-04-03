"use server";

import { featuresDi } from "@/di/features_di";
import { EntityPendingRegistration, EntityRegisterInput, EntitySession } from "@/modules/beninheart/auth/session/domain/entities/entity_session";
import { AppActionResult } from "@/shared/types/global";

/**
 * Authenticates a user with email and password.
 */
export async function loginAction(email: string, password: string): Promise<AppActionResult<EntitySession | null>> {
    const session = await featuresDi.authController.login(email, password);
    return {
        success: session !== null,
        message: session ? "Login successful." : "Invalid credentials.",
        data: session,
    };
}

/**
 * Registers a new user account.
 */
export async function registerAction(input: EntityRegisterInput): Promise<AppActionResult<EntityPendingRegistration | null>> {
    const result = await featuresDi.authController.register(input);
    return {
        success: result !== null,
        message: result ? "Registration successful. Check your email for the OTP." : "Registration failed.",
        data: result,
    };
}

/**
 * Verifies the OTP code to activate the account.
 */
export async function verifyOTPAction(email: string, otpCode: string): Promise<AppActionResult<EntitySession | null>> {
    const session = await featuresDi.authController.verifyOTP(email, otpCode);
    return {
        success: session !== null,
        message: session ? "OTP verified." : "Invalid or expired OTP.",
        data: session,
    };
}

/**
 * Resends the OTP code.
 */
export async function resendOTPAction(email: string): Promise<AppActionResult<boolean>> {
    const success = await featuresDi.authController.resendOTP(email);
    return {
        success,
        message: success ? "OTP resent." : "Failed to resend OTP.",
        data: success,
    };
}

/**
 * Initiates the forgot password flow.
 */
export async function forgotPasswordAction(email: string): Promise<AppActionResult<boolean>> {
    const success = await featuresDi.authController.forgotPassword(email);
    return {
        success,
        message: success ? "Reset code sent." : "Failed to send reset code.",
        data: success,
    };
}

/**
 * Resets the password using the OTP code.
 */
export async function resetPasswordAction(
    email: string, otpCode: string, newPassword: string, newPasswordConfirm: string
): Promise<AppActionResult<boolean>> {
    const success = await featuresDi.authController.resetPassword(email, otpCode, newPassword, newPasswordConfirm);
    return {
        success,
        message: success ? "Password reset successful." : "Failed to reset password.",
        data: success,
    };
}
