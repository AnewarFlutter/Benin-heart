"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUsecases = generateUsecases;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const templates_base_1 = require("../../utils/templates/templates_base");
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Génère les usecases de la feature.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
function generateUsecases(module, f, config) {
    console.log("⚙️ [Usecases] Génération des usecases...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featurePath = path_1.default.join(root, "modules", module.$name, featureFile);
    const usecasesDir = path_1.default.join(featurePath, "domain", "usecases");
    fs_1.default.mkdirSync(usecasesDir, { recursive: true });
    (f.$usecases?.filter(uc => !uc.$delete) ?? []).forEach(uc => {
        const ucFileName = (0, file_name_1.getFileName)(casing, `${uc.$name}_use_case`);
        const ucFilePath = path_1.default.join(usecasesDir, `${ucFileName}.ts`);
        fs_1.default.writeFileSync(ucFilePath, templates_base_1.T.usecase(uc, f, module, config));
    });
    console.log("✅ [Usecases] Générés avec succès.");
}
