"use strict";
// ────── Générer interface dynamiquement (type-safe) ──────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInterfaceWithImports = generateInterfaceWithImports;
const default_values_1 = require("../../utils/functions/commons/default_values");
const resolve_import_path_for_custom_type_1 = require("../../utils/functions/module/imports/resolve_import_path_for_custom_type");
const fs_1 = __importDefault(require("fs"));
const resolve_import_paths_1 = require("../../utils/functions/module/imports/resolve_import_paths");
/**
 * Génère une interface dynamiquement (type-safe).
 * @param {string} filePath - Chemin du fichier à écrire.
 * @param {string} baseTemplate - Modèle de base pour le fichier.
 * @param {string[]} methods - Méthodes à ajouter à l'interface.
 * @param {UsecaseImportSchema[]} imports - Imports à ajouter à l'interface.
 * @param {ModuleSchema} currentModule - Module en cours.
 * @param {FeatureSchema} currentFeature - Feature en cours.
 * @param {ModulesConfigSchema} config - Configuration de l'application.
 * @param {"repository" | "datasource"} context - Contexte où est appelée cette fonction.
 */
function generateInterfaceWithImports(filePath, baseTemplate, methods, imports, currentModule, currentFeature, config, context // ← NOUVEAU
) {
    const content = fs_1.default.existsSync(filePath) ? fs_1.default.readFileSync(filePath, "utf8") : "";
    // 1. Extraire imports existants
    const existingImports = new Map();
    const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*["']([^"']+)["'];/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const types = match[1].split(",").map(t => t.trim()).filter(Boolean);
        types.forEach(t => existingImports.set(t, match[0]));
    }
    // 2. Résoudre et ajouter les nouveaux imports
    imports.forEach(imp => {
        const resolved = imp.$step === "module" ? (0, resolve_import_path_for_custom_type_1.resolveImportPathForCustomType)(imp, currentModule, config) : (0, resolve_import_paths_1.resolveImportPath)(imp, currentModule, currentFeature, config, context);
        if (!existingImports.has(resolved.type)) {
            existingImports.set(resolved.type, `import { ${resolved.type} } from "${resolved.from}";`);
        }
    });
    // 3. Reconstruire le fichier
    const importLines = Array.from(existingImports.values()).join("\n");
    const methodsBlock = methods.length > 0
        ? methods.join("\n\n")
        : "  // Aucune méthode générée";
    let finalContent = importLines + "\n\n" + baseTemplate;
    finalContent = finalContent.replace(default_values_1.placeholderMethods, methodsBlock);
    fs_1.default.writeFileSync(filePath, finalContent.trim() + "\n");
}
