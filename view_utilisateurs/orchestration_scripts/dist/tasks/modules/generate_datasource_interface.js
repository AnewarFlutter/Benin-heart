"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDataSourceInterface = generateDataSourceInterface;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const templates_base_1 = require("../../utils/templates/templates_base");
const file_name_1 = require("../../utils/functions/commons/file_name");
const generate_interface_with_imports_1 = require("./generate_interface_with_imports");
const ts_morph_1 = require("ts-morph");
/**
 * Génère l'interface de la datasource.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
function generateDataSourceInterface(module, f, config, project) {
    console.log("🌐 [DataSource] Génération de la datasource...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featurePath = path_1.default.join(root, "modules", module.$name, featureFile);
    const dsDir = path_1.default.join(featurePath, "data", "datasources");
    const dsFile = path_1.default.join(dsDir, `${(0, file_name_1.getFileName)(casing, `${featureFile}_data_source`)}.ts`);
    fs_1.default.mkdirSync(dsDir, { recursive: true });
    const usecases = f.$usecases?.filter(uc => !uc.$delete) ?? [];
    const dsMethods = usecases.map(uc => templates_base_1.T.dataSourceMethod(uc, f));
    const dsImports = usecases
        .flatMap(uc => uc.$imports ?? [])
        .map(imp => {
        if (imp.$kind === "custom") {
            const hasFeatureFlag = imp.$from.includes('--feature') && imp.$step == "module";
            return ({ $name: imp.$name, $from: imp.$from, $step: imp.$step || hasFeatureFlag ? "feature" : "module" });
        }
        return ({ $name: imp.$name, $from: imp.$from });
    });
    (0, generate_interface_with_imports_1.generateInterfaceWithImports)(dsFile, templates_base_1.T.dataSource(module, f), dsMethods, dsImports, module, f, config, "datasource");
    const tsProject = project ?? new ts_morph_1.Project({
        tsConfigFilePath: "tsconfig.json",
        skipFileDependencyResolution: true,
    });
    const sourceFile = tsProject.addSourceFileAtPath(dsFile);
    // === NETTOYAGE AUTOMATIQUE ===
    sourceFile.organizeImports(); // ← AJOUTE ÇA
    // --- Formatage ---
    sourceFile.formatText({
        indentSize: 4,
        convertTabsToSpaces: true,
        ensureNewLineAtEndOfFile: true,
    });
    sourceFile.saveSync();
    console.log(`✅ [DataSource] Mis à jour → ${dsFile}`);
}
