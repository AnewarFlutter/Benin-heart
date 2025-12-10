
import { ModelStock } from "../models/model_stock";
import { StockDataSource } from "./stock_data_source";

/**
 *  Skeleton implementation of a stock data source using a REST API.
 *  Exposes methods to retrieve a stock by ID and update stock records; both are not yet implemented.
 *  @implements {StockDataSource}
 */
export class FirebaseStockDataSourceImpl implements StockDataSource {
    checkStockHealth(): Promise<{ status: string; }> {
        throw new Error("Method not implemented.");
    }
    getAllStocks(): Promise<ModelStock[]> {
        throw new Error("Method not implemented.");
    }
    createStock(stock: ModelStock): Promise<ModelStock | null> {
        return Promise.resolve(stock.id !== "" ?  {} as ModelStock : null);
        
    }
    partialUpdateStock(id: string, partial: Partial<ModelStock>): Promise<ModelStock | null> {
        return Promise.resolve(id !== "" && partial ?  {} as ModelStock : null);
    }
    deleteStock(id: string): Promise<boolean> {
        return Promise.resolve(id !== "");
    }

    /**
     *  Gets a stock by its id.
     *  @param id The id of the stock to retrieve.
     *  @returns A Promise that resolves to the stock with the given id, or null if it does not exist.
     */
    async getStockById(id: string): Promise<ModelStock | null> {
        return Promise.resolve(id !== "" ?  {} as ModelStock : null);
    }

    /**
     *  Updates a stock.
     *  @param stock The stock to update.
     *  @returns A Promise that resolves to the updated stock, or null if it does not exist.
     */
    async updateStock(stock: ModelStock): Promise<ModelStock | null> {
        return Promise.resolve(stock.id !== "" ?  {} as ModelStock : null);
    }
}
