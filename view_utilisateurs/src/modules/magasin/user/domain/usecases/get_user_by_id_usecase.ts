import { EntityUser } from "../entities/entity_user";
import { UserRepository } from "../repositories/user_repository";

/**
 *  Gets a user by id using the provided repository.
 *  @param id The id of the user to get.
 *  @returns A Promise that resolves to the user, or null if it does not exist.
 */
export class GetUserByIdUseCase {
    constructor(private readonly repository: UserRepository) { }

    /**
     *  Executes the use case.
     *  @param id The id of the user to retrieve.
     *  @returns A promise that resolves to the user with the given id, or null if it does not exist.
     */
    async execute(id: string): Promise<EntityUser | null> {
        return await this.repository.getUserById(id);
    }
}
