"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeMockTypeTemplate = void 0;
const generate_imports_from_type_attributes_recursive_1 = require("../../tasks/modules/generate_imports_from_type_attributes_recursive");
const casing_1 = require("../casing");
const default_values_1 = require("../functions/commons/default_values");
const file_name_1 = require("../functions/commons/file_name");
const is_enum_value_1 = require("../helpers/is_enum_value");
const MakeMockTypeTemplate = (config, module, type, feature) => {
    function isTsExpression(value) {
        return (typeof value === "string" &&
            /^[A-Za-z_]\w*(\.[A-Za-z_]\w*)+$/.test(value));
    }
    function getCurrentTypeImport() {
        const typeFileName = (0, file_name_1.getFileName)(module.$fileNameCasing ?? "camelCase", type.$name);
        const moduleDirName = (0, file_name_1.getFileName)(module.$fileNameCasing ?? "camelCase", module.$name);
        if (feature) {
            const featureDir = (0, file_name_1.getFileName)(module.$fileNameCasing ?? "camelCase", feature.$name);
            return `import { ${type.$name} } from "@/modules/${moduleDirName}/${featureDir}/domain/types/${typeFileName}"`;
        }
        return `import { ${type.$name} } from "@/modules/${moduleDirName}/types/${typeFileName}_types"`;
    }
    const relatedImports = (0, generate_imports_from_type_attributes_recursive_1.generateImportsFromTypeAttributesRecursive)(type.$attributes, config, module, feature);
    const currentTypeImport = getCurrentTypeImport();
    // ============================================================
    // Génère une valeur mock strictement typée recursivement
    // ============================================================
    const generateMockValueRecursive = (value, index = 0) => {
        // Cas tableau
        if (Array.isArray(value)) {
            return `[${value.map(v => generateMockValueRecursive(v, index)).join(", ")}]`;
        }
        // Cas objet
        if (value && typeof value === "object") {
            const entries = Object.entries(value).map(([k, v]) => `${k}: ${generateMockValueRecursive(v, index)}`);
            return `{ ${entries.join(", ")} }`;
        }
        // Cas enum / expression TypeScript
        if (isTsExpression(value) || (0, is_enum_value_1.isEnumExpression)(String(value))) {
            return value;
        }
        // Cas simple
        if (typeof value === "string")
            return `"${value}"`;
        if (typeof value === "number" || typeof value === "boolean")
            return `${value}`;
        if (value === undefined || value === null)
            return "undefined";
        // fallback
        return JSON.stringify(value);
    };
    // ============================================================
    // Génère une valeur mock strictement typée
    // ============================================================
    const generateMockValue = (attr, index = 0) => {
        let value;
        // 1️⃣ Cas mock ou default
        if (attr.$mock !== undefined) {
            // 👉 CAS LISTE : on renvoie toute la liste telle quelle
            if (Array.isArray(attr.$mock) && attr.$type.endsWith("[]")) {
                return generateMockValueRecursive(attr.$mock, index);
            }
            // 👉 CAS normal (valeur simple ou objet)
            const value = Array.isArray(attr.$mock)
                ? attr.$mock[index % attr.$mock.length]
                : attr.$mock;
            return generateMockValueRecursive(value, index);
        }
        else if (attr.$default !== undefined) {
            value = attr.$default;
        }
        else {
            // 2️⃣ Cas par type
            switch (attr.$type) {
                case "string":
                    if (attr.$name.toLowerCase().includes("id"))
                        value = crypto.randomUUID();
                    else if (attr.$name.toLowerCase().includes("email"))
                        value = "john.doe@example.com";
                    else if (attr.$name.toLowerCase().includes("password"))
                        value = "p@xw0rD123";
                    else if (attr.$name.toLowerCase().endsWith("_at") || attr.$name.toLowerCase().endsWith("At")) {
                        value = "2025-06-15T10:00:00.000Z";
                    }
                    else if (attr.$name.toLowerCase().includes("color") || attr.$name.toLowerCase().includes("couleur")) {
                        value = randomHexColor();
                    }
                    else if (attr.$name.toLocaleLowerCase().includes("description"))
                        value = default_values_1.MediumLoremValue;
                    else
                        value = `${casing_1.toCasing.pascalCase(attr.$name)} Mock`;
                    break;
                case "number":
                    value = attr.$name.toLowerCase().includes("prix") ? 95 : 42;
                    break;
                case "boolean":
                    value = Math.random() < 0.5;
                    break;
                default:
                    // Détection des types custom
                    if (attr.$type.includes("Date"))
                        value = "2025-06-15T10:00:00.000Z";
                    else if (attr.$type.endsWith("[]"))
                        value = []; // tableau
                    else if (attr.$type.startsWith("{"))
                        value = {}; // objet générique
                    else
                        value = undefined; // reste typé via TS
            }
        }
        // 3️⃣ Si c'est une expression TypeScript (enum…), on renvoie tel quel
        if (isTsExpression(value)) {
            return value;
        }
        // 4️⃣ Sinon, JSON → literal TS
        if (value === undefined)
            return `undefined`;
        return jsonToTsLiteral(JSON.stringify(value));
    };
    // ============================================================
    // SI des mocks sont fournis dans le type → on les utilise directement.
    // ============================================================
    const useProvidedMocks = Array.isArray(type?.$mocks) && type.$mocks.length > 0;
    let mainMock = "";
    let mockList = "";
    if (useProvidedMocks) {
        // On utilise les mocks fournis directement
        //const typedMocks = feature.$entity!.$mocks!.map((m) => JSON.stringify(m, null, 2));
        const typedMocks = type.$mocks.map((m) => jsonToTsLiteral(JSON.stringify(m)));
        // Mock unique = premier élément
        mainMock = typedMocks[0];
        // Mock list = tous
        mockList = typedMocks.join(",\n  ");
    }
    else {
        // Sinon on génère automatiquement
        const mockFields = type.$attributes
            .map((attr, index) => {
            const comment = attr.$description ? `  // ${attr.$description}\n` : "";
            return `${comment}  ${attr.$name}: ${generateMockValue(attr, index)},`;
        })
            .join("\n");
        mainMock = `{\n${mockFields}\n}`;
        const autoList = Array.from({ length: 5 }).map((_, idx) => {
            const lines = type.$attributes
                .map((attr) => `  ${attr.$name}: ${generateMockValue(attr, idx)},`)
                .join("\n");
            return `{\n${lines}\n}`;
        });
        mockList = autoList.join(",\n  ");
    }
    return `${currentTypeImport}
${relatedImports ? relatedImports + "\n" : ""}
/**
 * Mock réaliste pour ${type.$name}
 * Généré automatiquement à partir de la configuration YAML
 */
export const Mock${type.$name}: ${type.$name} = ${mainMock};

/**
 * Liste de mocks (utile pour tests, pagination…)
 */
export const Mock${type.$name}s: ${type.$name}[] = [
  ${mockList}
];
`;
};
exports.MakeMockTypeTemplate = MakeMockTypeTemplate;
/**
 * Convert JSON.stringify output into a valid TypeScript object literal
 * with unquoted keys. Handles nesting, arrays, primitives.
 */
function jsonToTsLiteral(json, indent = 2) {
    const parsed = JSON.parse(json);
    return formatValue(parsed, 0, indent);
}
function formatValue(value, level = 0, indent = 2) {
    const spacing = (n) => " ".repeat(n * indent);
    if (Array.isArray(value)) {
        if (value.length === 0)
            return "[]";
        return `[\n${value.map(v => spacing(level + 1) + formatValue(v, level + 1, indent)).join(",\n")}\n${spacing(level)}]`;
    }
    if (value !== null && typeof value === "object") {
        const entries = Object.entries(value);
        if (entries.length === 0)
            return "{}";
        return `{\n${entries
            .map(([key, val]) => `${spacing(level + 1)}${safeKey(key)}: ${formatValue(val, level + 1, indent)}`)
            .join(",\n")}\n${spacing(level)}}`;
    }
    // Cas enum / expression TypeScript
    if (((0, is_enum_value_1.isEnumExpression)(String(value)))) {
        return value;
    }
    return JSON.stringify(value);
}
function safeKey(key) {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}
function randomHexColor() {
    return "#" + Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");
}
