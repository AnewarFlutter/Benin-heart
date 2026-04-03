"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsecaseImportPathForController = getUsecaseImportPathForController;
const file_name_1 = require("../../utils/functions/commons/file_name");
// ────── Générer import usecase (chemin absolu @/modules/...) pour les controllers ──────
/**
 * Retourne le chemin d'importation absolu d'un usecase pour un controller.
 * @param ucName Le nom du usecase.
 * @param module Le schéma du module.
 * @param feature Le schéma de la feature.
 * @returns Le chemin d'importation absolu du usecase.
 */
function getUsecaseImportPathForController(ucName, module, feature) {
    const casing = module.$fileNameCasing ?? "snakeCase";
    const moduleFile = module.$name;
    const featureFile = (0, file_name_1.getFileName)(casing, feature.$name);
    const ucFile = (0, file_name_1.getFileName)(casing, `${ucName}_use_case`);
    return `@/modules/${moduleFile}/${featureFile}/domain/usecases/${ucFile}`;
}
