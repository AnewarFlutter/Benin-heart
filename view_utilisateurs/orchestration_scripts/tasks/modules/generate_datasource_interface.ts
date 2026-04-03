import fs from "fs";
import path from "path";
import { ModuleSchema, FeatureSchema, ModulesConfigSchema, UsecaseImportSchema } from "../../config_validator";
import { T } from "../../utils/templates/templates_base";
import { getFileName } from "../../utils/functions/commons/file_name";
import { generateInterfaceWithImports } from "./generate_interface_with_imports";
import { Project } from "ts-morph";

/**
 * Génère l'interface de la datasource.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
export function generateDataSourceInterface(module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema, project?: Project) {
    console.log("🌐 [DataSource] Génération de la datasource...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, f.$name);
    const root = path.join(process.cwd(), "src");
    const featurePath = path.join(root, "modules", module.$name, featureFile);
    const dsDir = path.join(featurePath, "data", "datasources");
    const dsFile = path.join(dsDir, `${getFileName(casing, `${featureFile}_data_source`)}.ts`);
    fs.mkdirSync(dsDir, { recursive: true });
    const usecases = f.$usecases?.filter(uc => !uc.$delete) ?? [];
    const dsMethods = usecases.map(uc => T.dataSourceMethod(uc, f));
    const dsImports: UsecaseImportSchema[] = usecases
        .flatMap(uc => uc.$imports ?? [])
        .map(imp => {
            if (imp.$kind === "custom") {
                const hasFeatureFlag: boolean = imp.$from.includes('--feature') && imp.$step == "module";
                return ({ $name: imp.$name, $from: imp.$from, $step: imp.$step || hasFeatureFlag ? "feature" : "module" });
            }
            return ({ $name: imp.$name, $from: imp.$from });
        });
    generateInterfaceWithImports(
        dsFile,
        T.dataSource(module, f),
        dsMethods,
        dsImports,
        module,
        f,
        config,
        "datasource"
    );


        const tsProject = project ?? new Project({
                tsConfigFilePath: "tsconfig.json",
                skipFileDependencyResolution: true,
            });
    const sourceFile = tsProject.addSourceFileAtPath(dsFile);
        // === NETTOYAGE AUTOMATIQUE ===
        sourceFile.organizeImports(); // ← AJOUTE ÇA
    
        // --- Formatage ---
        sourceFile.formatText({
            indentSize: 4,
            convertTabsToSpaces: true,
            ensureNewLineAtEndOfFile: true,
        });
        sourceFile.saveSync();
    
    console.log(`✅ [DataSource] Mis à jour → ${dsFile}`);
}