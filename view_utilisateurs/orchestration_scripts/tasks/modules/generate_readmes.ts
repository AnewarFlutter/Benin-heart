import fs from "fs";
import path from "path";
import { ModuleSchema, FeatureSchema } from "../../config_validator";
import { T } from "../../utils/templates/templates_base";
import { getFileName } from "../../utils/functions/commons/file_name";

/**
 * Génère les READMEs pour la feature et le module.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 */
export function generateReadmes(module: ModuleSchema, f: FeatureSchema) {
    console.log("📘 [READMEs] Création de la documentation...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, f.$name);
    const root = path.join(process.cwd(), "src");
    const featurePath = path.join(root, "modules", module.$name, featureFile);
    fs.writeFileSync(
        path.join(featurePath, `${f.$name.toUpperCase()}_README.md`),
        T.readmeFeature(f.$name)
    );
    const modReadme = path.join(root, "modules", module.$name, `${module.$name.toUpperCase()}_README.md`);
    if (!fs.existsSync(modReadme)) {
        fs.writeFileSync(modReadme, T.readmeModule(module.$name));
    }
    console.log("✅ [READMEs] Fichiers créés.");
}
