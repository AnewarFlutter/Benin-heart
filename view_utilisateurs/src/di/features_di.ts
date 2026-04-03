
// ─── Magasin (reference module — do not remove) ────────────────────────────────

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

// ─── Benin Heart ───────────────────────────────────────────────────────────────

import { AuthController } from "@/adapters/beninheart/auth_controller";
import { ConversationController } from "@/adapters/beninheart/conversation_controller";
import { LikeController } from "@/adapters/beninheart/like_controller";
import { PlanController } from "@/adapters/beninheart/plan_controller";
import { ProfilController } from "@/adapters/beninheart/profil_controller";

import { RestApiAuthDataSourceImpl } from "@/modules/beninheart/auth/session/data/datasources/rest_api_auth_data_source_impl";
import { AuthRepositoryImpl } from "@/modules/beninheart/auth/session/data/repositories/auth_repository_impl";
import { ForgotPasswordUseCase } from "@/modules/beninheart/auth/session/domain/usecases/forgot_password_usecase";
import { LoginUseCase } from "@/modules/beninheart/auth/session/domain/usecases/login_usecase";
import { LogoutUseCase } from "@/modules/beninheart/auth/session/domain/usecases/logout_usecase";
import { RegisterUseCase } from "@/modules/beninheart/auth/session/domain/usecases/register_usecase";
import { ResendOTPUseCase } from "@/modules/beninheart/auth/session/domain/usecases/resend_otp_usecase";
import { ResetPasswordUseCase } from "@/modules/beninheart/auth/session/domain/usecases/reset_password_usecase";
import { VerifyOTPForgotPasswordUseCase } from "@/modules/beninheart/auth/session/domain/usecases/verify_otp_forgot_password_usecase";
import { VerifyOTPUseCase } from "@/modules/beninheart/auth/session/domain/usecases/verify_otp_usecase";

import { RestApiPlanDataSourceImpl } from "@/modules/beninheart/abonnement/plan/data/datasources/rest_api_plan_data_source_impl";
import { PlanRepositoryImpl } from "@/modules/beninheart/abonnement/plan/data/repositories/plan_repository_impl";
import { GetMonAbonnementUseCase } from "@/modules/beninheart/abonnement/plan/domain/usecases/get_mon_abonnement_usecase";
import { GetPlansUseCase } from "@/modules/beninheart/abonnement/plan/domain/usecases/get_plans_usecase";
import { SouscrireUseCase } from "@/modules/beninheart/abonnement/plan/domain/usecases/souscrire_usecase";

import { RestApiProfilDataSourceImpl } from "@/modules/beninheart/profil/profil/data/datasources/rest_api_profil_data_source_impl";
import { ProfilRepositoryImpl } from "@/modules/beninheart/profil/profil/data/repositories/profil_repository_impl";
import { GetMonProfilUseCase } from "@/modules/beninheart/profil/profil/domain/usecases/get_mon_profil_usecase";
import { GetProfilsUseCase } from "@/modules/beninheart/profil/profil/domain/usecases/get_profils_usecase";
import { UpdateMonProfilUseCase } from "@/modules/beninheart/profil/profil/domain/usecases/update_mon_profil_usecase";

import { RestApiLikeDataSourceImpl } from "@/modules/beninheart/like/like/data/datasources/rest_api_like_data_source_impl";
import { LikeRepositoryImpl } from "@/modules/beninheart/like/like/data/repositories/like_repository_impl";
import { GetMatchsUseCase } from "@/modules/beninheart/like/like/domain/usecases/get_matchs_usecase";
import { GetMesStatsUseCase } from "@/modules/beninheart/like/like/domain/usecases/get_mes_stats_usecase";
import { SwipeUseCase } from "@/modules/beninheart/like/like/domain/usecases/swipe_usecase";

import { RestApiConversationDataSourceImpl } from "@/modules/beninheart/conversation/conversation/data/datasources/rest_api_conversation_data_source_impl";
import { ConversationRepositoryImpl } from "@/modules/beninheart/conversation/conversation/data/repositories/conversation_repository_impl";
import { GetConversationsUseCase } from "@/modules/beninheart/conversation/conversation/domain/usecases/get_conversations_usecase";
import { GetMessagesUseCase } from "@/modules/beninheart/conversation/conversation/domain/usecases/get_messages_usecase";

// ──────────────────────────────────────────────────────────────────────────────
// Magasin DI
// ──────────────────────────────────────────────────────────────────────────────

