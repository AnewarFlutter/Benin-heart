"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModuleTypes = generateModuleTypes;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const templates_base_1 = require("../../utils/templates/templates_base");
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Génère les types personnalisés au niveau du module.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature (utilisé pour le chemin).
 */
function generateModuleTypes(config, module) {
    console.log("🧱 [Module Types] Génération des types du module...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const root = path_1.default.join(process.cwd(), "src");
    const typesPath = path_1.default.join(root, "modules", module.$name);
    const moduleTypesDir = path_1.default.join(typesPath, "types");
    fs_1.default.mkdirSync(moduleTypesDir, { recursive: true });
    (module.$types ?? []).forEach(t => {
        if (t.$generate === false)
            return;
        const moduleTypesFile = path_1.default.join(moduleTypesDir, `${(0, file_name_1.getFileName)(casing, `${t.$name}_types`)}.ts`);
        fs_1.default.writeFileSync(moduleTypesFile, templates_base_1.T.customType(config, module, t));
    });
    console.log("✅ [Module Types] Terminée.");
}
