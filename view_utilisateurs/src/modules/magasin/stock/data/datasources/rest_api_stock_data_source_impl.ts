
import { apiClient } from "@/lib/api/api_client";
import { ModelStock } from "../models/model_stock";
import { StockDataSource } from "./stock_data_source";
import { API_ROUTES } from "@/shared/constants/api_routes";

/**
 *  Skeleton implementation of a stock data source using a REST API.
 *  Exposes methods to retrieve a stock by ID and update stock records; both are not yet implemented.
 *  @implements {StockDataSource}
 */
export class RestApiStockDataSourceImpl implements StockDataSource {

    /**
     *  Gets a stock by its id.
     *  @param id The id of the stock to retrieve.
     *  @returns A Promise that resolves to the stock with the given id, or null if it does not exist.
     */
    async getStockById(id: string): Promise<ModelStock | null> {
        try {
            console.log("Fetching stock from API:", API_ROUTES.STOCK.GET_BY_ID(id));
            const { data, error } = await apiClient<Record<string, unknown>>(API_ROUTES.STOCK.GET_BY_ID(id), {
                method: "GET",
            });

            if (error) {
                console.error("Error fetching stock:", error);
                return null;
            }
            
            return data ? ModelStock.fromJson(data) : null;
        } catch (error) {
            console.error("Error fetching stock:", error);
            return null;
        }
    }

    /**
     *  Updates a stock.
     *  @param stock The stock to update.
     *  @returns A Promise that resolves to the updated stock, or null if it does not exist.
     */
    async updateStock(stock: ModelStock): Promise<ModelStock | null> {
        try {
            if (!stock.id) {
                throw new Error("Stock id is required");
            }

            const { data, error } = await apiClient<Record<string, unknown>>(API_ROUTES.STOCK.UPDATE(stock.id), {
                method: "PUT",
                body: stock.toJsonWithoutId(),
            });
            
            if (error) {
                console.error("Error updating stock:", error);
                return null;
            }
            return data ? ModelStock.fromJson(data) : null;
        } catch (error) {
            console.error("Error updating stock:", error);
            return null;
        }
    }

    /**
     * DeleteStock.
     */
    async deleteStock(id: string): Promise<boolean> {
        return id !== "";
    }

    /**
     * PartialUpdateStock.
     */
    async partialUpdateStock(id: string, partial: Partial<ModelStock>): Promise<ModelStock | null> {
        return id !== "" && partial ?  {} as ModelStock : null;
    }

    /**
     * CreateStock.
     */
    async createStock(stock: ModelStock): Promise<ModelStock | null> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(API_ROUTES.STOCK.CREATE(), {
                method: "POST",
                body: stock.toJson(),
            });
            
            if (error) {
                console.error("Error creating stock:", error);
                return null;
            }
            return data ? ModelStock.fromJson(data) : null;
        } catch (error) {
            console.error("Error creating stock:", error);
            return null;
        }
    }

    /**
     * GetAllStocks.
     */
    async getAllStocks(): Promise<ModelStock[]> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>[]>(API_ROUTES.STOCK.LIST(), {
                method: "GET",
            });
            
            if (error) {
                console.error("Error fetching stocks:", error);
                return [];
            }
            return data ? ModelStock.fromJsonList(data) : [];
        } catch (error) {
            console.error("Error fetching stocks:", error);
            return [];
        }
    }

    /**
     * CheckHealth.
     */
    async checkStockHealth(): Promise<{status: string}> {
        throw new Error("Method not implemented.");
    }
}
