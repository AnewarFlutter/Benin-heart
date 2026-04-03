import { ModuleSchema, FeatureSchema } from "../../config_validator";
import { toCasing } from "../casing";
import { placeholderMethods } from "../functions/commons/default_values";

export const DataSourceTemplate = (module: ModuleSchema, feature: FeatureSchema) => {
  const modelName = toCasing.pascalCase(feature.$name);
    // const importPath = `../models/${getFileName(module.fileNameCasing ?? "snakeCase", `model_${featureFile}`)}`;
    // import { Model${modelName} } from "${importPath}";
    return `/**
 * ${toCasing.pascalCase(modelName)}DataSource – Contrat d'accès aux données brutes pour l'entité ${modelName}
 * 
 * **Rôle** : Interface abstraite utilisée par le RepositoryImpl pour accéder aux données.
 * 
 * **Implémentations** :
 * - \`RestApi${toCasing.pascalCase(modelName)}DataSourceImpl\`
 * - \`Firebase${toCasing.pascalCase(modelName)}DataSourceImpl\`
 * - Mock pour tests
 * 
 * **Généré automatiquement** à partir des UseCases du module **${module.$name}**.
 * 
 * **Attention** : Utilise **Model${toCasing.pascalCase(modelName)}**, pas l'entité métier.
 * 
 * @example
 * const ds: ${toCasing.pascalCase(modelName)}DataSource = new RestApi${toCasing.pascalCase(modelName)}DataSourceImpl();
 * const model = await ds.getUserById("123");
 */
export interface ${toCasing.pascalCase(modelName)}DataSource {
  ${placeholderMethods}
}
`;
}