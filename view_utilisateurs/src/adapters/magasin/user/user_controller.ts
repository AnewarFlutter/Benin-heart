// Controller pour la feature user

import { EntityUser } from "@/modules/magasin/user/domain/entities/entity_user";
import { CheckUserHealthUseCase } from "@/modules/magasin/user/domain/usecases/check_user_health_usecase";
import { CreateUserUseCase } from "@/modules/magasin/user/domain/usecases/create_user_usecase";
import { DeleteUserUseCase } from "@/modules/magasin/user/domain/usecases/delete_user_usecase";
import { GetAllUsersUseCase } from "@/modules/magasin/user/domain/usecases/get_all_users_usecase";
import { GetUserByIdUseCase } from "@/modules/magasin/user/domain/usecases/get_user_by_id_usecase";
import { PartialUpdateUserUseCase } from "@/modules/magasin/user/domain/usecases/partial_update_user_usecase";
import { UpdateUserUseCase } from "@/modules/magasin/user/domain/usecases/update_user_usecase";

/**
 *  This class is an adapter for the user feature.
 *  It acts as an interface between the application and the user feature.
 *  It provides methods to get a user by id and update a user.
 */
export class UserController {
    /**
     *  Instantiates a new instance of the UserController class.
     *  @param getUserByIdUseCase The use case that gets a user by id.
     */
    constructor(
        private readonly checkUserHealthUseCase: CheckUserHealthUseCase,
        private readonly getAllUsersUseCase: GetAllUsersUseCase,
        private readonly getUserByIdUseCase: GetUserByIdUseCase,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly partialUpdateUserUseCase: PartialUpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
    ) { }

    /**
     *  Gets a users by id.
     *  @param id The id of the users to get.
     *  @returns A Promise that resolves to the users, or null if it does not exist.
     */
    getUserById = async (id: string): Promise<EntityUser | null> => {
        try {
            const res = await this.getUserByIdUseCase.execute(id);
            return res;
        } catch (e) {
            console.log(`Error while getting user by id: ${e}`);
            return null;
        }
    }

    checkUserHealth = async (): Promise<{ status: string }> => {
        try {
            const res = await this.checkUserHealthUseCase.execute();
            return res;
        } catch (e) {
            console.log(`Error while executing checkHealth: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return { status: "error" }
        }
    }


    getAllUsers = async (): Promise<EntityUser[]> => {
        try {
            const res = await this.getAllUsersUseCase.execute();
            return res;
        } catch (e) {
            console.log(`Error while executing getAllUsers: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return [];
        }
    }


    createUser = async (user: EntityUser): Promise<EntityUser | null> => {
        try {
            const res = await this.createUserUseCase.execute(user);
            return res;
        } catch (e) {
            console.log(`Error while executing createUser: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return null;
        }
    }


    updateUser = async (user: EntityUser): Promise<EntityUser | null> => {
        try {
            const res = await this.updateUserUseCase.execute(user);
            return res;
        } catch (e) {
            console.log(`Error while executing updateUser: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return null;
        }
    }


    partialUpdateUser = async (id: string, partial: Partial<EntityUser>): Promise<EntityUser | null> => {
        try {
            const res = await this.partialUpdateUserUseCase.execute(id, partial);
            return res;
        } catch (e) {
            console.log(`Error while executing partialUpdateUser: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return null;
        }
    }


    deleteUser = async (id: string): Promise<boolean> => {
        try {
            const res = await this.deleteUserUseCase.execute(id);
            return res;
        } catch (e) {
            console.log(`Error while executing deleteUser: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return false;
        }
    }

}
