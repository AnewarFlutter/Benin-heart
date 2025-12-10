
import { EntityStock } from "../entities/entity_stock";
import { StockRepository } from "../repositories/stock_repository";

/**
 *  Gets a stock by id using the provided repository.
 *  @param id The id of the stock to get.
 *  @returns A Promise that resolves to the stock, or null if it does not exist.
 */
export class GetStockByIdUseCase {
    constructor(private readonly repository: StockRepository) { }

    /**
     *  Executes the use case.
     *  @param id The id of the stock to retrieve.
     *  @returns A promise that resolves to the stock with the given id, or null if it does not exist.
     */
    async execute(id: string): Promise<EntityStock | null> {
        return await this.repository.getStockById(id);
    }
}
