import { StockRepository } from "../repositories/stock_repository";

/**
 * DeleteStock use case for Stock feature.
 */
export class DeleteStockUseCase {
    constructor(private readonly repository: StockRepository) {}

    /**
     * Executes the use case.
     */
    async execute(id: string): Promise<boolean> {
        return this.repository.deleteStock(id);
    }
}
