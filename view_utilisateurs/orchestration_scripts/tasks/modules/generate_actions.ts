import fs from "fs";
import path from "path";
import { ModuleSchema, FeatureSchema } from "../../config_validator";
import { T } from "../../utils/templates/templates_base";
import { getFileName } from "../../utils/functions/commons/file_name";

/**
 * Génère les actions de la feature si elles n'existent pas.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 */
export function generateActions(module: ModuleSchema, f: FeatureSchema) {
    console.log("🧭 [Actions] Génération des actions...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, f.$name);
    const root = path.join(process.cwd(), "src");
    const actionsPath = path.join(root, "actions", module.$name, featureFile);
    // Récupere le chemin du fichier d'action
    const ftActionPath = path.join(actionsPath, `${getFileName(casing, `${featureFile}_actions`)}.ts`);
    // Si le fichier d'action n'existe pas, on le créer
    if (!fs.existsSync(ftActionPath)) {
        fs.writeFileSync(ftActionPath, T.actions(module.$name, f.$name));
        console.log(`✨ Actions ${getFileName(casing, `${featureFile}_actions`)} ajoutées`);
    } else {
        console.log(`⏩ Actions ${getFileName(casing, `${featureFile}_actions`)} déjà existantes, ignorées`);
    }
    console.log("✅ [Actions] Terminés.");
}