const stockDataSource = new RestApiStockDataSourceImpl();
const stockRepository = new StockRepositoryImpl(stockDataSource);
const getStockByIdUseCase = new GetStockByIdUseCase(stockRepository);
const deleteStockUseCase = new DeleteStockUseCase(stockRepository);
const partialUpdateStockUseCase = new PartialUpdateStockUseCase(stockRepository);
const updateStockUseCase = new UpdateStockUseCase(stockRepository);
const createStockUseCase = new CreateStockUseCase(stockRepository);
const getAllStocksUseCase = new GetAllStocksUseCase(stockRepository);
const checkStockHealthUseCase = new CheckStockHealthUseCase(stockRepository);
const stockController = new StockController(
    getStockByIdUseCase, deleteStockUseCase, partialUpdateStockUseCase,
    updateStockUseCase, createStockUseCase, getAllStocksUseCase, checkStockHealthUseCase
);

const userDataSource = new RestApiUserDataSourceImpl();
const userRepository = new UserRepositoryImpl(userDataSource);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const checkUserHealthUseCase = new CheckUserHealthUseCase(userRepository);
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const createUserUseCase = new CreateUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const partialUpdateUserUseCase = new PartialUpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const userController = new UserController(
    checkUserHealthUseCase, getAllUsersUseCase, getUserByIdUseCase,
    createUserUseCase, updateUserUseCase, partialUpdateUserUseCase, deleteUserUseCase
);

// ──────────────────────────────────────────────────────────────────────────────
// Benin Heart — Auth DI
// ──────────────────────────────────────────────────────────────────────────────

const authDataSource = new RestApiAuthDataSourceImpl();
const authRepository = new AuthRepositoryImpl(authDataSource);
const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);
const verifyOTPUseCase = new VerifyOTPUseCase(authRepository);
const resendOTPUseCase = new ResendOTPUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);
const forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository);
const verifyOTPForgotPasswordUseCase = new VerifyOTPForgotPasswordUseCase(authRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(authRepository);
const authController = new AuthController(
    loginUseCase, registerUseCase, verifyOTPUseCase, resendOTPUseCase,
    logoutUseCase, forgotPasswordUseCase, verifyOTPForgotPasswordUseCase, resetPasswordUseCase
);

// ──────────────────────────────────────────────────────────────────────────────
// Benin Heart — Abonnement DI
// ──────────────────────────────────────────────────────────────────────────────

const planDataSource = new RestApiPlanDataSourceImpl();
const planRepository = new PlanRepositoryImpl(planDataSource);
const getPlansUseCase = new GetPlansUseCase(planRepository);
const souscrireUseCase = new SouscrireUseCase(planRepository);
const getMonAbonnementUseCase = new GetMonAbonnementUseCase(planRepository);
const planController = new PlanController(getPlansUseCase, souscrireUseCase, getMonAbonnementUseCase);

// ──────────────────────────────────────────────────────────────────────────────
// Benin Heart — Profil DI
// ──────────────────────────────────────────────────────────────────────────────

const profilDataSource = new RestApiProfilDataSourceImpl();
const profilRepository = new ProfilRepositoryImpl(profilDataSource);
const getProfilsUseCase = new GetProfilsUseCase(profilRepository);
const getMonProfilUseCase = new GetMonProfilUseCase(profilRepository);
const updateMonProfilUseCase = new UpdateMonProfilUseCase(profilRepository);
const profilController = new ProfilController(getProfilsUseCase, getMonProfilUseCase, updateMonProfilUseCase);

// ──────────────────────────────────────────────────────────────────────────────
// Benin Heart — Like DI
// ──────────────────────────────────────────────────────────────────────────────

const likeDataSource = new RestApiLikeDataSourceImpl();
const likeRepository = new LikeRepositoryImpl(likeDataSource);
const swipeUseCase = new SwipeUseCase(likeRepository);
const getMatchsUseCase = new GetMatchsUseCase(likeRepository);
const getMesStatsUseCase = new GetMesStatsUseCase(likeRepository);
const likeController = new LikeController(swipeUseCase, getMatchsUseCase, getMesStatsUseCase);

// ──────────────────────────────────────────────────────────────────────────────
// Benin Heart — Conversation DI
// ──────────────────────────────────────────────────────────────────────────────

const conversationDataSource = new RestApiConversationDataSourceImpl();
const conversationRepository = new ConversationRepositoryImpl(conversationDataSource);
const getConversationsUseCase = new GetConversationsUseCase(conversationRepository);
const getMessagesUseCase = new GetMessagesUseCase(conversationRepository);
const conversationController = new ConversationController(getConversationsUseCase, getMessagesUseCase);

// ──────────────────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────────────────

export const featuresDi = {
    // Magasin (reference)
    stockController,
    userController,

    // Benin Heart
    authController,
    planController,
    profilController,
    likeController,
    conversationController,
};
