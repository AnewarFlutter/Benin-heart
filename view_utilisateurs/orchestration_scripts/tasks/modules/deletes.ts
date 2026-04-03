import fs from "fs";
import path from "path";
import { ModuleSchema, FeatureSchema, UsecaseSchema, ModulesConfigSchema } from "../../config_validator";
import { getFileName } from "../../utils/functions/commons/file_name";

/**
 * Supprime un usecase pour une feature donnée.
 * @param mod Le schéma du module.
 * @param feat Le schéma de la feature.
 * @param uc Le schéma du usecase à supprimer.
 */
export function deleteUsecase(mod: ModuleSchema, feat: FeatureSchema, uc: UsecaseSchema) {
    const casing = mod.$fileNameCasing ?? "snakeCase";
    const featureDir = getFileName(casing, feat.$name); // ← nom brut depuis config
    const ucFileName = getFileName(casing, `${uc.$name}_use_case`) + ".ts";

    const ucPath = path.join(
        process.cwd(),
        "src",
        "modules",
        mod.$name,
        featureDir,
        "domain",
        "usecases",
        ucFileName
    );

    console.log(`Tentative de suppression usecase : ${ucPath}`);

    if (fs.existsSync(ucPath)) {
        try {
            fs.unlinkSync(ucPath);
            console.log(`Supprimé : ${ucPath}`);
        } catch (err) {
            console.error(`Échec suppression : ${ucPath}`, err);
        }
    } else {
        console.warn(`Fichier non trouvé : ${ucPath}`);
        // Debug : lister les fichiers existants
        const usecasesDir = path.dirname(ucPath);
        if (fs.existsSync(usecasesDir)) {
            const files = fs.readdirSync(usecasesDir);
            console.log(`Fichiers dans ${usecasesDir} :`, files);
        }
    }
}

/**
 * Supprime les dossiers de la feature passée en argument.
 * Les dossiers suivants sont supprimés :
 * - src/modules/${mod.name}/${feat.name}
 * - src/adapters/${mod.name}/${feat.name}
 * - src/actions/${mod.name}/${feat.name}
 * 
 * @param mod Le schéma du module.
 * @param feat Le schéma de la feature.
 */
export function deleteFeature(mod: ModuleSchema, feat: FeatureSchema) {
    const featurePath = path.join(process.cwd(), "src", "modules", mod.$name, feat.$name);
    const adaptersPath = path.join(process.cwd(), "src", "adapters", mod.$name, feat.$name);
    const actionsPath = path.join(process.cwd(), "src", "actions", mod.$name, feat.$name);

    [featurePath, adaptersPath, actionsPath].forEach(p => {
        if (fs.existsSync(p)) {
            fs.rmSync(p, { recursive: true, force: true });
            console.log(`Supprimé : ${p}`);
        }
    });
}

/**
 * Supprime le module passé en argument.
 * Les dossiers suivants sont supprimés :
 * - src/modules/${mod.name}
 * - src/adapters/${mod.name}
 * - src/actions/${mod.name}
 * 
 * @param mod Le schéma du module.
 * */
export function deleteModule(mod: ModuleSchema) {
    const root = process.cwd();
    const modulePath = path.join(root, "src", "modules", mod.$name);
    const adaptersPath = path.join(root, "src", "adapters", mod.$name);
    const actionsPath = path.join(root, "src", "actions", mod.$name);

    // Supprimer dossiers
    [modulePath, adaptersPath, actionsPath].forEach(p => {
        if (fs.existsSync(p)) {
            fs.rmSync(p, { recursive: true, force: true });
            console.log(`Supprimé : ${p}`);
        }
    });
}

// ────── Suppression ──────

/**
 * Supprime le scaffold de l'application en fonction de la configuration.
 * Les modules, les features et les usecases sont supprimés si leur propriété "delete" est à true.
 * @param config La configuration globale de l'app.
 */
export function deleteScaffold(config: ModulesConfigSchema) {
    console.log("Suppression en cours...");

    config.$modules.forEach(mod => {
        if (mod.$delete) {
            deleteModule(mod);
            return;
        }

        mod.$features.forEach(feat => {
            if (feat.$delete) {
                deleteFeature(mod, feat);
                return;
            }

            feat.$usecases?.forEach(uc => {
                if (uc.$delete) {
                    deleteUsecase(mod, feat, uc);
                }
            });
        });
    });

    console.log("Suppression terminée !");
}