"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.T = void 0;
const entity_1 = require("./entity");
const model_1 = require("./model");
const enum_block_1 = require("./enum_block");
const repository_method_1 = require("./repository_method");
const ds_method_1 = require("./ds_method");
const repository_1 = require("./repository");
const data_source_1 = require("./data_source");
const repo_mpl_1 = require("./repo_mpl");
const rest_ds_impl_1 = require("./rest_ds_impl");
const usecase_1 = require("./usecase");
const controller_1 = require("./controller");
const actions_1 = require("./actions");
const readme_module_1 = require("./readme_module");
const readme_feature_1 = require("./readme_feature");
const custom_type_1 = require("./custom_type");
const make_mock_entity_1 = require("./make_mock_entity");
const make_mock_type_1 = require("./make_mock_type");
// ────── Templates ──────
exports.T = {
    entity: (module, feature, attrs, config) => (0, entity_1.EntityTemplate)(module, feature, attrs, config),
    mockEntity: (module, feature, attrs, config) => (0, make_mock_entity_1.MakeMockEntityTemplate)(module, feature, attrs, config),
    model: (module, feature, attrs, config) => (0, model_1.ModelTemplate)(module, feature, attrs, config),
    enumBlock: (scopeName, e) => (0, enum_block_1.EnumBlockTemplate)(scopeName, e),
    customType: (config, module, type, feature) => (0, custom_type_1.CustomTypeTemplate)(config, module, type, feature),
    mockCustomType: (config, module, type, feature) => (0, make_mock_type_1.MakeMockTypeTemplate)(config, module, type, feature),
    /** Génère une méthode du repository (JSDoc + signature) */
    repositoryMethod: (uc, feature) => (0, repository_method_1.RepositoryMethodTemplate)(uc, feature),
    /** Génère une méthode du DataSource (JSDoc + signature) */
    dataSourceMethod: (uc, feature) => (0, ds_method_1.DataSourceMethodTemplate)(uc, feature),
    /** Template complet du repository (merge-safe) */
    repository: (module, feature) => (0, repository_1.RepositoryTemplate)(module, feature),
    /** Template complet du DataSource (merge-safe) */
    dataSource: (module, feature) => (0, data_source_1.DataSourceTemplate)(module, feature),
    repoImpl: (module, f, config) => (0, repo_mpl_1.RepoImplTemplate)(module, f, config),
    restDsImpl: (module, f, config) => (0, rest_ds_impl_1.RestDsImplTemplate)(module, f, config),
    usecase: (uc, feature, module, config) => (0, usecase_1.UsecaseTemplate)(uc, feature, module, config),
    controller: (module, f, config) => (0, controller_1.ControllerTemplate)(module, f, config),
    actions: (module, feature) => (0, actions_1.ActionsTemplate)(module, feature),
    readmeModule: (moduleName) => (0, readme_module_1.ReadmeModuleTemplate)(moduleName),
    readmeFeature: (featureName) => (0, readme_feature_1.ReadmeFeatureTemplate)(featureName),
};
