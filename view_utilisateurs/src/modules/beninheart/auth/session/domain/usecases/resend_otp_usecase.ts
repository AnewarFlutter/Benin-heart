
import { AuthRepository } from "../repositories/auth_repository";

/**
 * ResendOTPUseCase resends the OTP verification code.
 */
export class ResendOTPUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(email: string): Promise<boolean> {
        return this.repository.resendOTP(email);
    }
}
