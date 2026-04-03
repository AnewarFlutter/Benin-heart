"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeMockEntityTemplate = void 0;
const generate_imports_from_attributes_recursive_1 = require("../../tasks/modules/generate_imports_from_attributes_recursive");
const casing_1 = require("../casing");
const default_values_1 = require("../functions/commons/default_values");
const file_name_1 = require("../functions/commons/file_name");
const is_enum_value_1 = require("../helpers/is_enum_value");
function isTsExpression(value) {
    return (typeof value === "string" &&
        /^[A-Za-z_]\w*(\.[A-Za-z_]\w*)+$/.test(value));
}
const MakeMockEntityTemplate = (module, feature, attrs, config) => {
    const featureName = casing_1.toCasing.pascalCase(feature.$name);
    const entityName = `Entity${featureName}`;
    const relatedImports = (0, generate_imports_from_attributes_recursive_1.generateImportsFromAttributesRecursive)(attrs, module, feature, config, "entity");
    const currentEntityImport = `import { ${entityName} } from "../entities/${(0, file_name_1.getFileName)(module.$fileNameCasing ?? "camelCase", `entity_${feature.$name}`)}";`;
    // ============================================================
    // Génère une valeur mock strictement typée recursivement
    // ============================================================
    const generateMockValueRecursive = (value, index = 0, rawWay = false) => {
        // Cas tableau
        if (Array.isArray(value)) {
            return `[${value.map(v => generateMockValueRecursive(v, index, rawWay)).join(", ")}]`;
        }
        // Cas objet
        if (value && typeof value === "object") {
            const entries = Object.entries(value).map(([k, v]) => `${k}: ${generateMockValueRecursive(v, index, rawWay)}`);
            return `{ ${entries.join(", ")} }`;
        }
        // Cas enum / expression TypeScript
        if ((isTsExpression(value) || (0, is_enum_value_1.isEnumExpression)(String(value))) && !rawWay) {
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
                return generateMockValueRecursive(attr.$mock, index, attr.$rawMocksValue);
            }
            // 👉 CAS normal (valeur simple ou objet)
            const value = Array.isArray(attr.$mock)
                ? attr.$mock[index % attr.$mock.length]
                : attr.$mock;
            return generateMockValueRecursive(value, index, attr.$rawMocksValue);
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
    // SI des mocks sont fournis dans l'entité → on les utilise directement.
    // ============================================================
    const useProvidedMocks = Array.isArray(feature.$entity?.$mocks) && feature.$entity.$mocks.length > 0;
    let mainMock = "";
    let mockList = "";
    if (useProvidedMocks) {
        // On utilise les mocks fournis directement
        //const typedMocks = feature.$entity!.$mocks!.map((m) => JSON.stringify(m, null, 2));
        const typedMocks = feature.$entity.$mocks.map((m) => jsonToTsLiteral(JSON.stringify(m)));
        // Mock unique = premier élément
        mainMock = typedMocks[0];
        // Mock list = tous
        mockList = typedMocks.join(",\n  ");
    }
    else {
        // Sinon on génère automatiquement
        const mockFields = attrs
            .map((attr, index) => {
            const comment = attr.$description ? `  // ${attr.$description}\n` : "";
            return `${comment}  ${attr.$name}: ${generateMockValue(attr, index)},`;
        })
            .join("\n");
        mainMock = `{\n${mockFields}\n}`;
        const autoList = Array.from({ length: 5 }).map((_, idx) => {
            const lines = attrs
                .map((attr) => `  ${attr.$name}: ${generateMockValue(attr, idx)},`)
                .join("\n");
            return `{\n${lines}\n}`;
        });
        mockList = autoList.join(",\n  ");
    }
    return `${currentEntityImport}
${relatedImports ? relatedImports + "\n" : ""}
/**
 * Mock réaliste pour ${entityName}
 * Généré automatiquement à partir de la configuration YAML
 */
export const Mock${featureName}: ${entityName} = ${mainMock};

/**
 * Liste de mocks (utile pour tests, pagination…)
 */
export const Mock${featureName}s: ${entityName}[] = [
  ${mockList}
];
`;
};
exports.MakeMockEntityTemplate = MakeMockEntityTemplate;
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
    if ((isTsExpression(value) || (0, is_enum_value_1.isEnumExpression)(String(value)))) {
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
