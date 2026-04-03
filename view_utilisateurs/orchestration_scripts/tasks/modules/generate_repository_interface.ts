import fs from "fs";
import path from "path";
import { ModuleSchema, FeatureSchema, ModulesConfigSchema, UsecaseImportSchema } from "../../config_validator";
import { T } from "../../utils/templates/templates_base";
import { generateInterfaceWithImports } from "./generate_interface_with_imports";
import { getFileName } from "../../utils/functions/commons/file_name";

/**
 * Génère l'interface du repository.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
export function generateRepositoryInterface(module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema) {
    console.log("🗂️ [Repository] Génération de l’interface du repository...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, f.$name);
    const root = path.join(process.cwd(), "src");
    const featurePath = path.join(root, "modules", module.$name, featureFile);
    const repoDir = path.join(featurePath, "domain", "repositories");
    const repoFile = path.join(repoDir, `${getFileName(casing, `${featureFile}_repository`)}.ts`);
    fs.mkdirSync(repoDir, { recursive: true });
    const usecases = f.$usecases?.filter(uc => !uc.$delete) ?? [];
    const repoMethods = usecases.map(uc => T.repositoryMethod(uc, f));
    const repoImports: UsecaseImportSchema[] = usecases
        .flatMap(uc => uc.$imports ?? [])
        .map(imp => {
            if (imp.$kind === "custom") {
                const hasFeatureFlag: boolean = !imp.$from.includes('--feature') && imp.$step == "module";
                return ({ $name: imp.$name, $from: imp.$from, $step: imp.$step ?? hasFeatureFlag ? "module" : "feature" });
            }
            return ({ $name: imp.$name, $from: imp.$from, $step: "module" });
        });
    generateInterfaceWithImports(
        repoFile,
        T.repository(module, f),
        repoMethods,
        repoImports,
        module,
        f,
        config,
        "repository"
    );
    console.log(`✅ [Repository] Mis à jour → ${repoFile}`);
}
