
// ────── Générer interface dynamiquement (type-safe) ──────

import { UsecaseImportSchema, ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../config_validator";
import { placeholderMethods } from "../../utils/functions/commons/default_values";
import { resolveImportPathForCustomType } from "../../utils/functions/module/imports/resolve_import_path_for_custom_type";
import fs from "fs";
import { resolveImportPath } from "../../utils/functions/module/imports/resolve_import_paths";

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
export function generateInterfaceWithImports(
    filePath: string,
    baseTemplate: string,
    methods: string[],
    imports: UsecaseImportSchema[],
    currentModule: ModuleSchema,
    currentFeature: FeatureSchema,
    config: ModulesConfigSchema,
    context: "repository" | "datasource" // ← NOUVEAU
) {
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";

    // 1. Extraire imports existants
    const existingImports = new Map<string, string>();
    const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*["']([^"']+)["'];/g;
    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(content)) !== null) {
        const types = match[1].split(",").map(t => t.trim()).filter(Boolean);
        types.forEach(t => existingImports.set(t, match![0]));
    }

    // 2. Résoudre et ajouter les nouveaux imports
    imports.forEach(imp => {
        const resolved = imp.$step === "module" ? resolveImportPathForCustomType(imp, currentModule, config) : resolveImportPath(
            imp,
            currentModule,
            currentFeature,
            config,
            context
        );
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
    finalContent = finalContent.replace(placeholderMethods, methodsBlock);

    fs.writeFileSync(filePath, finalContent.trim() + "\n");
}