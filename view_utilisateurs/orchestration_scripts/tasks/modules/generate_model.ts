import fs from "fs";
import path from "path";
import { ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../config_validator";
import { T } from "../../utils/templates/templates_base";
import { getFileName } from "../../utils/functions/commons/file_name";

/**
 * Génère le modèle de données de la feature.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
export function generateModel(module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema) {
    console.log("🧠 [Model] Génération du modèle de données...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, f.$name);
    const root = path.join(process.cwd(), "src");
    const featurePath = path.join(root, "modules", module.$name, featureFile);
    const entityAttrs = f.$entity?.$attributes ?? [];

    const modelFilePath = path.join(featurePath, "data", "models", `${getFileName(casing, `model_${featureFile}`)}.ts`);

    if (!f.$entity) {
        console.log("⚠️ [Entity] La feature n'a pas d'entité, ignorer...");
        return;
    }

    if (fs.existsSync(modelFilePath) && f.$entity?.$overwrite !== true) {
        console.log("⚠️ [Entity] Fichier de model existant, réécriture de fichier ignorer...");
        return;
    }

    fs.writeFileSync(modelFilePath, T.model(module, f, entityAttrs, config));
    console.log("✅ [Model] Fichier généré.");
}