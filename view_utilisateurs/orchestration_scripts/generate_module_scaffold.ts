// generate_module_scaffold.ts
// ────────────────────────────────────────────────────────────────────────
// 1. Lit la config validée
// 2. Crée : dossiers, entity, enums (split/merge), model, repo, ds, controller, actions
// 3. Met à jour src/di/features_di.ts (merge-safe)
// 4. Génère READMEs
// ────────────────────────────────────────────────────────────────────────
import fs from "fs";
import path from "path";

import { Project } from "ts-morph";

import {
    ModulesConfigSchema, FeatureSchema, ModuleSchema,
    ProjectConfigSchema,
    ApiConfigSchema,
} from "./config_validator";

import { deleteScaffold } from "./tasks/modules/deletes";
import { appendFeatureDI } from "./tasks/modules/append_feature_di";
import { generateActions } from "./tasks/modules/generate_actions";
import { generateApi } from "./tasks/modules/generate_api";
import { generateDataSourceInterface } from "./tasks/modules/generate_datasource_interface";
import { generateEntity } from "./tasks/modules/generate_entity";
import { generateFeatureTypes } from "./tasks/modules/generate_feature_types";
import { generateModel } from "./tasks/modules/generate_model";
import { generateModuleTypes } from "./tasks/modules/generate_module_types";
import { generateReadmes } from "./tasks/modules/generate_readmes";
import { generateRepositoryImplementation } from "./tasks/modules/generate_repository_implementation";
import { generateRepositoryInterface } from "./tasks/modules/generate_repository_interface";
import { generateUsecases } from "./tasks/modules/generate_usecases";
import { generateOrUpdateController } from "./tasks/modules/upsert_controller";
import { generateOrUpdateDataSourceImplementation } from "./tasks/modules/upsert_ds_impl";
import { getFileName } from "./utils/functions/commons/file_name";
import { generatePermissionsTask } from "./tasks/permissions/generate_permissions_task";
import { generateFeatureEnums } from "./tasks/modules/generate_feature_enums";
import { generateModuleEnums } from "./tasks/modules/generate_module_enums";
import { generateEntityMock } from "./tasks/modules/generate_mock_entity";
import { generateCustomTypeMock } from "./tasks/modules/generate_mock_custom_type";
import { generateRolesTask } from "./tasks/roles/generate_roles_task";

// ────── Création d’une feature complète ──────

/**
 * Vérifie et applique l'override pour le module si spécifié.
 * Supprime le dossier du module si override est true.
 * @param module Le schéma du module.
 */
function handleModuleOverride(module: ModuleSchema) {
    console.log("🧹 [Override] Vérification de la suppression éventuelle du module...");
    if (module.$override === true) {
        const root = path.join(process.cwd(), "src");
        const modulePath = path.join(root, "modules", module.$name);
        fs.rmSync(modulePath, { recursive: true, force: true });
        console.log(`✅ Override: module ${module.$name} supprimé`);
    }
    console.log("🏁 [Override] Étape terminée.");
}

/**
 * Crée l'arborescence des dossiers pour la feature.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 */
