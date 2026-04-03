"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReadmes = generateReadmes;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const templates_base_1 = require("../../utils/templates/templates_base");
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Génère les READMEs pour la feature et le module.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 */
function generateReadmes(module, f) {
    console.log("📘 [READMEs] Création de la documentation...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featurePath = path_1.default.join(root, "modules", module.$name, featureFile);
    fs_1.default.writeFileSync(path_1.default.join(featurePath, `${f.$name.toUpperCase()}_README.md`), templates_base_1.T.readmeFeature(f.$name));
    const modReadme = path_1.default.join(root, "modules", module.$name, `${module.$name.toUpperCase()}_README.md`);
    if (!fs_1.default.existsSync(modReadme)) {
        fs_1.default.writeFileSync(modReadme, templates_base_1.T.readmeModule(module.$name));
    }
    console.log("✅ [READMEs] Fichiers créés.");
}
