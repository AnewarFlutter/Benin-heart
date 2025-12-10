import { EntityStock } from "../entities/entity_stock";
import { StockRepository } from "../repositories/stock_repository";

/**
 * UpdateStock use case for Stock feature.
 */
export class UpdateStockUseCase {
    constructor(private readonly repository: StockRepository) {}

    /**
     * Executes the use case.
     */
    async execute(stock: EntityStock): Promise<EntityStock | null> {
        return this.repository.updateStock(stock);
    }
}
