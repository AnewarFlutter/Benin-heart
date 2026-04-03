"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRepositoryImplementation = generateRepositoryImplementation;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const templates_base_1 = require("../../utils/templates/templates_base");
const file_name_1 = require("../../utils/functions/commons/file_name");
const ts_morph_1 = require("ts-morph");
/**
 * Génère l'implémentation du repository.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
function generateRepositoryImplementation(module, f, config, project) {
    console.log("🔧 [Repository Impl] Génération de l’implémentation du repository...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featurePath = path_1.default.join(root, "modules", module.$name, featureFile);
    if (!f.$entity && f.$usecases.length === 0) {
        console.log("⚠️ [Entity] La feature n'a pas d'entité, ignorer...");
        return;
    }
    const filePath = path_1.default.join(featurePath, "data", "repositories", `${(0, file_name_1.getFileName)(casing, `${featureFile}_repository_impl`)}.ts`);
    fs_1.default.writeFileSync(filePath, templates_base_1.T.repoImpl(module, f, config));
    const tsProject = project ?? new ts_morph_1.Project({
        tsConfigFilePath: "tsconfig.json",
        skipFileDependencyResolution: true,
    });
    const sourceFile = tsProject.addSourceFileAtPath(filePath);
    // === NETTOYAGE AUTOMATIQUE ===
    sourceFile.organizeImports(); // ← AJOUTE ÇA
    // --- Formatage ---
    sourceFile.formatText({
        indentSize: 4,
        convertTabsToSpaces: true,
        ensureNewLineAtEndOfFile: true,
    });
    sourceFile.saveSync();
    console.log("✅ [Repository Impl] Fichier généré.");
}
