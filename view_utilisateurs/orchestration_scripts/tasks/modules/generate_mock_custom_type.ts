import fs from "fs";
import path from "path";
import { ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../config_validator";
import { getFileName } from "../../utils/functions/commons/file_name";
import { T } from "../../utils/templates/templates_base";
import { Project } from "ts-morph";

export function generateCustomTypeMock(
    module: ModuleSchema,
    config: ModulesConfigSchema,
    feature?: FeatureSchema,
    project?: Project,
) {
    console.log("🎭 [Mock-TYPE] Génération du mock de type custom...");

    if (!feature?.$types && !module?.$types) {
        console.log("⚠️ [Mock-TYPE] Pas de types → pas de mock de type custom");
        return;
    }

    // -------------------------------
    // 1️⃣ Création d’un projet ts-morph temporaire
    // -------------------------------
    const tsProject = project ?? new Project({
        useInMemoryFileSystem: true, // pas besoin de créer des fichiers physiques
        compilerOptions: {
            target: 3, // ES2015
            module: 1, // CommonJS
        },
    });

    const casing = module.$fileNameCasing ?? "snakeCase";
    const moduleDir = path.join(process.cwd(), "src", "modules", module.$name);

    if (feature?.$types) {
        const featureFile = getFileName(casing, feature.$name);
        const featurePath = path.join(moduleDir, featureFile);

        const mocksDir = path.join(featurePath, "domain", "mocks", "types");

        fs.mkdirSync(mocksDir, { recursive: true });
        (feature.$types ?? []).forEach(t => {

            if (!t.$mocks) {
                console.log("⚠️ [Mock-MODULE-TYPE] Pas de mock de type custom pour le type", t.$name);
                return;
            }

            const content = T.mockCustomType(config, module, t, feature);

            const mockFilePath = path.join(mocksDir, `mock_${getFileName(casing, t.$name)}.ts`);
            fs.writeFileSync(mockFilePath, content);

            const sourceFile = tsProject.createSourceFile("temp.ts", content, { overwrite: true });

            // -------------------------------
            // 2️⃣ Organize imports → supprime automatiquement les imports inutilisés
            // -------------------------------
            sourceFile.organizeImports();
            // --- Formatage ---
            sourceFile.formatText({
                indentSize: 4,
                convertTabsToSpaces: true,
                ensureNewLineAtEndOfFile: true,
            });
            sourceFile.saveSync();

            // -------------------------------
            // 3️⃣ Écriture du fichier
            // -------------------------------
            fs.mkdirSync(path.dirname(mockFilePath), { recursive: true });
            fs.writeFileSync(mockFilePath, sourceFile.getFullText());

            console.log("✅ [Mock-Feature-TYPE] Fichier généré :", mockFilePath);
        });
    }

    if (module.$types) { 
        const mocksDir = path.join(moduleDir, "types", "mocks");
        fs.mkdirSync(mocksDir, { recursive: true });

        (module.$types ?? []).forEach(t => {

            if(!t.$mocks) {
                console.log("⚠️ [Mock-MODULE-TYPE] Pas de mock de type custom pour le type", t.$name);
                return;
            }

            const content = T.mockCustomType(config, module, t);

            const mockFilePath = path.join(mocksDir, `mock_${getFileName(casing, t.$name)}.ts`);
            fs.writeFileSync(mockFilePath, content);

            const sourceFile = tsProject.createSourceFile("temp.ts", content, { overwrite: true });

            // -------------------------------
            // 2️⃣ Organize imports → supprime automatiquement les imports inutilisés
            // -------------------------------
            sourceFile.organizeImports();
            // --- Formatage ---
            sourceFile.formatText({
                indentSize: 4,
                convertTabsToSpaces: true,
                ensureNewLineAtEndOfFile: true,
            });
            sourceFile.saveSync();

            // -------------------------------
            // 3️⃣ Écriture du fichier
            // -------------------------------
            fs.mkdirSync(path.dirname(mockFilePath), { recursive: true });
            fs.writeFileSync(mockFilePath, sourceFile.getFullText());

            console.log("✅ [Mock-MODULE-TYPE] Fichier généré :", mockFilePath);
        });
    }

    console.log("✅ [Mock-TYPES] Fichiers générés pour le module", module.$name);
}
