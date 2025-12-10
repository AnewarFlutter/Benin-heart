
import { ModelUser } from "../models/model_user";

/**
 *  UserDataSource is an interface that defines the contract for a User data source.
 *  It specifies the methods that must be implemented by any data source that provides
 *  access to user data.
 */
export interface UserDataSource {

    /**
     * Healthcheck - Vérifie l'état du service Users.
     * @returns Un objet indiquant le statut du service.
     */
    checkUserHealth(): Promise<{ status: string }>;

    /**
     * Liste tous les utilisateurs.
     * @returns Une liste de tous les utilisateurs.
     */
    getAllUsers(): Promise<ModelUser[]>;

    /**
     * Récupère un utilisateur par son id.
     * @param id L'id de l'utilisateur à récupérer.
     * @returns L'utilisateur ou null s'il n'existe pas.
     */
    getUserById(id: string): Promise<ModelUser | null>;

    /**
     * Crée un nouvel utilisateur.
     * @param user Les données de l'utilisateur à créer.
     * @returns Le nouvel utilisateur créé.
     */
    createUser(user: ModelUser): Promise<ModelUser | null>;

    /**
     * Met à jour complètement un utilisateur.
     * @param users L'utilisateur à mettre à jour.
     * @returns L'utilisateur mis à jour, ou null si inexistant.
     */
    updateUser(users: ModelUser): Promise<ModelUser | null>;

    /**
     * Met à jour partiellement un utilisateur.
     * @param id L'id de l'utilisateur à mettre à jour.
     * @param partial Les champs partiels à mettre à jour.
     * @returns L'utilisateur mis à jour, ou null si inexistant.
     */
    partialUpdateUser(id: string, partial: Partial<ModelUser>): Promise<ModelUser | null>;

    /**
     * Supprime un utilisateur.
     * @param id L'id de l'utilisateur à supprimer.
     * @returns True si supprimé, false sinon.
     */
    deleteUser(id: string): Promise<boolean>;
}
