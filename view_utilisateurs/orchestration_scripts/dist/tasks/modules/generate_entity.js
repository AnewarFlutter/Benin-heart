"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEntity = generateEntity;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const templates_base_1 = require("../../utils/templates/templates_base");
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Génère l'entité principale de la feature.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
function generateEntity(module, f, config) {
    console.log("🏗️ [Entity] Génération de l’entité principale...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featurePath = path_1.default.join(root, "modules", module.$name, featureFile);
    const entityAttrs = f.$entity?.$attributes ?? [];
    const entityFile = `${(0, file_name_1.getFileName)(casing, `entity_${featureFile}`)}.ts`;
    const entityFilePath = path_1.default.join(featurePath, "domain", "entities", entityFile);
    if (!f.$entity) {
        console.log("⚠️ [Entity] La feature n'a pas d'entité, ignorer...");
        return;
    }
    if (fs_1.default.existsSync(entityFilePath) && f.$entity?.$overwrite !== true) {
        console.log("⚠️ [Entity] Fichier d'entité existant, réécriture de fichier ignorer...");
        return;
    }
    fs_1.default.writeFileSync(entityFilePath, templates_base_1.T.entity(module, f, entityAttrs, config));
    console.log("✅ [Entity] Fichier généré.");
}
