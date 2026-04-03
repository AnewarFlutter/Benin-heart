"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryTemplate = void 0;
const casing_1 = require("../casing");
const default_values_1 = require("../functions/commons/default_values");
const RepositoryTemplate = (module, feature) => {
    const entityName = casing_1.toCasing.pascalCase(feature.$name);
    //const importPath = `../entities/${getFileName(module.fileNameCasing ?? "snakeCase", `entity_${featureFile}`)}`;
    // import { Entity${entityName} } from "${importPath}";
    return `/**
 * ${casing_1.toCasing.pascalCase(entityName)}Repository – Contrat de persistance pour l'entité ${entityName}
 * 
 * **Rôle** : Interface abstraite utilisée par les UseCases.
 * 
 * **Implémentations** :
 * - \`${casing_1.toCasing.pascalCase(entityName)}RepositoryImpl\` (couche data)
 * - Mock pour tests
 * 
 * **Généré automatiquement** à partir des UseCases du module **${module.$name}**.
 * 
 * @example
 * const repo: ${casing_1.toCasing.pascalCase(entityName)}Repository = container.get(${entityName}Repository);
 * const user = await repo.getUserById("123");
 */
export interface ${casing_1.toCasing.pascalCase(entityName)}Repository {
  ${default_values_1.placeholderMethods}
}
`;
};
exports.RepositoryTemplate = RepositoryTemplate;
