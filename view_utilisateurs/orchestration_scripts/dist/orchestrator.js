"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWithIncludes = loadWithIncludes;
// orchestration_scripts/orchestrator.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
const yaml_1 = require("yaml");
const config_validator_js_1 = require("./config_validator.js");
const generate_module_scaffold_js_1 = require("./generate_module_scaffold.js");
/** Merge déterministe : objets merge récursif, tableaux remplacés (pas concaténés), primitives remplacées */
function mergeValues(target, source) {
    // si source est tableau => on remplace (préviens concat de params)
    if (Array.isArray(source)) {
        return source;
    }
    // si target et source sont objets => merge clé-par-clé
    if (typeof target === "object" &&
        target !== null &&
        !Array.isArray(target) &&
        typeof source === "object" &&
        source !== null &&
        !Array.isArray(source)) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            const tVal = result[key];
            const sVal = source[key];
            if (tVal === undefined) {
                result[key] = sVal;
            }
            else {
                result[key] = mergeValues(tVal, sVal);
            }
        }
        return result;
    }
    // sinon source remplace target
    return source;
}
/**
 * Recursively scan structure and apply $includes contextuellement (version robuste).
 * Règles clés :
 *  - Si un objet contient **seulement** `$include`, on renvoie la valeur incluse (tableau/objet) au lieu de merger.
 *  - Si l'objet a d'autres clés, on merge clé-par-clé, en **remplaçant** les tableaux plutôt qu'en concaténant.
 */
function processNode(node, baseDir, parentKey) {
    // Primitives
    if (node === null || typeof node !== "object") {
        return node;
    }
    // if (Array.isArray(node)) {
    //         const processed = (node as JsonArray).map(item => processNode(item, baseDir, parentKey));
    //         // flatten automatique si un élément retourne un tableau
    //         return processed.flat() as JsonArray;
    //     }
    // Arrays -> traiter chaque élément
    if (Array.isArray(node)) {
        return node.map(item => processNode(item, baseDir, parentKey));
    }
    // Objects
    const obj = { ...node };
    // Si il y a include
    if (Object.prototype.hasOwnProperty.call(obj, "$include")) {
        const includeValue = obj["$include"];
        delete obj["$include"];
        const patterns = Array.isArray(includeValue) ? includeValue : [includeValue];
        // charger toutes les inclusions successives et stocker leur contenu
        const loadedItems = [];
        for (const p of patterns) {
            if (typeof p !== "string")
                throw new Error("$include must be a string or array of strings");
            const resolvedPattern = path_1.default.resolve(baseDir, p);
            const files = glob_1.glob.sync(resolvedPattern);
            for (const file of files) {
                const loaded = loadWithIncludes(file);
                loadedItems.push(loaded);
            }
        }
        // Si l'objet initial ne contenait **que** `$include`, on retourne la valeur incluse :
        // - si plusieurs fichiers et au moins un tableau → concat des tableaux
        // - si plusieurs objets → on merge key-by-key entre eux (donc on recompose un object)
        if (Object.keys(obj).length === 0) {
            const results = loadedItems.map(item => processNode(item, baseDir, parentKey));
            // Cas spécifique : usecases -> conserver tableau
            if (parentKey === "usecases")
                return results.flat();
            // Cas général : fusionner objets
            if (results.every(r => typeof r === "object" && !Array.isArray(r))) {
                let accum = {};
                for (const r of results) {
                    accum = mergeValues(accum, r);
                }
                return accum;
            }
            // Sinon tableau → prendre premier si seul, ou array si mix
            return results.length === 1 ? results[0] : results;
        }
        // Si l'objet avait d'autres clés, on merge la valeur incluse DANS l'objet existant,
        // en évitant de concaténer des tableaux internes — on remplace les tableaux.
        for (const it of loadedItems) {
            if (typeof it === "object" && it !== null && !Array.isArray(it)) {
                for (const k of Object.keys(it)) {
                    const sVal = it[k];
                    if (!obj.hasOwnProperty(k)) {
                        obj[k] = sVal;
                    }
                    else {
                        obj[k] = mergeValues(obj[k], sVal);
                    }
                }
            }
            else {
                // si l'inclusion est un tableau/primitive et qu'on a d'autres clés -> on stocke sous mergedInclude
                obj["mergedInclude"] = it;
            }
        }
    }
    // Recurse into children
    const finalObj = {};
    for (const key of Object.keys(obj)) {
        finalObj[key] = processNode(obj[key], baseDir, key);
    }
    return finalObj;
}
/**
 * Load YAML and process nested includes.
 * Includes are merged into the place where they appear.
 */
function loadWithIncludes(filePath) {
    const absolute = path_1.default.resolve(filePath);
    const rawContent = fs_1.default.readFileSync(absolute, "utf8");
    const parsed = (0, yaml_1.parse)(rawContent);
    if (typeof parsed !== "object" || parsed === null) {
        throw new Error(`YAML root must be an object: ${filePath}`);
    }
    const processed = processNode(parsed, path_1.default.dirname(absolute));
    return processed;
}
function processConfig(configPath) {
    const absolutePath = path_1.default.resolve(configPath);
    if (!fs_1.default.existsSync(absolutePath)) {
        console.error(`❌ Config not found: ${absolutePath}`);
        process.exit(1);
    }
    console.log(`📄 Loading config with includes: ${absolutePath}`);
    // 🔥🔥🔥 ICI : on charge AVEC includes, pas avec YAML brut
    const raw = loadWithIncludes(absolutePath);
    console.log(`📦 Config fully expanded (after includes)`);
    const config = (0, config_validator_js_1.validateConfig)(raw);
    console.log(`✅ Config validated`);
    (0, generate_module_scaffold_js_1.generateScaffold)(config);
    console.log("\n🎉 Generation complete.");
}
// CLI
console.log("🧭 [CLI] Initialisation du processus d’orchestration...");
const [cfg] = process.argv.slice(2);
if (!cfg) {
    console.error("❌ [CLI] Aucun fichier de configuration spécifié.\n");
    console.error("📘 Usage attendu :");
    console.error("   node orchestration_scripts/dist/orchestrator.js <path/to/app.yml>\n");
    console.error("💡 Exemple complet d’exécution :\n");
    console.error("   1️⃣  rm -rf orchestration_scripts/dist");
    console.error("   2️⃣  npx tsc orchestration_scripts/*.ts --outDir orchestration_scripts/dist --target ES2020 --module commonjs --esModuleInterop true");
    console.error("   3️⃣  node orchestration_scripts/dist/orchestrator.js app_configs/app.yml\n");
    process.exit(1);
}
console.log(`✅ [CLI] Fichier de configuration détecté : ${cfg}`);
processConfig(cfg);
