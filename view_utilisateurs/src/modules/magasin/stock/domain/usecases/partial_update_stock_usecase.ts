import { EntityStock } from "../entities/entity_stock";
import { StockRepository } from "../repositories/stock_repository";

/**
 * PartialUpdateStock use case for Stock feature.
 */
export class PartialUpdateStockUseCase {
    constructor(private readonly repository: StockRepository) {}

    /**
     * Executes the use case.
     */
    async execute(id: string, partial: Partial<EntityStock>): Promise<EntityStock | null> {
        return this.repository.partialUpdateStock(id, partial);
    }
}
