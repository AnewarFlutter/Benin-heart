// orchestration_scripts/orchestrator.ts
import fs from "fs";
import path from "path";
import { glob } from "glob";
import { parse as load } from "yaml";
import { validateConfig } from "./config_validator.js";
import { generateScaffold } from "./generate_module_scaffold.js";


export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonArray = JsonValue[];
export interface JsonObject {
    [key: string]: JsonValue;
}

/** Merge déterministe : objets merge récursif, tableaux remplacés (pas concaténés), primitives remplacées */
function mergeValues<T extends JsonValue, U extends JsonValue>(target: T, source: U): JsonValue {
    // si source est tableau => on remplace (préviens concat de params)
    if (Array.isArray(source)) {
        return source as JsonArray;
    }

    // si target et source sont objets => merge clé-par-clé
    if (
        typeof target === "object" &&
        target !== null &&
        !Array.isArray(target) &&
        typeof source === "object" &&
        source !== null &&
        !Array.isArray(source)
    ) {
        const result: JsonObject = { ...target };

        for (const key of Object.keys(source)) {
            const tVal = result[key] as JsonValue | undefined;
            const sVal = (source as JsonObject)[key];

            if (tVal === undefined) {
                result[key] = sVal;
            } else {
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
function processNode(node: JsonValue, baseDir: string, parentKey?: string): JsonValue {
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
        return (node as JsonArray).map(item => processNode(item, baseDir, parentKey)) as JsonArray;
    }

    // Objects
    const obj = { ...(node as JsonObject) } as JsonObject;

    // Si il y a include
    if (Object.prototype.hasOwnProperty.call(obj, "$include")) {
        const includeValue = obj["$include"];
        delete obj["$include"];

        const patterns = Array.isArray(includeValue) ? includeValue : [includeValue];

        // charger toutes les inclusions successives et stocker leur contenu
        const loadedItems: JsonValue[] = [];
        for (const p of patterns) {
            if (typeof p !== "string") throw new Error("$include must be a string or array of strings");
            const resolvedPattern = path.resolve(baseDir, p);
            const files = glob.sync(resolvedPattern);

            for (const file of files) {
                const loaded = loadWithIncludes<JsonValue>(file);
                loadedItems.push(loaded);
            }
        }

        // Si l'objet initial ne contenait **que** `$include`, on retourne la valeur incluse :
        // - si plusieurs fichiers et au moins un tableau → concat des tableaux
        // - si plusieurs objets → on merge key-by-key entre eux (donc on recompose un object)
        if (Object.keys(obj).length === 0) {
            const results = loadedItems.map(item => processNode(item, baseDir, parentKey));

            // Cas spécifique : usecases -> conserver tableau
            if (parentKey === "usecases") return results.flat();

            // Cas général : fusionner objets
            if (results.every(r => typeof r === "object" && !Array.isArray(r))) {
                let accum: JsonObject = {};
                for (const r of results as JsonObject[]) {
                    accum = mergeValues(accum, r) as JsonObject;
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
                    const sVal = (it as JsonObject)[k];
                    if (!obj.hasOwnProperty(k)) {
                        obj[k] = sVal;
                    } else {
                        obj[k] = mergeValues(obj[k] as JsonValue, sVal as JsonValue);
                    }
                }
            } else {
                // si l'inclusion est un tableau/primitive et qu'on a d'autres clés -> on stocke sous mergedInclude
                obj["mergedInclude"] = it;
            }
        }
    }

    // Recurse into children
    const finalObj: JsonObject = {};
    for (const key of Object.keys(obj)) {
        finalObj[key] = processNode(obj[key] as JsonValue, baseDir, key);
    }

    return finalObj;
}


/**
 * Load YAML and process nested includes.
 * Includes are merged into the place where they appear.
 */
export function loadWithIncludes<T extends JsonValue>(filePath: string): T {
    const absolute = path.resolve(filePath);
    const rawContent = fs.readFileSync(absolute, "utf8");

    const parsed = load(rawContent);

    if (typeof parsed !== "object" || parsed === null) {
        throw new Error(`YAML root must be an object: ${filePath}`);
    }

    const processed = processNode(parsed as JsonValue, path.dirname(absolute));

    return processed as T;
}


function processConfig(configPath: string) {
    const absolutePath = path.resolve(configPath);

    if (!fs.existsSync(absolutePath)) {
        console.error(`❌ Config not found: ${absolutePath}`);
        process.exit(1);
    }

    console.log(`📄 Loading config with includes: ${absolutePath}`);

    // 🔥🔥🔥 ICI : on charge AVEC includes, pas avec YAML brut
    const raw = loadWithIncludes<JsonObject>(absolutePath);

    console.log(`📦 Config fully expanded (after includes)`);

    const config = validateConfig(raw);
    console.log(`✅ Config validated`);

    generateScaffold(config);
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