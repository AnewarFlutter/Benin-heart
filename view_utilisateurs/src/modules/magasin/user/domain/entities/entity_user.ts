
/**
 * EntityUser is an interface that represents the structure of a user entity.
 * It contains the basic attributes of a user.
 * It is used to type the user entity in the UseCase.
 */
export interface EntityUser {
    id?: string | null;
    username?: string | null;
    email?: string | null;
    isActive?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    // Add other relevant fields here
}
