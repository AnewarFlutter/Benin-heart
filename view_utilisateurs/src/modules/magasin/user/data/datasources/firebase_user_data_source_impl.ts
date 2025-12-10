
import { ModelUser } from "../models/model_user";
import { UserDataSource } from "./user_data_source";

/**
 *  Skeleton implementation of a user data source using a REST API.
 *  Exposes methods to retrieve a user by ID and update user records; both are not yet implemented.
 *  @implements {UserDataSource}
 */
export class FirebaseUserDataSourceImpl implements UserDataSource {
    checkUserHealth(): Promise<{ status: string; }> {
        throw new Error("Method not implemented.");
    }
    getAllUsers(): Promise<ModelUser[]> {
        throw new Error("Method not implemented.");
    }
    createUser(user: ModelUser): Promise<ModelUser | null> {
        return Promise.resolve(user);
    }
    partialUpdateUser(id: string, partial: Partial<ModelUser>): Promise<ModelUser | null> {
        return id && partial ? Promise.resolve({ id, ...partial } as ModelUser) : Promise.resolve(null);
    }
    deleteUser(id: string): Promise<boolean> {
        return Promise.resolve(!!id);
    }

    /**
     *  Gets a user by its id.
     *  @param id The id of the user to retrieve.
     *  @returns A Promise that resolves to the user with the given id, or null if it does not exist.
     */
    async getUserById(id: string): Promise<ModelUser | null> {
        return Promise.resolve(id ? { id } as ModelUser : null);
    }

    /**
     *  Updates a user.
     *  @param user The user to update.
     *  @returns A Promise that resolves to the updated user, or null if it does not exist.
     */
    async updateUser(user: ModelUser): Promise<ModelUser | null> {
        return Promise.resolve(user);
    }
}
