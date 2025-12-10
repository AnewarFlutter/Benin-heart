import { EntityStock } from "../entities/entity_stock";
import { StockRepository } from "../repositories/stock_repository";

/**
 * CreateStock use case for Stock feature.
 */
export class CreateStockUseCase {
    constructor(private readonly repository: StockRepository) {}

    /**
     * Executes the use case.
     */
    async execute(stock: EntityStock): Promise<EntityStock | null> {
        return this.repository.createStock(stock);
    }
}
