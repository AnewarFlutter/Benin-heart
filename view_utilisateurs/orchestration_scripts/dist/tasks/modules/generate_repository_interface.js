"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRepositoryInterface = generateRepositoryInterface;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const templates_base_1 = require("../../utils/templates/templates_base");
const generate_interface_with_imports_1 = require("./generate_interface_with_imports");
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Génère l'interface du repository.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 */
function generateRepositoryInterface(module, f, config) {
    console.log("🗂️ [Repository] Génération de l’interface du repository...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featurePath = path_1.default.join(root, "modules", module.$name, featureFile);
    const repoDir = path_1.default.join(featurePath, "domain", "repositories");
    const repoFile = path_1.default.join(repoDir, `${(0, file_name_1.getFileName)(casing, `${featureFile}_repository`)}.ts`);
    fs_1.default.mkdirSync(repoDir, { recursive: true });
    const usecases = f.$usecases?.filter(uc => !uc.$delete) ?? [];
    const repoMethods = usecases.map(uc => templates_base_1.T.repositoryMethod(uc, f));
    const repoImports = usecases
        .flatMap(uc => uc.$imports ?? [])
        .map(imp => {
        if (imp.$kind === "custom") {
            const hasFeatureFlag = !imp.$from.includes('--feature') && imp.$step == "module";
            return ({ $name: imp.$name, $from: imp.$from, $step: imp.$step ?? hasFeatureFlag ? "module" : "feature" });
        }
        return ({ $name: imp.$name, $from: imp.$from, $step: "module" });
    });
    (0, generate_interface_with_imports_1.generateInterfaceWithImports)(repoFile, templates_base_1.T.repository(module, f), repoMethods, repoImports, module, f, config, "repository");
    console.log(`✅ [Repository] Mis à jour → ${repoFile}`);
}
