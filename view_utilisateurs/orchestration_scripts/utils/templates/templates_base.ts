import { ModuleSchema, FeatureSchema, AttributeSchema, ModulesConfigSchema, EnumSchema, CustomTypeSchema, UsecaseSchema } from "../../config_validator";
import { EntityTemplate } from "./entity";
import { ModelTemplate } from "./model";
import { EnumBlockTemplate } from "./enum_block";
import { RepositoryMethodTemplate } from "./repository_method";
import { DataSourceMethodTemplate } from "./ds_method";
import { RepositoryTemplate } from "./repository";
import { DataSourceTemplate } from "./data_source";
import { RepoImplTemplate } from "./repo_mpl";
import { RestDsImplTemplate } from "./rest_ds_impl";
import { UsecaseTemplate } from "./usecase";
import { ControllerTemplate } from "./controller";
import { ActionsTemplate } from "./actions";
import { ReadmeModuleTemplate } from "./readme_module";
import { ReadmeFeatureTemplate } from "./readme_feature";
import { CustomTypeTemplate } from "./custom_type";
import { MakeMockEntityTemplate } from "./make_mock_entity";
import { MakeMockTypeTemplate } from "./make_mock_type";

// ────── Templates ──────

export const T = {
    entity: (module: ModuleSchema, feature: FeatureSchema, attrs: AttributeSchema[], config: ModulesConfigSchema) =>
        EntityTemplate(module, feature, attrs, config),

    mockEntity: (module: ModuleSchema, feature: FeatureSchema, attrs: AttributeSchema[], config: ModulesConfigSchema) =>
        MakeMockEntityTemplate(module, feature, attrs, config),

    model: (module: ModuleSchema, feature: FeatureSchema, attrs: AttributeSchema[], config: ModulesConfigSchema) =>
        ModelTemplate(module, feature, attrs, config),

    enumBlock: (scopeName: string, e: EnumSchema) => EnumBlockTemplate(scopeName, e),

    customType: (config: ModulesConfigSchema, module: ModuleSchema, type: CustomTypeSchema, feature?: FeatureSchema) =>
        CustomTypeTemplate(config, module, type, feature),

    mockCustomType: (config: ModulesConfigSchema, module: ModuleSchema, type: CustomTypeSchema, feature?: FeatureSchema) =>
        MakeMockTypeTemplate(config, module, type, feature),

    /** Génère une méthode du repository (JSDoc + signature) */
    repositoryMethod: (uc: UsecaseSchema, feature: FeatureSchema) => RepositoryMethodTemplate(uc, feature),

    /** Génère une méthode du DataSource (JSDoc + signature) */
    dataSourceMethod: (uc: UsecaseSchema, feature: FeatureSchema) => DataSourceMethodTemplate(uc, feature),

    /** Template complet du repository (merge-safe) */
    repository: (module: ModuleSchema, feature: FeatureSchema) => RepositoryTemplate(module, feature),

    /** Template complet du DataSource (merge-safe) */
    dataSource: (module: ModuleSchema, feature: FeatureSchema) => DataSourceTemplate(module, feature),

    repoImpl: (module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema) => RepoImplTemplate(module, f, config),

    restDsImpl: (module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema) => 
        RestDsImplTemplate(module, f, config),

    usecase: (uc: UsecaseSchema, feature: FeatureSchema, module: ModuleSchema, config: ModulesConfigSchema) => 
        UsecaseTemplate(uc, feature, module, config),

    controller: (module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema) => ControllerTemplate(module, f, config),

    actions: (module: string, feature: string) => ActionsTemplate(module, feature),

    readmeModule: (moduleName: string) => ReadmeModuleTemplate(moduleName),

    readmeFeature: (featureName: string) => ReadmeFeatureTemplate(featureName),
};