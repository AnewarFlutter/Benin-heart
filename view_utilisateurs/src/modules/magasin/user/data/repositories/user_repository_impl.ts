
import { UserDataSource } from "../datasources/user_data_source";
import { ModelUser } from "../models/model_user";
import { EntityUser } from "../../domain/entities/entity_user";
import { UserRepository } from "../../domain/repositories/user_repository";

/**
 *  Concrete implementation of UserRepository for the user domain.
 *  Delegates data access to a UserDataSource and maps between ModelUser and EntityUser.
 *  Provides async methods to retrieve a user by id and update a user, propagating data source errors.
 */
export class UserRepositoryImpl implements UserRepository {

    private datasource: UserDataSource;

    /**
     *  Constructor for the UserRepositoryImpl class.
     *  @param datasource The UserDataSource that is used to access the user data.
     */
    constructor(datasource: UserDataSource) {
        this.datasource = datasource;
    }

    /**
     *  Gets a users by id.
     *  @param id The id of the users to get.
     *  @returns A Promise that resolves to the users, or null if the users does not exist.
     */
    async getUserById(id: string): Promise<EntityUser | null> {
        try {
            const data = await this.datasource.getUserById(id);
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    /**
     *  Updates a users.
     *  @param users The users to update.
     *  @returns A Promise that resolves to the updated users, or null if the users does not exist.
     */
    async updateUser(users: EntityUser): Promise<EntityUser | null> {
        try {
            const data = await this.datasource.updateUser(ModelUser.fromEntity(users));
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }


    /**
     * CheckUserHealth.
     */
    async checkUserHealth(): Promise<{ status: string }> {
        try {
            const data = await this.datasource.checkUserHealth();
            // TODO: Mapper les données si nécessaire, ex: data.toEntity() ou data.map(...)
            return data;
        } catch (e) {
            throw e;
        }
    }

    /**
     * GetAllUsers.
     */
    async getAllUsers(): Promise<EntityUser[]> {
        try {
            const data = await this.datasource.getAllUsers();
            // Mapper chaque ModelUser en EntityUser
            return data.map(user => user.toEntity());
        } catch (e) {
            throw e;
        }
    }

    /**
     * CreateUser.
     */
    async createUser(user: EntityUser): Promise<EntityUser | null> {
        try {
            const data = await this.datasource.createUser(ModelUser.fromEntity(user));
            // TODO: Mapper les données si nécessaire, ex: data.toEntity() ou data.map(...)
            return data;
        } catch (e) {
            throw e;
        }
    }

    /**
     * PartialUpdateUser.
     */
    async partialUpdateUser(id: string, partial: Partial<EntityUser>): Promise<EntityUser | null> {
        try {
            const data = await this.datasource.partialUpdateUser(id, partial);
            // TODO: Mapper les données si nécessaire, ex: data.toEntity() ou data.map(...)
            return data;
        } catch (e) {
            throw e;
        }
    }

    /**
     * DeleteUser.
     */
    async deleteUser(id: string): Promise<boolean> {
        try {
            const data = await this.datasource.deleteUser(id);
            // TODO: Mapper les données si nécessaire, ex: data.toEntity() ou data.map(...)
            return data;
        } catch (e) {
            throw e;
        }
    }
}
