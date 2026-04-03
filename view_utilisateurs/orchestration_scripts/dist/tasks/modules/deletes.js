"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUsecase = deleteUsecase;
exports.deleteFeature = deleteFeature;
exports.deleteModule = deleteModule;
exports.deleteScaffold = deleteScaffold;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Supprime un usecase pour une feature donnée.
 * @param mod Le schéma du module.
 * @param feat Le schéma de la feature.
 * @param uc Le schéma du usecase à supprimer.
 */
function deleteUsecase(mod, feat, uc) {
    const casing = mod.$fileNameCasing ?? "snakeCase";
    const featureDir = (0, file_name_1.getFileName)(casing, feat.$name); // ← nom brut depuis config
    const ucFileName = (0, file_name_1.getFileName)(casing, `${uc.$name}_use_case`) + ".ts";
    const ucPath = path_1.default.join(process.cwd(), "src", "modules", mod.$name, featureDir, "domain", "usecases", ucFileName);
    console.log(`Tentative de suppression usecase : ${ucPath}`);
    if (fs_1.default.existsSync(ucPath)) {
        try {
            fs_1.default.unlinkSync(ucPath);
            console.log(`Supprimé : ${ucPath}`);
        }
        catch (err) {
            console.error(`Échec suppression : ${ucPath}`, err);
        }
    }
    else {
        console.warn(`Fichier non trouvé : ${ucPath}`);
        // Debug : lister les fichiers existants
        const usecasesDir = path_1.default.dirname(ucPath);
        if (fs_1.default.existsSync(usecasesDir)) {
            const files = fs_1.default.readdirSync(usecasesDir);
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
function deleteFeature(mod, feat) {
    const featurePath = path_1.default.join(process.cwd(), "src", "modules", mod.$name, feat.$name);
    const adaptersPath = path_1.default.join(process.cwd(), "src", "adapters", mod.$name, feat.$name);
    const actionsPath = path_1.default.join(process.cwd(), "src", "actions", mod.$name, feat.$name);
    [featurePath, adaptersPath, actionsPath].forEach(p => {
        if (fs_1.default.existsSync(p)) {
            fs_1.default.rmSync(p, { recursive: true, force: true });
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
function deleteModule(mod) {
    const root = process.cwd();
    const modulePath = path_1.default.join(root, "src", "modules", mod.$name);
    const adaptersPath = path_1.default.join(root, "src", "adapters", mod.$name);
    const actionsPath = path_1.default.join(root, "src", "actions", mod.$name);
    // Supprimer dossiers
    [modulePath, adaptersPath, actionsPath].forEach(p => {
        if (fs_1.default.existsSync(p)) {
            fs_1.default.rmSync(p, { recursive: true, force: true });
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
function deleteScaffold(config) {
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