function createFeatureDirectories(module: ModuleSchema, f: FeatureSchema) {
    console.log("📁 [Dossiers] Création de l’arborescence...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, f.$name);
    const root = path.join(process.cwd(), "src");
    const featurePath = path.join(root, "modules", module.$name, featureFile);
    const actionsPath = path.join(root, "actions", module.$name, featureFile);
    const adaptersPath = path.join(root, "adapters", module.$name, featureFile);
    [
        "data/datasources", "data/models", "data/repositories",
        "domain/entities", "domain/repositories", "domain/usecases", "domain/enums"
    ].forEach(sub => fs.mkdirSync(path.join(featurePath, sub), { recursive: true }));
    fs.mkdirSync(actionsPath, { recursive: true });
    fs.mkdirSync(adaptersPath, { recursive: true });
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
function createFeature(module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema, project: Project, apiConfig?: ApiConfigSchema) {

    if (f.$delete === true || f.$skip === true) {
        console.log(`\n🚀 [START] Skipped de la feature "${f.$name}" du module "${module.$name}"`);
        return;
    }

    console.log(`\n🚀 [START] Création de la feature "${f.$name}" du module "${module.$name}"`);

    handleModuleOverride(module);
    createFeatureDirectories(module, f);
    generateFeatureTypes(config, module, f);
    generateModuleTypes(config, module);
    generateEntity(module, f, config);
    generateEntityMock(module, f, config, project);
    generateCustomTypeMock(module, config, f, project);
    generateFeatureEnums(module, f, project);
    generateModuleEnums(module, project);
    generateModel(module, f, config);
    generateRepositoryInterface(module, f, config);
    generateRepositoryImplementation(module, f, config, project);
    generateDataSourceInterface(module, f, config, project);
    generateOrUpdateDataSourceImplementation(module, f, config, project, apiConfig);
    generateUsecases(module, f, config);
    generateOrUpdateController(module, f, config, project);
    generateActions(module, f);
    generateReadmes(module, f);

    // 🔥 suppression manuelle du fichier temp.ts s'il a été créé physiquement
    const tempPath = path.join(process.cwd(), "temp.ts");

    if (fs.existsSync(tempPath)) {
        try {
            fs.unlinkSync(tempPath);
            console.log("🧹 [Mock] Fichier temporaire supprimé :", tempPath);
        } catch (e) {
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
function createOrphanModule(module: ModuleSchema, config: ModulesConfigSchema, project: Project) {

    console.log(`\n🚀 [START-ORPHAN-MODULE] Création du module orphelin "${module.$name}"`);

    handleModuleOverride(module);
    generateModuleTypes(config, module);
    generateModuleEnums(module, project);

    console.log(`\n🎉 [END-ORPHAN-MODULE] Module "${module.$name}" générée avec succès".`);
}



// ────── Entrypoint ──────

/**
 * Génère le scaffold de l'application en fonction de la configuration.
 * Les modules, les features et les usecases sont supprimés si leur propriété "delete" est à true.
 * Puis, les modules, les features et les usecases sont générés si leur propriété "delete" est à false.
 * @param projectConfig La configuration globale de l'app.
 */
export function generateScaffold(projectConfig: ProjectConfigSchema) {
    try {
        console.log("\n🚀  Démarrage du scaffold...");
        const project = new Project({ tsConfigFilePath: "tsconfig.json" });

        if (projectConfig.$primaryApi) {
            console.log("\n📦  Génération de l'API Principal...");
            generateApi(projectConfig.$primaryApi, project);
            console.log("✅ [API] Mis à jour avec succès.");
        }

        if (projectConfig.$otherApis) {
            console.log("\n📦  Génération des Autres APIs");
            projectConfig.$otherApis.forEach(api => {
                console.log(`   ⚙️  API: ${api.$title ?? "-"}`);
                console.log("\n📦  Génération de l'API...");
                generateApi(api, project);
                console.log("✅ [API] Mis à jour avec succès.");
            })
        }

        if (projectConfig.$modules) {
            const $modules: ModuleSchema[] = projectConfig.$modules;
            const config = { $modules };

            // 1. Suppression
            deleteScaffold(config);

            // 2. Génération
            console.log("\n📦  Génération des modules");
            config.$modules.forEach(mod => {
                if (mod.$delete) return;

                if (mod.$skip) {
                    console.log(`\n📦  Module: ${mod.$name} skipped`);
                    return
                }

                console.log(`\n📦  Module: ${mod.$name} (casing: ${mod.$fileNameCasing ?? 'snakeCase'})`);

                if ((mod.$enums || mod.$types) && !mod.$features.length) {
                    createOrphanModule(mod, config, project);
                    return;
                }

                mod.$features.forEach(feat => {
                    if (feat.$delete) return;
                    if (feat.$skip) {
                        console.log(`\n📦  Feature: ${feat.$name} skipped`);
                        return
                    }
                    console.log(`   ⚙️  Feature: ${feat.$name}`);
                    createFeature(mod, feat, config, project, projectConfig.$primaryApi);
                });
            });

            // 3. Nettoyage du DI
            // ── DI ──
            console.log("🧩 [DI] Injection de dépendance...");
            appendFeatureDI(config, project);
            console.log("✅ [DI] Mis à jour avec succès.");

        }

        // Après appendFeatureDI(config, project);
        if (projectConfig.$permissions) {
            console.log("\n🧩 [Permissions] Génération des permissions globales (lot indépendant)...");
            generatePermissionsTask(projectConfig, project);
            console.log("\n✅ [Permissions] Mis à jour avec succès.");
        }

        if (projectConfig.$roles) {
            console.log("\n🧩 [Roles] Génération des roles globales (lot indépendant)...");
            generateRolesTask(projectConfig, project);
            console.log("\n✅ [Roles] Mis à jour avec succès.");
        }

        console.log("\n✅ [Scaffold] Scaffolding terminé avec succès !");
    } catch (error) {
        console.error(error);
    }
}
