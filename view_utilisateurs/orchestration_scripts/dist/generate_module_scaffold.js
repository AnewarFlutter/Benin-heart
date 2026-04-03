"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScaffold = generateScaffold;
// generate_module_scaffold.ts
// ────────────────────────────────────────────────────────────────────────
// 1. Lit la config validée
// 2. Crée : dossiers, entity, enums (split/merge), model, repo, ds, controller, actions
// 3. Met à jour src/di/features_di.ts (merge-safe)
// 4. Génère READMEs
// ────────────────────────────────────────────────────────────────────────
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
const deletes_1 = require("./tasks/modules/deletes");
const append_feature_di_1 = require("./tasks/modules/append_feature_di");
const generate_actions_1 = require("./tasks/modules/generate_actions");
const generate_api_1 = require("./tasks/modules/generate_api");
const generate_datasource_interface_1 = require("./tasks/modules/generate_datasource_interface");
const generate_entity_1 = require("./tasks/modules/generate_entity");
const generate_feature_types_1 = require("./tasks/modules/generate_feature_types");
const generate_model_1 = require("./tasks/modules/generate_model");
const generate_module_types_1 = require("./tasks/modules/generate_module_types");
const generate_readmes_1 = require("./tasks/modules/generate_readmes");
const generate_repository_implementation_1 = require("./tasks/modules/generate_repository_implementation");
const generate_repository_interface_1 = require("./tasks/modules/generate_repository_interface");
const generate_usecases_1 = require("./tasks/modules/generate_usecases");
const upsert_controller_1 = require("./tasks/modules/upsert_controller");
const upsert_ds_impl_1 = require("./tasks/modules/upsert_ds_impl");
const file_name_1 = require("./utils/functions/commons/file_name");
const generate_permissions_task_1 = require("./tasks/permissions/generate_permissions_task");
const generate_feature_enums_1 = require("./tasks/modules/generate_feature_enums");
const generate_module_enums_1 = require("./tasks/modules/generate_module_enums");
const generate_mock_entity_1 = require("./tasks/modules/generate_mock_entity");
const generate_mock_custom_type_1 = require("./tasks/modules/generate_mock_custom_type");
const generate_roles_task_1 = require("./tasks/roles/generate_roles_task");
// ────── Création d’une feature complète ──────
/**
 * Vérifie et applique l'override pour le module si spécifié.
 * Supprime le dossier du module si override est true.
 * @param module Le schéma du module.
 */
function handleModuleOverride(module) {
    console.log("🧹 [Override] Vérification de la suppression éventuelle du module...");
    if (module.$override === true) {
        const root = path_1.default.join(process.cwd(), "src");
        const modulePath = path_1.default.join(root, "modules", module.$name);
        fs_1.default.rmSync(modulePath, { recursive: true, force: true });
        console.log(`✅ Override: module ${module.$name} supprimé`);
    }
    console.log("🏁 [Override] Étape terminée.");
}
/**
 * Crée l'arborescence des dossiers pour la feature.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 */
