
/**
 * EntityStock is an interface that represents the structure of a stock entity.
 * It contains the basic attributes of a stock.
 * It is used to type the stock entity in the UseCase.
 */
export interface EntityStock {
    id?: string | null;
    sku?: string | null;
    name?: string | null;
    quantity?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    // Add other relevant fields here
}
