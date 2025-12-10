
import { EntityUser } from "../entities/entity_user";

/**
 *  UserRepository is an interface that represents the contract for a User
 *  repository.
 *  It contains methods to get a user by id and update a user.
 */
export interface UserRepository {
    /**
     * Healthcheck - Vérifie l'état du service User.
     * @returns Un objet indiquant le statut du service.
     */
    checkUserHealth(): Promise<{ status: string }>;

    /**
     * Liste tous les utilisateurs.
     * @returns Une liste de tous les utilisateurs.
     */
    getAllUsers(): Promise<EntityUser[]>;

    /**
     * Récupère un utilisateur par son id.
     * @param id L'id de l'utilisateur à récupérer.
     * @returns L'utilisateur ou null s'il n'existe pas.
     */
    getUserById(id: string): Promise<EntityUser | null>;

    /**
     * Crée un nouvel utilisateur.
     * @param user Les données de l'utilisateur à créer.
     * @returns Le nouvel utilisateur créé.
     */
    createUser(user: EntityUser): Promise<EntityUser | null>;

    /**
     * Met à jour complètement un utilisateur.
     * @param users L'utilisateur à mettre à jour.
     * @returns L'utilisateur mis à jour, ou null si inexistant.
     */
    updateUser(users: EntityUser): Promise<EntityUser | null>;

    /**
     * Met à jour partiellement un utilisateur.
     * @param id L'id de l'utilisateur à mettre à jour.
     * @param partial Les champs partiels à mettre à jour.
     * @returns L'utilisateur mis à jour, ou null si inexistant.
     */
    partialUpdateUser(id: string, partial: Partial<EntityUser>): Promise<EntityUser | null>;

    /**
     * Supprime un utilisateur.
     * @param id L'id de l'utilisateur à supprimer.
     * @returns True si supprimé, false sinon.
     */
    deleteUser(id: string): Promise<boolean>;
}
