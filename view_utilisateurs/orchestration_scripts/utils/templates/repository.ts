import { ModuleSchema, FeatureSchema } from "../../config_validator";
import { toCasing } from "../casing";
import { placeholderMethods } from "../functions/commons/default_values";

export const RepositoryTemplate = (module: ModuleSchema, feature: FeatureSchema) => {
  const entityName = toCasing.pascalCase(feature.$name);
    //const importPath = `../entities/${getFileName(module.fileNameCasing ?? "snakeCase", `entity_${featureFile}`)}`;
    // import { Entity${entityName} } from "${importPath}";
    return `/**
 * ${toCasing.pascalCase(entityName)}Repository – Contrat de persistance pour l'entité ${entityName}
 * 
 * **Rôle** : Interface abstraite utilisée par les UseCases.
 * 
 * **Implémentations** :
 * - \`${toCasing.pascalCase(entityName)}RepositoryImpl\` (couche data)
 * - Mock pour tests
 * 
 * **Généré automatiquement** à partir des UseCases du module **${module.$name}**.
 * 
 * @example
 * const repo: ${toCasing.pascalCase(entityName)}Repository = container.get(${entityName}Repository);
 * const user = await repo.getUserById("123");
 */
export interface ${toCasing.pascalCase(entityName)}Repository {
  ${placeholderMethods}
}
`;
}