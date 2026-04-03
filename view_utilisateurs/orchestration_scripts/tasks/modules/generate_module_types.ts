import fs from "fs";
import path from "path";
import { ModulesConfigSchema, ModuleSchema } from "../../config_validator";
import { T } from "../../utils/templates/templates_base";
import { getFileName } from "../../utils/functions/commons/file_name";

/**
 * Génère les types personnalisés au niveau du module.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature (utilisé pour le chemin).
 */
export function generateModuleTypes(config: ModulesConfigSchema, module: ModuleSchema) {
    console.log("🧱 [Module Types] Génération des types du module...");
    const casing = module.$fileNameCasing ?? "snakeCase";

    const root = path.join(process.cwd(), "src");
    const typesPath = path.join(root, "modules", module.$name);
    const moduleTypesDir = path.join(typesPath, "types");
    fs.mkdirSync(moduleTypesDir, { recursive: true });
    (module.$types ?? []).forEach(t => {
        if (t.$generate === false) return;
        const moduleTypesFile = path.join(moduleTypesDir, `${getFileName(casing, `${t.$name}_types`)}.ts`);
        fs.writeFileSync(moduleTypesFile, T.customType(config, module, t));
    });
    console.log("✅ [Module Types] Terminée.");
}
