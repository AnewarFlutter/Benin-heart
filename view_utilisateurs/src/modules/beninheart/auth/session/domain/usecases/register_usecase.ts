
import { EntityPendingRegistration, EntityRegisterInput } from "../entities/entity_session";
import { AuthRepository } from "../repositories/auth_repository";

/**
 * RegisterUseCase creates a new user account (pending OTP verification).
 */
export class RegisterUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(input: EntityRegisterInput): Promise<EntityPendingRegistration | null> {
        return this.repository.register(input);
    }
}
