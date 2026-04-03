"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModel = generateModel;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const templates_base_1 = require("../../utils/templates/templates_base");
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Génère le modèle de données de la feature.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
function generateModel(module, f, config) {
    console.log("🧠 [Model] Génération du modèle de données...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featurePath = path_1.default.join(root, "modules", module.$name, featureFile);
    const entityAttrs = f.$entity?.$attributes ?? [];
    const modelFilePath = path_1.default.join(featurePath, "data", "models", `${(0, file_name_1.getFileName)(casing, `model_${featureFile}`)}.ts`);
    if (!f.$entity) {
        console.log("⚠️ [Entity] La feature n'a pas d'entité, ignorer...");
        return;
    }
    if (fs_1.default.existsSync(modelFilePath) && f.$entity?.$overwrite !== true) {
        console.log("⚠️ [Entity] Fichier de model existant, réécriture de fichier ignorer...");
        return;
    }
    fs_1.default.writeFileSync(modelFilePath, templates_base_1.T.model(module, f, entityAttrs, config));
    console.log("✅ [Model] Fichier généré.");
}
