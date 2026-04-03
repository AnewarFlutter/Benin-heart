import fs from "fs";
import path from "path";
import { ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../config_validator";
import { T } from "../../utils/templates/templates_base";
import { getFileName } from "../../utils/functions/commons/file_name";
import { Project } from "ts-morph";

/**
 * Génère l'implémentation du repository.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
export function generateRepositoryImplementation(module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema, project?: Project) {
    console.log("🔧 [Repository Impl] Génération de l’implémentation du repository...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, f.$name);
    const root = path.join(process.cwd(), "src");
    const featurePath = path.join(root, "modules", module.$name, featureFile);

    if (!f.$entity && f.$usecases.length === 0) {
        console.log("⚠️ [Entity] La feature n'a pas d'entité, ignorer...");
        return;
    }

    const filePath = path.join(featurePath, "data", "repositories", `${getFileName(casing, `${featureFile}_repository_impl`)}.ts`);

    fs.writeFileSync(filePath, T.repoImpl(module, f, config));

    const tsProject = project ?? new Project({
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
