"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCustomTypeMock = generateCustomTypeMock;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const file_name_1 = require("../../utils/functions/commons/file_name");
const templates_base_1 = require("../../utils/templates/templates_base");
const ts_morph_1 = require("ts-morph");
function generateCustomTypeMock(module, config, feature, project) {
    console.log("🎭 [Mock-TYPE] Génération du mock de type custom...");
    if (!feature?.$types && !module?.$types) {
        console.log("⚠️ [Mock-TYPE] Pas de types → pas de mock de type custom");
        return;
    }
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
    const casing = module.$fileNameCasing ?? "snakeCase";
    const moduleDir = path_1.default.join(process.cwd(), "src", "modules", module.$name);
    if (feature?.$types) {
        const featureFile = (0, file_name_1.getFileName)(casing, feature.$name);
        const featurePath = path_1.default.join(moduleDir, featureFile);
        const mocksDir = path_1.default.join(featurePath, "domain", "mocks", "types");
        fs_1.default.mkdirSync(mocksDir, { recursive: true });
        (feature.$types ?? []).forEach(t => {
            if (!t.$mocks) {
                console.log("⚠️ [Mock-MODULE-TYPE] Pas de mock de type custom pour le type", t.$name);
                return;
            }
            const content = templates_base_1.T.mockCustomType(config, module, t, feature);
            const mockFilePath = path_1.default.join(mocksDir, `mock_${(0, file_name_1.getFileName)(casing, t.$name)}.ts`);
            fs_1.default.writeFileSync(mockFilePath, content);
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
            fs_1.default.mkdirSync(path_1.default.dirname(mockFilePath), { recursive: true });
            fs_1.default.writeFileSync(mockFilePath, sourceFile.getFullText());
            console.log("✅ [Mock-Feature-TYPE] Fichier généré :", mockFilePath);
        });
    }
    if (module.$types) {
        const mocksDir = path_1.default.join(moduleDir, "types", "mocks");
        fs_1.default.mkdirSync(mocksDir, { recursive: true });
        (module.$types ?? []).forEach(t => {
            if (!t.$mocks) {
                console.log("⚠️ [Mock-MODULE-TYPE] Pas de mock de type custom pour le type", t.$name);
                return;
            }
            const content = templates_base_1.T.mockCustomType(config, module, t);
            const mockFilePath = path_1.default.join(mocksDir, `mock_${(0, file_name_1.getFileName)(casing, t.$name)}.ts`);
            fs_1.default.writeFileSync(mockFilePath, content);
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
            fs_1.default.mkdirSync(path_1.default.dirname(mockFilePath), { recursive: true });
            fs_1.default.writeFileSync(mockFilePath, sourceFile.getFullText());
            console.log("✅ [Mock-MODULE-TYPE] Fichier généré :", mockFilePath);
        });
    }
    console.log("✅ [Mock-TYPES] Fichiers générés pour le module", module.$name);
}
