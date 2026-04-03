import fs from "fs";
import path from "path";
import { ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../config_validator";
import { T } from "../../utils/templates/templates_base";
import { getFileName } from "../../utils/functions/commons/file_name";

/**
 * Génère l'entité principale de la feature.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
export function generateEntity(module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema) {
    console.log("🏗️ [Entity] Génération de l’entité principale...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, f.$name);
    const root = path.join(process.cwd(), "src");
    const featurePath = path.join(root, "modules", module.$name, featureFile);
    const entityAttrs = f.$entity?.$attributes ?? [];
    const entityFile = `${getFileName(casing, `entity_${featureFile}`)}.ts`;
    const entityFilePath = path.join(featurePath, "domain", "entities", entityFile);

    if (!f.$entity) {
        console.log("⚠️ [Entity] La feature n'a pas d'entité, ignorer...");
        return;
    }

    if (fs.existsSync(entityFilePath) && f.$entity?.$overwrite !== true) {
        console.log("⚠️ [Entity] Fichier d'entité existant, réécriture de fichier ignorer...");
        return;
    }

    fs.writeFileSync(entityFilePath, T.entity(module, f, entityAttrs, config));
    console.log("✅ [Entity] Fichier généré.");
}
