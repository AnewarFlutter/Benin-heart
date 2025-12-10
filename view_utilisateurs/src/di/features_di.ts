import { StockController } from "@/adapters/magasin/stock/stock_controller";
import { UserController } from "@/adapters/magasin/user/user_controller";
import { RestApiStockDataSourceImpl } from "@/modules/magasin/stock/data/datasources/rest_api_stock_data_source_impl";
import { StockRepositoryImpl } from "@/modules/magasin/stock/data/repositories/stock_repository_impl";
import { CheckStockHealthUseCase } from "@/modules/magasin/stock/domain/usecases/check_stock_health_usecase";
import { CreateStockUseCase } from "@/modules/magasin/stock/domain/usecases/create_stock_usecase";
import { DeleteStockUseCase } from "@/modules/magasin/stock/domain/usecases/delete_stock_usecase";
import { GetAllStocksUseCase } from "@/modules/magasin/stock/domain/usecases/get_all_stocks_usecase";
import { GetStockByIdUseCase } from "@/modules/magasin/stock/domain/usecases/get_stock_by_id_usecase";
import { PartialUpdateStockUseCase } from "@/modules/magasin/stock/domain/usecases/partial_update_stock_usecase";
import { UpdateStockUseCase } from "@/modules/magasin/stock/domain/usecases/update_stock_usecase";
import { RestApiUserDataSourceImpl } from "@/modules/magasin/user/data/datasources/rest_api_user_data_source_impl";
import { UserRepositoryImpl } from "@/modules/magasin/user/data/repositories/user_repository_impl";
import { CheckUserHealthUseCase } from "@/modules/magasin/user/domain/usecases/check_user_health_usecase";
import { CreateUserUseCase } from "@/modules/magasin/user/domain/usecases/create_user_usecase";
import { DeleteUserUseCase } from "@/modules/magasin/user/domain/usecases/delete_user_usecase";
import { GetAllUsersUseCase } from "@/modules/magasin/user/domain/usecases/get_all_users_usecase";
import { GetUserByIdUseCase } from "@/modules/magasin/user/domain/usecases/get_user_by_id_usecase";
import { PartialUpdateUserUseCase } from "@/modules/magasin/user/domain/usecases/partial_update_user_usecase";
import { UpdateUserUseCase } from "@/modules/magasin/user/domain/usecases/update_user_usecase";

// Dependency Injection (DI) setup for the all features

/**
 *  Dependency Injection (DI) setup for the Stock Feature.
 */
const stockDataSource = new RestApiStockDataSourceImpl();  // Or FirebaseStockDataSourceImpl | MongoDBStockDataSourceImpl | SupabaseStockDataSourceImpl | etc
const stockRepository = new StockRepositoryImpl(stockDataSource);

const getStockByIdUseCase = new GetStockByIdUseCase(stockRepository);
const deleteStockUseCase = new DeleteStockUseCase(stockRepository);
const partialUpdateStockUseCase = new PartialUpdateStockUseCase(stockRepository);
const updateStockUseCase = new UpdateStockUseCase(stockRepository);
const createStockUseCase = new CreateStockUseCase(stockRepository);
const getAllStocksUseCase = new GetAllStocksUseCase(stockRepository);
const checkStockHealthUseCase = new CheckStockHealthUseCase(stockRepository);

const stockController = new StockController(
    getStockByIdUseCase,
    deleteStockUseCase,
    partialUpdateStockUseCase,
    updateStockUseCase,
    createStockUseCase,
    getAllStocksUseCase,
    checkStockHealthUseCase
);

/**
 *  Dependency Injection (DI) setup for the User Feature.
 */
const userDataSource = new RestApiUserDataSourceImpl();  // Or FirebaseUserDataSourceImpl | MongoDBUserDataSourceImpl | SupabaseUserDataSourceImpl | etc
const userRepository = new UserRepositoryImpl(userDataSource);

const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const checkUserHealthUseCase = new CheckUserHealthUseCase(userRepository);
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const createUserUseCase = new CreateUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const partialUpdateUserUseCase = new PartialUpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);


const userController = new UserController(
    checkUserHealthUseCase,
    getAllUsersUseCase,
    getUserByIdUseCase,
    createUserUseCase,
    updateUserUseCase,
    partialUpdateUserUseCase,
    deleteUserUseCase
);

export const featuresDi = {
    stockController,
    userController
}