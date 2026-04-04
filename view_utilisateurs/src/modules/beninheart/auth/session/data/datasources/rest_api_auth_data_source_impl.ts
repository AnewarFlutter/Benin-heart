
import { apiClient } from "@/lib/api/api_client";
import { API_ROUTES } from "@/shared/constants/api_routes";
import { EntityRegisterInput } from "../../domain/entities/entity_session";
import { ModelPendingRegistration, ModelSession } from "../models/model_session";
import { AuthDataSource } from "./auth_data_source";

/**
 * REST API implementation of AuthDataSource.
 */
export class RestApiAuthDataSourceImpl implements AuthDataSource {

    async login(email: string, password: string): Promise<ModelSession | null> {
        console.log('[AuthDS] login() → POST', API_ROUTES.AUTH.LOGIN, '| identifier:', email);
        try {
            const { data, error, status } = await apiClient<Record<string, unknown>>(
                API_ROUTES.AUTH.LOGIN,
                { method: "POST", body: { identifier: email, password, context: 'CLIENT' } }
            );
            console.log('[AuthDS] login() ← status:', status, '| error:', error, '| data keys:', data ? Object.keys(data) : null);
            if (error || !data) return null;
            return ModelSession.fromLoginJson(data);
        } catch (e) {
            console.error('[AuthDS] login() — exception:', e);
            return null;
        }
    }

    async register(input: EntityRegisterInput): Promise<ModelPendingRegistration | null> {
        console.log('[AuthDS] register() → POST', API_ROUTES.AUTH.REGISTER, '| email:', input.email);
        try {
            const { data, error, status } = await apiClient<Record<string, unknown>>(
                API_ROUTES.AUTH.REGISTER,
                {
                    method: "POST",
                    body: {
                        email: input.email,
                        password: input.password,
                        password_confirm: input.passwordConfirm,
                        first_name: input.firstName,
                        last_name: input.lastName,
                        phone: input.phone,
                    },
                }
            );
            console.log('[AuthDS] register() ← status:', status, '| error:', error, '| data:', data);
            if (error || !data) return null;
            return ModelPendingRegistration.fromJson(data);
        } catch (e) {
            console.error('[AuthDS] register() — exception:', e);
            return null;
        }
    }

    async verifyOTP(email: string, otpCode: string): Promise<boolean> {
        console.log('[AuthDS] verifyOTP() → POST', API_ROUTES.AUTH.VERIFY_OTP, '| email:', email, '| code:', otpCode);
        try {
            const { data, error, status } = await apiClient<Record<string, unknown>>(
                API_ROUTES.AUTH.VERIFY_OTP,
                { method: "POST", body: { email, otp_code: otpCode } }
            );
            console.log('[AuthDS] verifyOTP() ← status:', status, '| error:', error, '| data:', data);
            // Le backend retourne {message, user} — pas de tokens
            const ok = !error && data != null && !!data['message'];
            console.log('[AuthDS] verifyOTP() — résultat final:', ok);
            return ok;
        } catch (e) {
            console.error('[AuthDS] verifyOTP() — exception:', e);
            return false;
        }
    }

    async resendOTP(email: string): Promise<boolean> {
        console.log('[AuthDS] resendOTP() → POST', API_ROUTES.AUTH.RESEND_OTP, '| email:', email);
        try {
            const { error, status } = await apiClient(
                API_ROUTES.AUTH.RESEND_OTP,
                { method: "POST", body: { email } }
            );
            console.log('[AuthDS] resendOTP() ← status:', status, '| error:', error);
            return !error;
        } catch (e) {
            console.error('[AuthDS] resendOTP() — exception:', e);
            return false;
        }
    }

    async logout(refreshToken: string): Promise<boolean> {
        console.log('[AuthDS] logout() → POST', API_ROUTES.AUTH.LOGOUT);
        try {
            const { error, status } = await apiClient(
                API_ROUTES.AUTH.LOGOUT,
                { method: "POST", body: { refresh_token: refreshToken } }
            );
            console.log('[AuthDS] logout() ← status:', status, '| error:', error);
            return !error;
        } catch (e) {
            console.error('[AuthDS] logout() — exception:', e);
            return false;
        }
    }

    async forgotPassword(email: string): Promise<boolean> {
        console.log('[AuthDS] forgotPassword() → POST', API_ROUTES.AUTH.FORGOT_PASSWORD, '| email:', email);
        try {
            const { error, status } = await apiClient(
                API_ROUTES.AUTH.FORGOT_PASSWORD,
                { method: "POST", body: { identifier: email } }
            );
            console.log('[AuthDS] forgotPassword() ← status:', status, '| error:', error);
            return !error;
        } catch (e) {
            console.error('[AuthDS] forgotPassword() — exception:', e);
            return false;
        }
    }

    async verifyOTPForgotPassword(email: string, otpCode: string): Promise<boolean> {
        console.log('[AuthDS] verifyOTPForgotPassword() → POST', API_ROUTES.AUTH.VERIFY_OTP_FORGOT, '| email:', email);
        try {
            const { error, status, data } = await apiClient(
                API_ROUTES.AUTH.VERIFY_OTP_FORGOT,
                { method: "POST", body: { email, otp_code: otpCode } }
            );
            console.log('[AuthDS] verifyOTPForgotPassword() ← status:', status, '| error:', error, '| data:', data);
            return !error;
        } catch (e) {
            console.error('[AuthDS] verifyOTPForgotPassword() — exception:', e);
            return false;
        }
    }

    async resetPassword(email: string, otpCode: string, newPassword: string, newPasswordConfirm: string): Promise<boolean> {
        console.log('[AuthDS] resetPassword() → POST', API_ROUTES.AUTH.RESET_PASSWORD, '| email:', email);
        try {
            const { error, status, data } = await apiClient(
                API_ROUTES.AUTH.RESET_PASSWORD,
                { method: "POST", body: { email, otp_code: otpCode, new_password: newPassword, new_password_confirm: newPasswordConfirm } }
            );
            console.log('[AuthDS] resetPassword() ← status:', status, '| error:', error, '| data:', data);
            return !error;
        } catch (e) {
            console.error('[AuthDS] resetPassword() — exception:', e);
            return false;
        }
    }

    async refreshToken(refresh: string): Promise<{ access: string } | null> {
        console.log('[AuthDS] refreshToken() → POST', API_ROUTES.AUTH.REFRESH);
        try {
            const { data, error, status } = await apiClient<{ access: string }>(
                API_ROUTES.AUTH.REFRESH,
                { method: "POST", body: { refresh } }
            );
            console.log('[AuthDS] refreshToken() ← status:', status, '| error:', error, '| access present:', !!data?.access);
            if (error || !data) return null;
            return data;
        } catch (e) {
            console.error('[AuthDS] refreshToken() — exception:', e);
            return null;
        }
    }
}
