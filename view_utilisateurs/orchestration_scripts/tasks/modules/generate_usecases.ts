import fs from "fs";
import path from "path";
import { ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../config_validator";
import { T } from "../../utils/templates/templates_base";
import { getFileName } from "../../utils/functions/commons/file_name";

/**
 * Génère les usecases de la feature.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
export function generateUsecases(module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema) {
    console.log("⚙️ [Usecases] Génération des usecases...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, f.$name);
    const root = path.join(process.cwd(), "src");
    const featurePath = path.join(root, "modules", module.$name, featureFile);
    const usecasesDir = path.join(featurePath, "domain", "usecases");
    fs.mkdirSync(usecasesDir, { recursive: true });
    (f.$usecases?.filter(uc => !uc.$delete) ?? []).forEach(uc => {
        const ucFileName = getFileName(casing, `${uc.$name}_use_case`);
        const ucFilePath = path.join(usecasesDir, `${ucFileName}.ts`);
        fs.writeFileSync(ucFilePath, T.usecase(uc, f, module, config));
    });
    console.log("✅ [Usecases] Générés avec succès.");
}