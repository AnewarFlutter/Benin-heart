import { EntityStock } from "../entities/entity_stock";
import { StockRepository } from "../repositories/stock_repository";

/**
 * GetAllStocks use case for Stock feature.
 */
export class GetAllStocksUseCase {
    constructor(private readonly repository: StockRepository) {}

    /**
     * Executes the use case.
     */
    async execute(): Promise<EntityStock[]> {
        return this.repository.getAllStocks();
    }
}
