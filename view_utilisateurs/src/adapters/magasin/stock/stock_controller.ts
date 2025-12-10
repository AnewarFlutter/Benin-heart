// Controller pour la feature stock

import { EntityStock } from "@/modules/magasin/stock/domain/entities/entity_stock";
import { CheckStockHealthUseCase } from "@/modules/magasin/stock/domain/usecases/check_stock_health_usecase";
import { CreateStockUseCase } from "@/modules/magasin/stock/domain/usecases/create_stock_usecase";
import { DeleteStockUseCase } from "@/modules/magasin/stock/domain/usecases/delete_stock_usecase";
import { GetAllStocksUseCase } from "@/modules/magasin/stock/domain/usecases/get_all_stocks_usecase";
import { GetStockByIdUseCase } from "@/modules/magasin/stock/domain/usecases/get_stock_by_id_usecase";
import { PartialUpdateStockUseCase } from "@/modules/magasin/stock/domain/usecases/partial_update_stock_usecase";
import { UpdateStockUseCase } from "@/modules/magasin/stock/domain/usecases/update_stock_usecase";

/**
 *  This class is an adapter for the stock feature.
 *  It acts as an interface between the application and the stock feature.
 *  It provides methods to get a stock by id and update a stock.
 */
export class StockController {
    /**
     *  Instantiates a new instance of the StockController class.
     *  @param getStockByIdUseCase The use case that gets a stock by id.
     */
    constructor(
        private readonly getStockByIdUseCase: GetStockByIdUseCase,
        private readonly deleteStockUseCase: DeleteStockUseCase,
        private readonly partialUpdateStockUseCase: PartialUpdateStockUseCase,
        private readonly updateStockUseCase: UpdateStockUseCase,
        private readonly createStockUseCase: CreateStockUseCase,
        private readonly getAllStocksUseCase: GetAllStocksUseCase,
        private readonly checkHealthUseCase: CheckStockHealthUseCase
    ) { }

    /**
     *  Gets a stock by id.
     *  @param id The id of the stock to get.
     *  @returns A Promise that resolves to the stock, or null if it does not exist.
     */
    getStockById = async (id: string): Promise<EntityStock | null> => {
        try {
            const res = await this.getStockByIdUseCase.execute(id);
            return res;
        } catch (e) {
            console.log(`Error while getting stock by id: ${e}`);
            return null;
        }
    }

    deleteStock = async (id: string): Promise<boolean> => {
        try {
            const res = await this.deleteStockUseCase.execute(id);
            return res;
        } catch (e) {
            console.log(`Error while executing deleteStock: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return false;
        }
    }

    partialUpdateStock = async (id: string, partial: Partial<EntityStock>): Promise<EntityStock | null> => {
        try {
            const res = await this.partialUpdateStockUseCase.execute(id, partial);
            return res;
        } catch (e) {
            console.log(`Error while executing partialUpdateStock: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return null;
        }
    }

    updateStock = async (stock: EntityStock): Promise<EntityStock | null> => {
        try {
            const res = await this.updateStockUseCase.execute(stock);
            return res;
        } catch (e) {
            console.log(`Error while executing updateStock: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return null;
        }
    }

    createStock = async (stock: EntityStock): Promise<EntityStock | null> => {
        try {
            const res = await this.createStockUseCase.execute(stock);
            return res;
        } catch (e) {
            console.log(`Error while executing createStock: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return null;
        }
    }

    getAllStock = async (): Promise<EntityStock[]> => {
        try {
            const res = await this.getAllStocksUseCase.execute();
            return res;
        } catch (e) {
            console.log(`Error while executing getAllStock: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return [];
        }
    }

    getAllStocks = async (): Promise<EntityStock[]> => {
        try {
            const res = await this.getAllStocksUseCase.execute();
            return res;
        } catch (e) {
            console.log(`Error while executing getAllStocks: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return [];
        }
    }

    checkHealth = async (): Promise<{ status: string }> => {
        try {
            const res = await this.checkHealthUseCase.execute();
            return res;
        } catch (e) {
            console.log(`Error while executing checkHealth: ${e}`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return { status: "Error[Nothing]" };
        }
    }
}
