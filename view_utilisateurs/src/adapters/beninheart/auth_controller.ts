
import { EntityPendingRegistration, EntityRegisterInput } from "@/modules/beninheart/auth/session/domain/entities/entity_session";
import { ForgotPasswordUseCase } from "@/modules/beninheart/auth/session/domain/usecases/forgot_password_usecase";
import { LoginUseCase } from "@/modules/beninheart/auth/session/domain/usecases/login_usecase";
import { LogoutUseCase } from "@/modules/beninheart/auth/session/domain/usecases/logout_usecase";
import { RegisterUseCase } from "@/modules/beninheart/auth/session/domain/usecases/register_usecase";
import { ResendOTPUseCase } from "@/modules/beninheart/auth/session/domain/usecases/resend_otp_usecase";
import { ResetPasswordUseCase } from "@/modules/beninheart/auth/session/domain/usecases/reset_password_usecase";
import { VerifyOTPForgotPasswordUseCase } from "@/modules/beninheart/auth/session/domain/usecases/verify_otp_forgot_password_usecase";
import { VerifyOTPUseCase } from "@/modules/beninheart/auth/session/domain/usecases/verify_otp_usecase";

/**
 * AuthController is the adapter for authentication operations.
 */
export class AuthController {

    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase,
        private readonly verifyOTPUseCase: VerifyOTPUseCase,
        private readonly resendOTPUseCase: ResendOTPUseCase,
        private readonly logoutUseCase: LogoutUseCase,
        private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
        private readonly verifyOTPForgotPasswordUseCase: VerifyOTPForgotPasswordUseCase,
        private readonly resetPasswordUseCase: ResetPasswordUseCase,
    ) {}

    login = async (email: string, password: string): Promise<EntitySession | null> => {
        try {
            return await this.loginUseCase.execute(email, password);
        } catch (e) {
            console.error("AuthController.login error:", e);
            return null;
        }
    };

    register = async (input: EntityRegisterInput): Promise<EntityPendingRegistration | null> => {
        try {
            return await this.registerUseCase.execute(input);
        } catch (e) {
            console.error("AuthController.register error:", e);
            return null;
        }
    };

    verifyOTP = async (email: string, otpCode: string): Promise<boolean> => {
        try {
            return await this.verifyOTPUseCase.execute(email, otpCode);
        } catch (e) {
            console.error("AuthController.verifyOTP error:", e);
            return false;
        }
    };

    resendOTP = async (email: string): Promise<boolean> => {
        try {
            return await this.resendOTPUseCase.execute(email);
        } catch (e) {
            console.error("AuthController.resendOTP error:", e);
            return false;
        }
    };

    logout = async (refreshToken: string): Promise<boolean> => {
        try {
            return await this.logoutUseCase.execute(refreshToken);
        } catch (e) {
            console.error("AuthController.logout error:", e);
            return false;
        }
    };

    forgotPassword = async (email: string): Promise<boolean> => {
        try {
            return await this.forgotPasswordUseCase.execute(email);
        } catch (e) {
            console.error("AuthController.forgotPassword error:", e);
            return false;
        }
    };

    verifyOTPForgotPassword = async (email: string, otpCode: string): Promise<boolean> => {
        try {
            return await this.verifyOTPForgotPasswordUseCase.execute(email, otpCode);
        } catch (e) {
            console.error("AuthController.verifyOTPForgotPassword error:", e);
            return false;
        }
    };

    resetPassword = async (email: string, otpCode: string, newPassword: string, newPasswordConfirm: string): Promise<boolean> => {
        try {
            return await this.resetPasswordUseCase.execute(email, otpCode, newPassword, newPasswordConfirm);
        } catch (e) {
            console.error("AuthController.resetPassword error:", e);
            return false;
        }
    };
}