function createFeatureDirectories(module, f) {
    console.log("📁 [Dossiers] Création de l’arborescence...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featurePath = path_1.default.join(root, "modules", module.$name, featureFile);
    const actionsPath = path_1.default.join(root, "actions", module.$name, featureFile);
    const adaptersPath = path_1.default.join(root, "adapters", module.$name, featureFile);
    [
        "data/datasources", "data/models", "data/repositories",
        "domain/entities", "domain/repositories", "domain/usecases", "domain/enums"
    ].forEach(sub => fs_1.default.mkdirSync(path_1.default.join(featurePath, sub), { recursive: true }));
    fs_1.default.mkdirSync(actionsPath, { recursive: true });
    fs_1.default.mkdirSync(adaptersPath, { recursive: true });
    console.log("✅ [Dossiers] Création terminée.");
}
/**
 * Crée une feature complète pour le module donné.
 * La feature est composée d'un ensemble de fichiers qui définissent
 * l'entité, les enums, les types, le modèle, les repositories,
 * les datasources, les usecases et le controller.
 *
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 * @param project Le projet TypeScript.
 */
function createFeature(module, f, config, project, apiConfig) {
    if (f.$delete === true || f.$skip === true) {
        console.log(`\n🚀 [START] Skipped de la feature "${f.$name}" du module "${module.$name}"`);
        return;
    }
    console.log(`\n🚀 [START] Création de la feature "${f.$name}" du module "${module.$name}"`);
    handleModuleOverride(module);
    createFeatureDirectories(module, f);
    (0, generate_feature_types_1.generateFeatureTypes)(config, module, f);
    (0, generate_module_types_1.generateModuleTypes)(config, module);
    (0, generate_entity_1.generateEntity)(module, f, config);
    (0, generate_mock_entity_1.generateEntityMock)(module, f, config, project);
    (0, generate_mock_custom_type_1.generateCustomTypeMock)(module, config, f, project);
    (0, generate_feature_enums_1.generateFeatureEnums)(module, f, project);
    (0, generate_module_enums_1.generateModuleEnums)(module, project);
    (0, generate_model_1.generateModel)(module, f, config);
    (0, generate_repository_interface_1.generateRepositoryInterface)(module, f, config);
    (0, generate_repository_implementation_1.generateRepositoryImplementation)(module, f, config, project);
    (0, generate_datasource_interface_1.generateDataSourceInterface)(module, f, config, project);
    (0, upsert_ds_impl_1.generateOrUpdateDataSourceImplementation)(module, f, config, project, apiConfig);
    (0, generate_usecases_1.generateUsecases)(module, f, config);
    (0, upsert_controller_1.generateOrUpdateController)(module, f, config, project);
    (0, generate_actions_1.generateActions)(module, f);
    (0, generate_readmes_1.generateReadmes)(module, f);
    // 🔥 suppression manuelle du fichier temp.ts s'il a été créé physiquement
    const tempPath = path_1.default.join(process.cwd(), "temp.ts");
    if (fs_1.default.existsSync(tempPath)) {
        try {
            fs_1.default.unlinkSync(tempPath);
            console.log("🧹 [Mock] Fichier temporaire supprimé :", tempPath);
        }
        catch (e) {
            console.error("❌ Impossible de supprimer temp.ts :", e);
        }
    }
    // -------------------------------
    // 4️⃣ Fin
    // ------------------------------- 
    console.log(`\n🎉 [END] Feature "${f.$name}" générée avec succès pour le module "${module.$name}".`);
}
/**
 * Crée un module orphelin.
 * Un module orphelin est un module qui n'a pas de feature associée.
 * Il est utilisé pour générer des modules qui ne contiennent pas de feature.
 * @param module Le schéma du module.
 * @param config La configuration globale de l'app.
 * @param project Le projet TypeScript.
 */
function createOrphanModule(module, config, project) {
    console.log(`\n🚀 [START-ORPHAN-MODULE] Création du module orphelin "${module.$name}"`);
    handleModuleOverride(module);
    (0, generate_module_types_1.generateModuleTypes)(config, module);
    (0, generate_module_enums_1.generateModuleEnums)(module, project);
    console.log(`\n🎉 [END-ORPHAN-MODULE] Module "${module.$name}" générée avec succès".`);
}
// ────── Entrypoint ──────
/**
 * Génère le scaffold de l'application en fonction de la configuration.
 * Les modules, les features et les usecases sont supprimés si leur propriété "delete" est à true.
 * Puis, les modules, les features et les usecases sont générés si leur propriété "delete" est à false.
 * @param projectConfig La configuration globale de l'app.
 */
function generateScaffold(projectConfig) {
    try {
        console.log("\n🚀  Démarrage du scaffold...");
        const project = new ts_morph_1.Project({ tsConfigFilePath: "tsconfig.json" });
        if (projectConfig.$primaryApi) {
            console.log("\n📦  Génération de l'API Principal...");
            (0, generate_api_1.generateApi)(projectConfig.$primaryApi, project);
            console.log("✅ [API] Mis à jour avec succès.");
        }
        if (projectConfig.$otherApis) {
            console.log("\n📦  Génération des Autres APIs");
            projectConfig.$otherApis.forEach(api => {
                console.log(`   ⚙️  API: ${api.$title ?? "-"}`);
                console.log("\n📦  Génération de l'API...");
                (0, generate_api_1.generateApi)(api, project);
                console.log("✅ [API] Mis à jour avec succès.");
            });
        }
        if (projectConfig.$modules) {
            const $modules = projectConfig.$modules;
            const config = { $modules };
            // 1. Suppression
            (0, deletes_1.deleteScaffold)(config);
            // 2. Génération
            console.log("\n📦  Génération des modules");
            config.$modules.forEach(mod => {
                if (mod.$delete)
                    return;
                if (mod.$skip) {
                    console.log(`\n📦  Module: ${mod.$name} skipped`);
                    return;
                }
                console.log(`\n📦  Module: ${mod.$name} (casing: ${mod.$fileNameCasing ?? 'snakeCase'})`);
                if ((mod.$enums || mod.$types) && !mod.$features.length) {
                    createOrphanModule(mod, config, project);
                    return;
                }
                mod.$features.forEach(feat => {
                    if (feat.$delete)
                        return;
                    if (feat.$skip) {
                        console.log(`\n📦  Feature: ${feat.$name} skipped`);
                        return;
                    }
                    console.log(`   ⚙️  Feature: ${feat.$name}`);
                    createFeature(mod, feat, config, project, projectConfig.$primaryApi);
                });
            });
            // 3. Nettoyage du DI
            // ── DI ──
            console.log("🧩 [DI] Injection de dépendance...");
            (0, append_feature_di_1.appendFeatureDI)(config, project);
            console.log("✅ [DI] Mis à jour avec succès.");
        }
        // Après appendFeatureDI(config, project);
        if (projectConfig.$permissions) {
            console.log("\n🧩 [Permissions] Génération des permissions globales (lot indépendant)...");
            (0, generate_permissions_task_1.generatePermissionsTask)(projectConfig, project);
            console.log("\n✅ [Permissions] Mis à jour avec succès.");
        }
        if (projectConfig.$roles) {
            console.log("\n🧩 [Roles] Génération des roles globales (lot indépendant)...");
            (0, generate_roles_task_1.generateRolesTask)(projectConfig, project);
            console.log("\n✅ [Roles] Mis à jour avec succès.");
        }
        console.log("\n✅ [Scaffold] Scaffolding terminé avec succès !");
    }
    catch (error) {
        console.error(error);
    }
}
