"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEntityMock = generateEntityMock;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const file_name_1 = require("../../utils/functions/commons/file_name");
const templates_base_1 = require("../../utils/templates/templates_base");
const ts_morph_1 = require("ts-morph");
function generateEntityMock(module, feature, config, project) {
    console.log("🎭 [Mock] Génération du mock d’entité...");
    if (!feature.$entity) {
        console.log("⚠️ [Mock] Pas d'entité → pas de mock");
        return;
    }
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, feature.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featPath = path_1.default.join(root, "modules", module.$name, featureFile);
    const mockFile = `${(0, file_name_1.getFileName)(casing, `mock_entity_${featureFile}`)}.ts`;
    const mockFilePath = path_1.default.join(featPath, "domain", "mocks", mockFile);
    const attrs = feature.$entity.$attributes ?? [];
    // Génération du contenu TS
    const content = templates_base_1.T.mockEntity(module, feature, attrs, config);
    // -------------------------------
    // 1️⃣ Création d’un projet ts-morph temporaire
    // -------------------------------
    const tsProject = project ?? new ts_morph_1.Project({
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
    fs_1.default.mkdirSync(path_1.default.dirname(mockFilePath), { recursive: true });
    fs_1.default.writeFileSync(mockFilePath, sourceFile.getFullText());
    console.log("✅ [Mock] Fichier généré :", mockFilePath);
}
