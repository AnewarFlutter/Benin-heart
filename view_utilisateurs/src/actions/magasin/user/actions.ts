"use server";

import { featuresDi } from "@/di/features_di";
import { EntityUser } from "@/modules/magasin/user/domain/entities/entity_user";
import { AppActionResult } from "@/shared/types/global";

/**
 *  Gets a user by id and returns an ActionResult with the user data or null if it does not exist.
 *  @param id The id of the user to get.
 *  @returns A Promise that resolves to an ActionResult with the user data or null if it does not exist.
 */
export async function getUserByIdAction(id: string) : Promise<AppActionResult<EntityUser | null>> {
    const user = await featuresDi.userController.getUserById(id);
    if (user === null) {
        return { success: false, message: "Error while getting user by id.", data: user };
    } else {
        return { success: true, message: "User has been fetched.", data: user };
    }
}

/**
 * Gets all users and returns an ActionResult with the users list.
 * @returns A Promise that resolves to an ActionResult with the users data.
 */
export async function getAllUsersAction(): Promise<AppActionResult<EntityUser[]>> {
    const users = await featuresDi.userController.getAllUsers();
    if (users === null) {
        return { success: false, message: "Error while getting all users.", data: [] };
    } else {
        return { success: true, message: "Users have been fetched.", data: users };
    }
}


