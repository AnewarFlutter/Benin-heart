
import { apiClient } from "@/lib/api/api_client";
import { ModelUser } from "../models/model_user";
import { UserDataSource } from "./user_data_source";
import { API_ROUTES } from "@/shared/constants/api_routes";

/**
 *  Skeleton implementation of a user data source using a REST API.
 *  Exposes methods to retrieve a user by ID and update user records; both are not yet implemented.
 *  @implements {UserDataSource}
 */
export class RestApiUserDataSourceImpl implements UserDataSource {

    /**
     *  Gets a users by its id.
     *  @param id The id of the users to retrieve.
     *  @returns A Promise that resolves to the users with the given id, or null if it does not exist.
     */
    async getUserById(id: string): Promise<ModelUser | null> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(API_ROUTES.USERS.GET_BY_ID(id), {
                method: "GET",
            });

            if (error) {
                console.error("Error fetching users:", error);
                return null;
            }
            
            return data ? ModelUser.fromJson(data) : null;
        } catch (error) {
            console.error("Error fetching user:", error);
            return null;
        }
    }

    /**
     *  Updates a users.
     *  @param users The users to update.
     *  @returns A Promise that resolves to the updated users, or null if it does not exist.
     */
    async updateUser(users: ModelUser): Promise<ModelUser | null> {
        return Promise.resolve(users);
    }

    /**
     * CheckHealth.
     */
    async checkHealth(): Promise<{ status: string }> {
        return Promise.resolve({ status: "healthy" });
    }

    /**
     * GetAllUsers.
     */
    async getAllUsers(): Promise<ModelUser[]> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>[]>(API_ROUTES.USERS.LIST(), {
                method: "GET",
            });
            
            if (error) {
                console.error("Error fetching users:", error);
                return [];
            }
            return data ? ModelUser.fromJsonList(data) : [];
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    }

    /**
     * CreateUsers.
     */
    async createUser(user: ModelUser): Promise<ModelUser | null> {
        return Promise.resolve(user);
    }

    /**
     * PartialUpdateUsers.
     */
    async partialUpdateUser(id: string, partial: Partial<ModelUser>): Promise<ModelUser | null> {
        return Promise.resolve(id && partial ? { id, ...partial } as ModelUser : null);
    }

    /**
     * DeleteUsers.
     */
    async deleteUser(id: string): Promise<boolean> {
        return Promise.resolve(!!id);
    }

    /**
     * CheckHealth.
     */
    async checkUserHealth(): Promise<{ status: string }> {
        return Promise.resolve({ status: "healthy" });
    }
}
