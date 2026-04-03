"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFeatureTypes = generateFeatureTypes;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const templates_base_1 = require("../../utils/templates/templates_base");
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Génère les types personnalisés de la feature.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 */
function generateFeatureTypes(config, module, f) {
    console.log("🧩 [Feature Types] Génération des types de la feature...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featurePath = path_1.default.join(root, "modules", module.$name, featureFile);
    const typesDir = path_1.default.join(featurePath, "domain", "types");
    fs_1.default.mkdirSync(typesDir, { recursive: true });
    (f.$types ?? []).forEach(t => {
        if (t.$generate === false)
            return;
        const file = path_1.default.join(typesDir, `${(0, file_name_1.getFileName)(casing, t.$name)}.ts`);
        fs_1.default.writeFileSync(file, templates_base_1.T.customType(config, module, t, f));
    });
    console.log("✅ [Feature Types] Terminée.");
}
