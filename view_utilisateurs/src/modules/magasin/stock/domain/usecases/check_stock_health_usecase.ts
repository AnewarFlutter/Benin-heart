import { StockRepository } from "../repositories/stock_repository";

/**
 * CheckStockHealth use case for Stock feature.
 */
export class CheckStockHealthUseCase {
    constructor(private readonly repository: StockRepository) {}

    /**
     * Executes the use case.
     */
    async execute(): Promise<{status: string}> {
        return this.repository.checkStockHealth();
    }
}
