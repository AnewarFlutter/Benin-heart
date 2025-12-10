"use server";

import { featuresDi } from "@/di/features_di";
import { EntityStock } from "@/modules/magasin/stock/domain/entities/entity_stock";
import { AppActionResult } from "@/shared/types/global";

/**
 *  Gets a stock by id and returns an ActionResult with the stock data or null if it does not exist.
 *  @param id The id of the stock to get.
 *  @returns A Promise that resolves to an ActionResult with the stock data or null if it does not exist.
 */
export async function getStockByIdAction(id: string) : Promise<AppActionResult<EntityStock | null>> {
    const stock = await featuresDi.stockController.getStockById(id);
    if (stock === null) {
        return { success: false, message: "Error while getting stock by id.", data: stock };
    } else {
        return { success: true, message: "Stock has been fetched.", data: stock };
    }
}

export async function getAllStocksAction() : Promise<AppActionResult<EntityStock[]>> {
    const stock = await featuresDi.stockController.getAllStocks();
    if (stock === null) {
        return { success: false, message: "Error while getting stock by id.", data: stock };
    } else {
        return { success: true, message: "Stock has been fetched.", data: stock };
    }
}

