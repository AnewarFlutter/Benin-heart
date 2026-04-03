
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
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(
                API_ROUTES.AUTH.LOGIN,
                { method: "POST", body: { email, password } }
            );
            if (error || !data) return null;
            return ModelSession.fromLoginJson(data);
        } catch (e) {
            console.error("login error:", e);
            return null;
        }
    }

    async register(input: EntityRegisterInput): Promise<ModelPendingRegistration | null> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(
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
            if (error || !data) return null;
            return ModelPendingRegistration.fromJson(data);
        } catch (e) {
            console.error("register error:", e);
            return null;
        }
    }

    async verifyOTP(email: string, otpCode: string): Promise<ModelSession | null> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(
                API_ROUTES.AUTH.VERIFY_OTP,
                { method: "POST", body: { email, otp_code: otpCode } }
            );
            if (error || !data) return null;
            return ModelSession.fromOTPJson(data);
        } catch (e) {
            console.error("verifyOTP error:", e);
            return null;
        }
    }

    async resendOTP(email: string): Promise<boolean> {
        try {
            const { error } = await apiClient(
                API_ROUTES.AUTH.RESEND_OTP,
                { method: "POST", body: { email } }
            );
            return !error;
        } catch {
            return false;
        }
    }

    async logout(refreshToken: string): Promise<boolean> {
        try {
            const { error } = await apiClient(
                API_ROUTES.AUTH.LOGOUT,
                { method: "POST", body: { refresh: refreshToken } }
            );
            return !error;
        } catch {
            return false;
        }
    }

    async forgotPassword(email: string): Promise<boolean> {
        try {
            const { error } = await apiClient(
                API_ROUTES.AUTH.FORGOT_PASSWORD,
                { method: "POST", body: { email } }
            );
            return !error;
        } catch {
            return false;
        }
    }

    async verifyOTPForgotPassword(email: string, otpCode: string): Promise<boolean> {
        try {
            const { error } = await apiClient(
                API_ROUTES.AUTH.VERIFY_OTP_FORGOT,
                { method: "POST", body: { email, otp_code: otpCode } }
            );
            return !error;
        } catch {
            return false;
        }
    }

    async resetPassword(email: string, otpCode: string, newPassword: string, newPasswordConfirm: string): Promise<boolean> {
        try {
            const { error } = await apiClient(
                API_ROUTES.AUTH.RESET_PASSWORD,
                { method: "POST", body: { email, otp_code: otpCode, new_password: newPassword, new_password_confirm: newPasswordConfirm } }
            );
            return !error;
        } catch {
            return false;
        }
    }

    async refreshToken(refresh: string): Promise<{ access: string } | null> {
        try {
            const { data, error } = await apiClient<{ access: string }>(
                API_ROUTES.AUTH.REFRESH,
                { method: "POST", body: { refresh } }
            );
            if (error || !data) return null;
            return data;
        } catch {
            return null;
        }
    }
}
