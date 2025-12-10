
import { ModelStock } from "../models/model_stock";

/**
 *  StockDataSource is an interface that defines the contract for a Stock data source.
 *  It specifies the methods that must be implemented by any data source that provides
 *  access to stock data.
 */
export interface StockDataSource {
    /**
     * Healthcheck - Vérifie l'état du service Stock.
     * @returns Un objet indiquant le statut du service.
     */
    checkStockHealth(): Promise<{ status: string }>;

    /**
     * Liste tous les articles.
     * @returns Une liste de tous les articles.
     */
    getAllStocks(): Promise<ModelStock[]>;

    /**
     * Récupère un article par son id.
     * @param id L'id de l'article à récupérer.
     * @returns L'article ou null s'il n'existe pas.
     */
    getStockById(id: string): Promise<ModelStock | null>;

    /**
     * Crée un nouvel article.
     * @param stock Les données de l'article à créer.
     * @returns Le nouvel article créé.
     */
    createStock(stock: ModelStock): Promise<ModelStock | null>;

    /**
     * Met à jour complètement un article.
     * @param stock L'article à mettre à jour.
     * @returns L'article mis à jour, ou null si inexistant.
     */
    updateStock(stock: ModelStock): Promise<ModelStock | null>;

    /**
     * Met à jour partiellement un article.
     * @param id L'id de l'article à mettre à jour.
     * @param partial Les champs partiels à mettre à jour.
     * @returns L'article mis à jour, ou null si inexistant.
     */
    partialUpdateStock(id: string, partial: Partial<ModelStock>): Promise<ModelStock | null>;

    /**
     * Supprime un article.
     * @param id L'id de l'article à supprimer.
     * @returns True si supprimé, false sinon.
     */
    deleteStock(id: string): Promise<boolean>;
}
