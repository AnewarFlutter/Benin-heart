"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceTemplate = void 0;
const casing_1 = require("../casing");
const default_values_1 = require("../functions/commons/default_values");
const DataSourceTemplate = (module, feature) => {
    const modelName = casing_1.toCasing.pascalCase(feature.$name);
    // const importPath = `../models/${getFileName(module.fileNameCasing ?? "snakeCase", `model_${featureFile}`)}`;
    // import { Model${modelName} } from "${importPath}";
    return `/**
 * ${casing_1.toCasing.pascalCase(modelName)}DataSource – Contrat d'accès aux données brutes pour l'entité ${modelName}
 * 
 * **Rôle** : Interface abstraite utilisée par le RepositoryImpl pour accéder aux données.
 * 
 * **Implémentations** :
 * - \`RestApi${casing_1.toCasing.pascalCase(modelName)}DataSourceImpl\`
 * - \`Firebase${casing_1.toCasing.pascalCase(modelName)}DataSourceImpl\`
 * - Mock pour tests
 * 
 * **Généré automatiquement** à partir des UseCases du module **${module.$name}**.
 * 
 * **Attention** : Utilise **Model${casing_1.toCasing.pascalCase(modelName)}**, pas l'entité métier.
 * 
 * @example
 * const ds: ${casing_1.toCasing.pascalCase(modelName)}DataSource = new RestApi${casing_1.toCasing.pascalCase(modelName)}DataSourceImpl();
 * const model = await ds.getUserById("123");
 */
export interface ${casing_1.toCasing.pascalCase(modelName)}DataSource {
  ${default_values_1.placeholderMethods}
}
`;
};
exports.DataSourceTemplate = DataSourceTemplate;
