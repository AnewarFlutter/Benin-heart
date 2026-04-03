"use strict";
// ──────────────────────────────────────────────────────────────────────────────
//  NOUVELLE FONCTION : Génère le code de mapping de réponse (200)
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResponseMappingCode = buildResponseMappingCode;
const casing_1 = require("../../casing");
const file_name_1 = require("../commons/file_name");
// ──────────────────────────────────────────────────────────────────────────────
/**
 * Génère le code de mapping de réponse (200) pour une usecase donnée.
 *
 * @param usecase La usecase pour laquelle on souhaite générer le code de mapping.
 * @param feature La feature associée à la usecase.
 * @param route La route API associée à la usecase.
 * @param config La configuration globale de l'app.
 * @param endpointKey La clé de l'endpoint (ex: "users.GET").
 * @returns Un objet contenant le code de mapping de la réponse, les imports nécessaires et le type de données attendu.
 */
function buildResponseMappingCode(usecase, feature, route, config, endpointKey) {
    const returnType = usecase.$returnType;
    if (!returnType)
        return { returnCode: "data as unknown;", imports: [], dataType: "Record<string, unknown>" };
    const isLocalEntity = returnType.$type === `Entity${casing_1.toCasing.pascalCase(feature.$name)}`;
    const isList = returnType.$list === true;
    const isNullable = returnType.$nullable === true;
    const modelName = `Model${casing_1.toCasing.pascalCase(feature.$name)}`;
    const casing = config.$modules.find(m => m.$features.includes(feature))?.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, feature.$name);
    const imports = [];
    let returnCode = "data;";
    let dataType = "Record<string, unknown>";
    // === 1. Typage local : on récupère le type 200 pour le cast local ===
    const [group, routeName] = endpointKey.split(".");
    const response200Type = `${group.toUpperCase()}_${routeName.toUpperCase()}_RESPONSE_200`;
    dataType = response200Type;
    imports.push(`import { ${response200Type} } from "@/shared/constants/api_types";`);
    // === 2. Mapping métier : seulement si entité locale ===
    if (isLocalEntity) {
        const modelImport = `../models/${(0, file_name_1.getFileName)(casing, `model_${featureFile}`)}`;
        imports.push(`import { ${modelName} } from "${modelImport}";`);
        const responseSchema = route.$response?.$default?.$schema;
        let source = "typedData"; // on utilisera `typedData = data as ${response200Type}`
        // On cherche le champ array ou object dans le schema
        if (responseSchema && typeof responseSchema === "object") {
            const arrayField = Object.entries(responseSchema).find(([, v]) => typeof v === "object" && v.$type === "array")?.[0];
            const objectField = Object.entries(responseSchema).find(([, v]) => typeof v === "object" && v.$type === "object")?.[0];
            if (isList && arrayField) {
                source = `typedData.${arrayField}`;
            }
            else if (!isList && objectField) {
                source = `typedData.${objectField}`;
            }
        }
        // === CAST EN Record<string, unknown> avant fromJson ===
        if (isList) {
            returnCode = `${modelName}.fromJsonList(
                Array.isArray(${source}) 
                    ? (${source} as Record<string, unknown>[]) 
                    : []
            );`;
        }
        else {
            returnCode = `${source} 
                ? ${modelName}.fromJson(${source} as unknown as Record<string, unknown>) 
                : ${isNullable ? "null" : "undefined"};`;
        }
    }
    else {
        // === Type non local (ex: string, boolean, autre entité) ===
        returnCode = `typedData as unknown as ${returnType.$type}${isList ? "[]" : ""}${isNullable ? " | null" : ""};`;
    }
    return { returnCode, imports, dataType };
}
