import { ModuleSchema, FeatureSchema, AttributeSchema, ModulesConfigSchema } from "../../config_validator";
import { generateImportsFromAttributesRecursive } from "../../tasks/modules/generate_imports_from_attributes_recursive";
import { toCasing } from "../casing";
import { MediumLoremValue } from "../functions/commons/default_values";
import { getFileName } from "../functions/commons/file_name";
import { isEnumExpression } from "../helpers/is_enum_value";

function isTsExpression(value: unknown): boolean {
    return (
        typeof value === "string" &&
        /^[A-Za-z_]\w*(\.[A-Za-z_]\w*)+$/.test(value)
    );
}

export const MakeMockEntityTemplate = (
    module: ModuleSchema,
    feature: FeatureSchema,
    attrs: AttributeSchema[],
    config: ModulesConfigSchema
) => {
    const featureName = toCasing.pascalCase(feature.$name);
    const entityName = `Entity${featureName}`;

    const relatedImports = generateImportsFromAttributesRecursive(attrs, module, feature, config, "entity");
    const currentEntityImport = `import { ${entityName} } from "../entities/${getFileName(module.$fileNameCasing ?? "camelCase", `entity_${feature.$name}`)}";`

    // ============================================================
    // Génère une valeur mock strictement typée recursivement
    // ============================================================
    const generateMockValueRecursive = (value: unknown, index = 0, rawWay: boolean = false): string => {
        // Cas tableau
        if (Array.isArray(value)) {
            return `[${value.map(v => generateMockValueRecursive(v, index, rawWay)).join(", ")}]`;
        }

        // Cas objet
        if (value && typeof value === "object") {
            const entries = Object.entries(value).map(
                ([k, v]) => `${k}: ${generateMockValueRecursive(v, index, rawWay)}`
            );
            return `{ ${entries.join(", ")} }`;
        }

        // Cas enum / expression TypeScript
        if ((isTsExpression(value) || isEnumExpression(String(value))) && !rawWay) {
            return value as string;
        }

        // Cas simple
        if (typeof value === "string") return `"${value}"`;
        if (typeof value === "number" || typeof value === "boolean") return `${value}`;
        if (value === undefined || value === null) return "undefined";

        // fallback
        return JSON.stringify(value);
    };      


    // ============================================================
    // Génère une valeur mock strictement typée
    // ============================================================
    const generateMockValue = (attr: AttributeSchema, index = 0): string => {
        let value: unknown;

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
        } else if (attr.$default !== undefined) {
            value = attr.$default;
        } else {
            // 2️⃣ Cas par type
            switch (attr.$type) {
                case "string":
                    if (attr.$name.toLowerCase().includes("id")) value = crypto.randomUUID();
                    else if (attr.$name.toLowerCase().includes("email")) value = "john.doe@example.com";
                    else if (attr.$name.toLowerCase().includes("password")) value = "p@xw0rD123";
                    else if (attr.$name.toLowerCase().endsWith("_at") || attr.$name.toLowerCase().endsWith("At")) {
                        value = "2025-06-15T10:00:00.000Z";
                    }
                    else if (attr.$name.toLowerCase().includes("color") || attr.$name.toLowerCase().includes("couleur")) {
                        value = randomHexColor();
                    }
                    else if (attr.$name.toLocaleLowerCase().includes("description")) value = MediumLoremValue
                    else value = `${toCasing.pascalCase(attr.$name)} Mock`;
                    break;

                case "number":
                    value = attr.$name.toLowerCase().includes("prix") ? 95 : 42;
                    break;

                case "boolean":
                    value = Math.random() < 0.5;
                    break;

                default:
                    // Détection des types custom
                    if (attr.$type.includes("Date")) value = "2025-06-15T10:00:00.000Z";
                    else if (attr.$type.endsWith("[]")) value = []; // tableau
                    else if (attr.$type.startsWith("{")) value = {}; // objet générique

                    else value = undefined; // reste typé via TS
            }
        }

        // 3️⃣ Si c'est une expression TypeScript (enum…), on renvoie tel quel
        if (isTsExpression(value)) {
            return value as string;
        }

        // 4️⃣ Sinon, JSON → literal TS
        if (value === undefined) return `undefined`;
        return jsonToTsLiteral(JSON.stringify(value));
    };

    // ============================================================
    // SI des mocks sont fournis dans l'entité → on les utilise directement.
    // ============================================================
    const useProvidedMocks = Array.isArray(feature.$entity?.$mocks) && feature.$entity!.$mocks!.length > 0;

    let mainMock = "";
    let mockList = "";

    if (useProvidedMocks) {
        // On utilise les mocks fournis directement
        //const typedMocks = feature.$entity!.$mocks!.map((m) => JSON.stringify(m, null, 2));
        const typedMocks = feature.$entity!.$mocks!.map((m) =>
            jsonToTsLiteral(JSON.stringify(m))
        );

        // Mock unique = premier élément
        mainMock = typedMocks[0];

        // Mock list = tous
        mockList = typedMocks.join(",\n  ");
    } else {
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


/**
 * Convert JSON.stringify output into a valid TypeScript object literal
 * with unquoted keys. Handles nesting, arrays, primitives.
 */
function jsonToTsLiteral(json: string, indent = 2): string {
    const parsed = JSON.parse(json);
    return formatValue(parsed, 0, indent);
}

function formatValue(value: unknown, level = 0, indent = 2): string {
    const spacing = (n: number) => " ".repeat(n * indent);

    if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        return `[\n${value.map(v => spacing(level + 1) + formatValue(v, level + 1, indent)).join(",\n")}\n${spacing(level)}]`;
    }

    if (value !== null && typeof value === "object") {
        const entries = Object.entries(value);
        if (entries.length === 0) return "{}";

        return `{\n${entries
            .map(([key, val]) => `${spacing(level + 1)}${safeKey(key)}: ${formatValue(val, level + 1, indent)}`)
            .join(",\n")}\n${spacing(level)}}`;
    }

    // Cas enum / expression TypeScript
    if ((isTsExpression(value) || isEnumExpression(String(value)))) {
        return value as string;
    }

    return JSON.stringify(value);
}

function safeKey(key: string): string {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function randomHexColor(): string {
    return "#" + Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");
}
