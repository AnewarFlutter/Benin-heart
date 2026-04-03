
import { EntityPendingRegistration, EntityRegisterInput, EntitySession } from "../../domain/entities/entity_session";
import { AuthRepository } from "../../domain/repositories/auth_repository";
import { AuthDataSource } from "../datasources/auth_data_source";

/**
 * AuthRepositoryImpl implements AuthRepository by delegating to AuthDataSource.
 */
export class AuthRepositoryImpl implements AuthRepository {

    constructor(private readonly datasource: AuthDataSource) {}

    async login(email: string, password: string): Promise<EntitySession | null> {
        try {
            const data = await this.datasource.login(email, password);
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    async register(input: EntityRegisterInput): Promise<EntityPendingRegistration | null> {
        try {
            const data = await this.datasource.register(input);
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    async verifyOTP(email: string, otpCode: string): Promise<EntitySession | null> {
        try {
            const data = await this.datasource.verifyOTP(email, otpCode);
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    async resendOTP(email: string): Promise<boolean> {
        try {
            return await this.datasource.resendOTP(email);
        } catch (e) {
            throw e;
        }
    }

    async logout(refreshToken: string): Promise<boolean> {
        try {
            return await this.datasource.logout(refreshToken);
        } catch (e) {
            throw e;
        }
    }

    async forgotPassword(email: string): Promise<boolean> {
        try {
            return await this.datasource.forgotPassword(email);
        } catch (e) {
            throw e;
        }
    }

    async verifyOTPForgotPassword(email: string, otpCode: string): Promise<boolean> {
        try {
            return await this.datasource.verifyOTPForgotPassword(email, otpCode);
        } catch (e) {
            throw e;
        }
    }

    async resetPassword(email: string, otpCode: string, newPassword: string, newPasswordConfirm: string): Promise<boolean> {
        try {
            return await this.datasource.resetPassword(email, otpCode, newPassword, newPasswordConfirm);
        } catch (e) {
            throw e;
        }
    }

    async refreshToken(refresh: string): Promise<{ access: string } | null> {
        try {
            return await this.datasource.refreshToken(refresh);
        } catch (e) {
            throw e;
        }
    }
}
