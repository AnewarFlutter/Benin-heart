import { StockDataSource } from "../datasources/stock_data_source";
import { ModelStock } from "../models/model_stock";
import { EntityStock } from "../../domain/entities/entity_stock";
import { StockRepository } from "../../domain/repositories/stock_repository";

/**
 *  Concrete implementation of StockRepository for the stock domain.
 *  Delegates data access to a StockDataSource and maps between ModelStock and EntityStock.
 *  Provides async methods to retrieve a stock by id and update a stock, propagating data source errors.
 */
export class StockRepositoryImpl implements StockRepository {

    private datasource: StockDataSource;

    /**
     *  Constructor for the StockRepositoryImpl class.
     *  @param datasource The StockDataSource that is used to access the stock data.
     */
    constructor(datasource: StockDataSource) {
        this.datasource = datasource;
    }

    /**
     *  Gets a stock by id.
     *  @param id The id of the stock to get.
     *  @returns A Promise that resolves to the stock, or null if the stock does not exist.
     */
    async getStockById(id: string): Promise<EntityStock | null> {
        try {
            const data = await this.datasource.getStockById(id);
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    /**
     *  Updates a stock.
     *  @param stock The stock to update.
     *  @returns A Promise that resolves to the updated stock, or null if the stock does not exist.
     */
    async updateStock(stock: EntityStock): Promise<EntityStock | null> {
        try {
            const data = await this.datasource.updateStock(ModelStock.fromEntity(stock));
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    /**
     * DeleteStock.
     */
    async deleteStock(id: string): Promise<boolean> {
        try {
            const data = await this.datasource.deleteStock(id);
            // TODO: Mapper les données si nécessaire, ex: data.toEntity() ou data.map(...)
            return data;
        } catch (e) {
            throw e;
        }
    }

    /**
     * PartialUpdateStock.
     */
    async partialUpdateStock(id: string, partial: Partial<EntityStock>): Promise<EntityStock | null> {
        try {
            const data = await this.datasource.partialUpdateStock(id, partial);
            // TODO: Mapper les données si nécessaire, ex: data.toEntity() ou data.map(...)
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    /**
     * CreateStock.
     */
    async createStock(stock: EntityStock): Promise<EntityStock | null> {
        try {
            const data = await this.datasource.createStock(ModelStock.fromEntity(stock));
            // TODO: Mapper les données si nécessaire, ex: data.toEntity() ou data.map(...)
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    /**
     * GetAllStocks.
     */
    async getAllStocks(): Promise<EntityStock[]> {
        try {
            const data = await this.datasource.getAllStocks();
            // TODO: Mapper les données si nécessaire, ex: data.toEntity() ou data.map(...)
            return data ? data.map((item) => item.toEntity()) : [];
        } catch (e) {
            throw e;
        }
    }

    /**
     * CheckHealth.
     */
    async checkStockHealth(): Promise<{ status: string }> {
        try {
            const data = await this.datasource.checkStockHealth();
            // TODO: Mapper les données si nécessaire, ex: data.toEntity() ou data.map(...)
            return data;
        } catch (e) {
            throw e;
        }
    }
}