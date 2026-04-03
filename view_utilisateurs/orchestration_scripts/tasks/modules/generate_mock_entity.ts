import fs from "fs";
import path from "path";
import { ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../config_validator";
import { getFileName } from "../../utils/functions/commons/file_name";
import { T } from "../../utils/templates/templates_base";
import { Project } from "ts-morph";

export function generateEntityMock(
    module: ModuleSchema,
    feature: FeatureSchema,
    config: ModulesConfigSchema,
    project?: Project,
) {
    console.log("🎭 [Mock] Génération du mock d’entité...");

    if (!feature.$entity) {
        console.log("⚠️ [Mock] Pas d'entité → pas de mock");
        return;
    }

    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, feature.$name);

    const root = path.join(process.cwd(), "src");
    const featPath = path.join(root, "modules", module.$name, featureFile);

    const mockFile = `${getFileName(casing, `mock_entity_${featureFile}`)}.ts`;
    const mockFilePath = path.join(featPath, "domain", "mocks", mockFile);

    const attrs = feature.$entity.$attributes ?? [];
    
    // Génération du contenu TS
    const content = T.mockEntity(module, feature, attrs, config);

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

    const sourceFile = tsProject.createSourceFile("temp.ts", content, { overwrite: true });

    // -------------------------------
    // 2️⃣ Organize imports → supprime automatiquement les imports inutilisés
    // -------------------------------
    sourceFile.organizeImports({
        indentSize: 4,
    });

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

    console.log("✅ [Mock] Fichier généré :", mockFilePath);
}
