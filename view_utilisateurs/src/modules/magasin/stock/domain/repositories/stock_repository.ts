import { EntityStock } from "../entities/entity_stock";

/**
 *  StockRepository is an interface that represents the contract for a Stock
 *  repository.
 *  It contains methods to get a stock by id and update a stock.
 */
export interface StockRepository {
    /**
         * StockHealthcheck - Vérifie l'état du service Stock.
         * @returns Un objet indiquant le statut du service.
         */
    checkStockHealth(): Promise<{ status: string }>;

    /**
     * Liste tous les articles.
     * @returns Une liste de tous les articles.
     */
    getAllStocks(): Promise<EntityStock[]>;

    /**
     * Récupère un article par son id.
     * @param id L'id de l'article à récupérer.
     * @returns L'article ou null s'il n'existe pas.
     */
    getStockById(id: string): Promise<EntityStock | null>;

    /**
     * Crée un nouvel article.
     * @param stock Les données de l'article à créer.
     * @returns Le nouvel article créé.
     */
    createStock(stock: EntityStock): Promise<EntityStock | null>;

    /**
     * Met à jour complètement un article.
     * @param stock L'article à mettre à jour.
     * @returns L'article mis à jour, ou null si inexistant.
     */
    updateStock(stock: EntityStock): Promise<EntityStock | null>;

    /**
     * Met à jour partiellement un article.
     * @param id L'id de l'article à mettre à jour.
     * @param partial Les champs partiels à mettre à jour.
     * @returns L'article mis à jour, ou null si inexistant.
     */
    partialUpdateStock(id: string, partial: Partial<EntityStock>): Promise<EntityStock | null>;

    /**
     * Supprime un article.
     * @param id L'id de l'article à supprimer.
     * @returns True si supprimé, false sinon.
     */
    deleteStock(id: string): Promise<boolean>;
}
