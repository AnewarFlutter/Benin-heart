"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateActions = generateActions;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const templates_base_1 = require("../../utils/templates/templates_base");
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Génère les actions de la feature si elles n'existent pas.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 */
function generateActions(module, f) {
    console.log("🧭 [Actions] Génération des actions...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const actionsPath = path_1.default.join(root, "actions", module.$name, featureFile);
    // Récupere le chemin du fichier d'action
    const ftActionPath = path_1.default.join(actionsPath, `${(0, file_name_1.getFileName)(casing, `${featureFile}_actions`)}.ts`);
    // Si le fichier d'action n'existe pas, on le créer
    if (!fs_1.default.existsSync(ftActionPath)) {
        fs_1.default.writeFileSync(ftActionPath, templates_base_1.T.actions(module.$name, f.$name));
        console.log(`✨ Actions ${(0, file_name_1.getFileName)(casing, `${featureFile}_actions`)} ajoutées`);
    }
    else {
        console.log(`⏩ Actions ${(0, file_name_1.getFileName)(casing, `${featureFile}_actions`)} déjà existantes, ignorées`);
    }
    console.log("✅ [Actions] Terminés.");
}
