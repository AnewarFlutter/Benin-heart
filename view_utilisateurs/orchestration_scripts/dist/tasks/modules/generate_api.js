"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApi = generateApi;
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
const map_primitive_to_ts_1 = require("../../utils/helpers/map_primitive_to_ts");
function generateApi(apiConfig, project) {
    if (apiConfig.$skip)
        return;
    const tsProject = project ?? new ts_morph_1.Project({ tsConfigFilePath: "tsconfig.json" });
    const root = path_1.default.join(process.cwd(), "src");
    const typesDir = path_1.default.join(root, "shared", "constants", "types");
    const formatSchemaToTs = (schema, indent = "  ") => {
        const lines = [];
        for (const [key, field] of Object.entries(schema)) {
            const opt = field.$optional ? "?" : "";
            if (field.$type === "object") {
                if (field.$schema && Object.keys(field.$schema).length) {
                    lines.push(`${indent}${key}${opt}: {\n${formatSchemaToTs(field.$schema, indent + "  ")}\n${indent}};`);
                }
                else if (field.$valueType && field.$valueType.$schema && Object.keys(field.$valueType.$schema).length) {
                    lines.push(`${indent}${key}${opt}: {\n${formatSchemaToTs(field.$valueType.$schema, indent + "  ")}\n${indent}};`);
                }
                //else if (field.$valueType?.$items && field.$valueType.$items.$schema && Object.keys(field.$valueType.$items.$schema).length) {
                //lines.push(`${indent}${key}${opt}: ${mapPrimitiveToTs(field.$valueType.$items.$type, field.$valueType?.$items.$valueType?.$type, field.$keyType?.$type)};`);
                // lines.push(`${indent}${key}${opt}: ${mapPrimitiveToTs(field.$valueType.$items.$type, field.$valueType?.$items.$valueType?.$type, field.$keyType?.$type)};`);
                //} 
                else if (field.$keyType &&
                    field.$valueType?.$type === "array" &&
                    field.$valueType.$items?.$schema) {
                    lines.push(`${indent}${key}${opt}: { [key: ${field.$keyType.$type}]: {\n` +
                        `${formatSchemaToTs(field.$valueType.$items.$schema, indent + "  ")}\n` +
                        `${indent}}[] };`);
                }
                else if (field.$keyType &&
                    field.$valueType?.$list === true &&
                    field.$valueType.$items?.$type) {
                    lines.push(`${indent}${key}${opt}: { [key: ${field.$keyType.$type}]: ${(0, map_primitive_to_ts_1.mapPrimitiveToTs)(field.$valueType.$items.$type)}[] };`);
                }
                else if (field.$keyType) {
                    lines.push(`${indent}${key}${opt}: ${(0, map_primitive_to_ts_1.mapPrimitiveToTs)(field.$type, field.$valueType?.$type, field.$keyType.$type)};`);
                }
                else {
                    lines.push(`${indent}${key}${opt}: { [key: string ]: ${field.$valueType?.$type ?? "unknown"} };`);
                }
            }
            else if (field.$type === "array") {
                if (field.$items?.$schema) {
                    lines.push(`${indent}${key}${opt}: {\n${formatSchemaToTs(field.$items.$schema, indent + "  ")}\n${indent}}[];`);
                }
                else if (field.$items?.$type) {
                    lines.push(`${indent}${key}${opt}: ${(0, map_primitive_to_ts_1.mapPrimitiveToTs)(field.$items.$type)}[];`);
                }
                else {
                    lines.push(`${indent}${key}${opt}: unknown[];`);
                }
            }
            else {
                lines.push(`${indent}${key}${opt}: ${(0, map_primitive_to_ts_1.mapPrimitiveToTs)(field.$type)};`);
            }
        }
        return lines.join("\n");
    };
    // On garantit que endpoints existe
    const endpoints = apiConfig.$endpoints ?? {};
    Object.entries(endpoints).forEach(([groupName, group]) => {
        if (!group)
            return;
        // Si le groupe est en skip, on ne touche pas aux fichiers existants
        if (group.$skip)
            return;
        // Sinon, on génère normalement
        const groupKey = groupName.toUpperCase();
        const groupFileName = `${groupName.toLowerCase()}.ts`;
        const groupRoutesPath = path_1.default.join(root, "shared", "constants", "routes", groupFileName);
        const groupRoutesFile = tsProject.getSourceFile(groupRoutesPath) ?? tsProject.createSourceFile(groupRoutesPath, "", { overwrite: false });
        const groupTypesPath = path_1.default.join(typesDir, groupFileName);
        const groupTypesFile = tsProject.getSourceFile(groupTypesPath) ?? tsProject.createSourceFile(groupTypesPath, "", { overwrite: false });
        const routeLines = [];
        const generatedTypeNames = new Set();
        Object.entries(group.$routes ?? {}).forEach(([key, route]) => {
            if (!route)
                return;
            const routeKey = `${groupKey}_${key}`;
            // Si la route est skip, on ne touche à rien
            if (route.$skip)
                return;
            // Supprimer uniquement les interfaces/types de cette route
            groupTypesFile.getInterfaces()
                .filter(i => i.getName() === `${routeKey}_PARAMS` ||
                i.getName().startsWith(`${routeKey}_RESPONSE_`))
                .forEach(i => i.remove());
            groupTypesFile.getTypeAliases()
                .filter(t => t.getName() === `${routeKey}_PARAMS` ||
                t.getName().startsWith(`${routeKey}_RESPONSE_`))
                .forEach(t => t.remove());
            // PARAMS
            if (route.$params) {
                const body = route.$params.$body ? formatSchemaToTs(route.$params.$body, "    ") : null;
                const query = route.$params.$query ? formatSchemaToTs(route.$params.$query, "    ") : null;
                const pathParams = route.$params.$path ? formatSchemaToTs(route.$params.$path, "    ") : null;
                const paramsInterface = `
export interface ${routeKey}_PARAMS {
${body ? `  body: {\n${body}\n  };` : ""}
${query ? `  query: {\n${query}\n  };` : ""}
${pathParams ? `  path: {\n${pathParams}\n  };` : ""}
}`.trim();
                groupTypesFile.addStatements(paramsInterface);
                generatedTypeNames.add(`${routeKey}_PARAMS`);
            }
            // RESPONSE 200
            const response200 = `${routeKey}_RESPONSE_200`;
            if (route.$response?.$default?.$schema) {
                const body200 = formatSchemaToTs(route.$response.$default.$schema, "  ");
                groupTypesFile.addStatements(`
export interface ${response200} {
  ${body200}
}`.trim());
                generatedTypeNames.add(response200);
            }
            // RESPONSES BY STATUS
            if (route.$response?.$byStatus) {
                Object.entries(route.$response.$byStatus).forEach(([status, resp]) => {
                    if (!resp.$schema)
                        return;
                    const typeName = `${routeKey}_RESPONSE_${status}`;
                    const body = formatSchemaToTs(resp.$schema, "  ");
                    groupTypesFile.addStatements(`
export interface ${typeName} {
  ${body}
}`.trim());
                    generatedTypeNames.add(typeName);
                });
            }
            console.warn("Generating types for route:", routeKey, generatedTypeNames.size);
            // Construction de la route
            const lines = [
                `path: \`\${APP_CONFIG.API.baseUrl}${route.$path}\`,`,
                `method: "${(route.$method || "GET").toUpperCase()}" as const,`,
                `auth: ${route.$auth !== false},`,
                route.$params ? `params: {} as ${routeKey}_PARAMS,` : "",
                `response: {} as ${response200},`,
                route.$response?.$byStatus
                    ? `responses: { ${Object.keys(route.$response.$byStatus)
                        .map(s => `${s}: {} as ${routeKey}_RESPONSE_${s}`)
                        .join(", ")} },`
                    : ""
            ].filter(Boolean);
            const comment = route.$description ? `  // ${route.$description}\n` : "";
            routeLines.push(`${comment}  ${key}: {\n    ${lines.join("\n    ")}\n  }`);
        });
        // Mise à jour du groupe de routes
        // Récupérer l'objet existant ou le créer
        let groupObj = groupRoutesFile.getVariableDeclaration(groupKey)?.getInitializerIfKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
        if (!groupObj) {
            groupRoutesFile.addVariableStatement({
                declarationKind: ts_morph_1.VariableDeclarationKind.Const,
                isExported: true,
                declarations: [{ name: groupKey, initializer: "{}" }]
            });
            groupObj = groupRoutesFile.getVariableDeclaration(groupKey).getInitializerIfKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
        }
        // Mettre à jour ou ajouter uniquement les routes non-skip
        Object.entries(group.$routes ?? {}).forEach(([key, route]) => {
            if (!route || route.$skip)
                return; // skip = on laisse l'existant tel quel
            const routeKey = `${groupKey}_${key}`;
            const lines = [
                `path: \`\${APP_CONFIG.API.baseUrl}${route.$path}\`,`,
                `method: "${(route.$method || "GET").toUpperCase()}" as const,`,
                `auth: ${route.$auth !== false},`,
                route.$params ? `params: {} as ${routeKey}_PARAMS,` : "",
                `response: {} as ${routeKey}_RESPONSE_200,`,
                route.$response?.$byStatus
                    ? `responses: { ${Object.keys(route.$response.$byStatus)
                        .map(s => `${s}: {} as ${routeKey}_RESPONSE_${s}`)
                        .join(", ")} },`
                    : ""
            ].filter(Boolean);
            const existingProp = groupObj.getProperty(key);
            if (existingProp && existingProp.getKind() === ts_morph_1.SyntaxKind.PropertyAssignment) {
                existingProp.asKindOrThrow(ts_morph_1.SyntaxKind.PropertyAssignment).setInitializer(`{\n    ${lines.join("\n    ")}\n}`);
            }
            else {
                groupObj.addPropertyAssignment({ name: key, initializer: `{\n    ${lines.join("\n    ")}\n}` });
            }
        });
        // Import APP_CONFIG
        const hasAppConfig = groupRoutesFile.getImportDeclarations().some(i => i.getModuleSpecifierValue().includes("app_config") &&
            i.getNamedImports().some(n => n.getName() === "APP_CONFIG"));
        if (!hasAppConfig) {
            groupRoutesFile.getImportDeclarations()
                .filter(i => i.getModuleSpecifierValue().includes("app_config"))
                .forEach(i => i.remove());
            groupRoutesFile.insertStatements(0, `import { APP_CONFIG } from "../app_config";\n`);
        }
        // Import des types générés
        const importPath = `../types/${groupName.toLowerCase()}`;
        const existingImport = groupRoutesFile.getImportDeclaration(d => d.getModuleSpecifierValue() === importPath);
        // Import des types générés uniquement si on a de nouvelles interfaces pour cette génération
        if (generatedTypeNames.size > 0) {
            if (existingImport) {
                // Ajouter seulement les noms manquants
                const existingNames = new Set(existingImport.getNamedImports().map(n => n.getName()));
                generatedTypeNames.forEach(name => {
                    if (!existingNames.has(name))
                        existingImport.addNamedImport(name);
                });
            }
            else {
                groupRoutesFile.addImportDeclaration({
                    moduleSpecifier: importPath,
                    namedImports: Array.from(generatedTypeNames)
                });
            }
        }
        // NE RIEN FAIRE si generatedTypeNames.size === 0 pour ne pas supprimer les imports existants
        groupRoutesFile.formatText({ indentSize: 2 });
        groupRoutesFile.saveSync();
        groupTypesFile.formatText({ indentSize: 2 });
        groupTypesFile.saveSync();
    });
    // Mise à jour API_ROUTES
    const apiRoutesPath = path_1.default.join(root, "shared", "constants", "api_routes.ts");
    const apiRoutesFile = tsProject.getSourceFile(apiRoutesPath) ?? tsProject.createSourceFile(apiRoutesPath, "", { overwrite: true });
    let apiRoutesVar = apiRoutesFile.getVariableDeclaration("API_ROUTES");
    if (!apiRoutesVar) {
        apiRoutesFile.addVariableStatement({
            declarationKind: ts_morph_1.VariableDeclarationKind.Const,
            isExported: true,
            declarations: [{ name: "API_ROUTES", initializer: "{}" }]
        });
        apiRoutesVar = apiRoutesFile.getVariableDeclaration("API_ROUTES");
    }
    const obj = apiRoutesVar.getInitializerIfKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
    if (!obj)
        return;
    Object.keys(endpoints).forEach(groupName => {
        const key = groupName.toUpperCase();
        const prop = obj.getProperty(key);
        if (prop?.getKind() === ts_morph_1.SyntaxKind.PropertyAssignment) {
            prop.asKindOrThrow(ts_morph_1.SyntaxKind.PropertyAssignment).setInitializer(key);
        }
        else {
            obj.addPropertyAssignment({ name: key, initializer: key });
        }
        const importPath = `./routes/${groupName.toLowerCase()}`;
        if (!apiRoutesFile.getImportDeclarations().some(i => i.getModuleSpecifierValue() === importPath)) {
            apiRoutesFile.addImportDeclaration({
                moduleSpecifier: importPath,
                namedImports: [key]
            });
        }
    });
    apiRoutesFile.formatText({ indentSize: 2 });
    apiRoutesFile.saveSync();
    // Mise à jour du barrel api_types.ts (incrémental & sûr)
    const apiTypesBarrelPath = path_1.default.join(root, "shared", "constants", "api_types.ts");
    const apiTypesBarrelFile = tsProject.getSourceFile(apiTypesBarrelPath) ?? tsProject.createSourceFile(apiTypesBarrelPath, "", { overwrite: false });
    const activeGroups = Object.keys(endpoints)
        .filter(name => endpoints[name] && !endpoints[name].$skip)
        .map(name => name.toLowerCase());
    const existingExports = new Set();
    apiTypesBarrelFile.getExportDeclarations().forEach(exp => {
        const moduleSpecifier = exp.getModuleSpecifierValue();
        if (moduleSpecifier?.startsWith("./types/")) {
            existingExports.add(moduleSpecifier);
        }
    });
    // Ajouter uniquement les nouveaux exports pour les groupes non-skip
    activeGroups.forEach(groupName => {
        const modulePath = `./types/${groupName}`;
        if (!existingExports.has(modulePath)) {
            apiTypesBarrelFile.addStatements(`export * from "${modulePath}";`);
        }
    });
    apiTypesBarrelFile.formatText({ indentSize: 2 });
    apiTypesBarrelFile.saveSync();
}
