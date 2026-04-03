import { ModuleSchema, FeatureSchema } from "../../config_validator";
import { getFileName } from "../../utils/functions/commons/file_name";

// ────── Générer import usecase (chemin absolu @/modules/...) pour les controllers ──────

/**
 * Retourne le chemin d'importation absolu d'un usecase pour un controller.
 * @param ucName Le nom du usecase.
 * @param module Le schéma du module.
 * @param feature Le schéma de la feature.
 * @returns Le chemin d'importation absolu du usecase.
 */
export function getUsecaseImportPathForController(
    ucName: string,
    module: ModuleSchema,
    feature: FeatureSchema
): string {
    const casing = module.$fileNameCasing ?? "snakeCase";
    const moduleFile = module.$name;
    const featureFile = getFileName(casing, feature.$name);
    const ucFile = getFileName(casing, `${ucName}_use_case`);
    return `@/modules/${moduleFile}/${featureFile}/domain/usecases/${ucFile}`;
}
