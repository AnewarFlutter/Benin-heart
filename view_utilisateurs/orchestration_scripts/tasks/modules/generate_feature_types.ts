import fs from "fs";
import path from "path";
import { ModulesConfigSchema, ModuleSchema, FeatureSchema } from "../../config_validator";
import { T } from "../../utils/templates/templates_base";
import { getFileName } from "../../utils/functions/commons/file_name";

/**
 * Génère les types personnalisés de la feature.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 */
export function generateFeatureTypes(config: ModulesConfigSchema, module: ModuleSchema, f: FeatureSchema) {
    console.log("🧩 [Feature Types] Génération des types de la feature...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, f.$name);
    const root = path.join(process.cwd(), "src");
    const featurePath = path.join(root, "modules", module.$name, featureFile);
    const typesDir = path.join(featurePath, "domain", "types");
    fs.mkdirSync(typesDir, { recursive: true });
    (f.$types ?? []).forEach(t => {
        if (t.$generate === false) return;
        const file = path.join(typesDir, `${getFileName(casing, t.$name)}.ts`);
        fs.writeFileSync(file, T.customType(config, module, t, f));
    });
    console.log("✅ [Feature Types] Terminée.");
}