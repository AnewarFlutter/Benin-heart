"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrUpdateDataSourceImplementation = generateOrUpdateDataSourceImplementation;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
const casing_1 = require("../../utils/casing");
const extract_named_imports_1 = require("../../utils/helpers/extract_named_imports");
const is_api_implementation_1 = require("../../utils/helpers/is_api_implementation");
const templates_base_1 = require("../../utils/templates/templates_base");
const build_response_mapping_code_1 = require("../../utils/functions/api/build_response_mapping_code");
const collect_ds_impl_imports_1 = require("../../utils/functions/module/imports/collect_ds_impl_imports");
const find_api_route_1 = require("../../utils/helpers/find_api_route");
const generate_signatures_1 = require("./generate_signatures");
const map_params_1 = require("../../utils/functions/commons/map_params");
const file_name_1 = require("../../utils/functions/commons/file_name");
const build_api_request_code_1 = require("../api/build_api_request_code");
const build_error_handling_code_1 = require("../api/build_error_handling_code");
const ensure_api_error_imports_1 = require("../api/ensure_api_error_imports");
function generateOrUpdateDataSourceImplementation(module, f, config, project, api) {
    console.log("DataSource Impl] Génération ou mise à jour...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featurePath = path_1.default.join(root, "modules", module.$name, featureFile);
    const dsImplPath = path_1.default.join(featurePath, "data", "datasources", `${(0, file_name_1.getFileName)(casing, `rest_api_${featureFile}_data_source_impl`)}.ts`);
    const dsImplExists = fs_1.default.existsSync(dsImplPath);
    const shouldRewriteDsImpl = f.$override || f.$rewriteInDataSourceImpl;
    if (shouldRewriteDsImpl) {
        console.log("Réécriture complète du DataSource Impl...");
        fs_1.default.writeFileSync(dsImplPath, templates_base_1.T.restDsImpl(module, f, config));
        console.log(`Implémentation REST du datasource ${f.$name} créée`);
        return;
    }
    if (!dsImplExists) {
        console.log("Création de l'implémentation REST du datasource introuvable, création...");
        fs_1.default.writeFileSync(dsImplPath, templates_base_1.T.restDsImpl(module, f, config));
        console.log(`Création de l'implémentation REST du datasource ${f.$name} création`);
    }
    console.log("Mise à jour sélective du DataSource Impl...");
    const tsProject = project ?? new ts_morph_1.Project({
        tsConfigFilePath: "tsconfig.json",
        skipFileDependencyResolution: true,
    });
    const sourceFile = tsProject.addSourceFileAtPath(dsImplPath);
    const className = `RestApi${casing_1.toCasing.pascalCase(f.$name)}DataSourceImpl`;
    const dsClass = sourceFile.getClass(className);
    if (!dsClass) {
        console.warn(`Classe ${className} introuvable, réécriture complète...`);
        fs_1.default.writeFileSync(dsImplPath, templates_base_1.T.restDsImpl(module, f, config));
        console.log(`Implémentation d'usine REST du datasource ${f.$name} créée`);
        return;
    }
    // --- Ajout des imports API (uniquement si au moins une méthode utilise l'API) ---
    const hasApiUsecase = (f.$usecases ?? []).some(uc => uc.$implementationInDataSource && (0, is_api_implementation_1.isApiImplementation)(uc.$implementationInDataSource));
    if (hasApiUsecase) {
        // --- Imports nécessaires pour l'API ---
        const standardImports = [
            `import { API_ROUTES } from "@/shared/constants/api_routes";`,
            `import { apiClient } from "@/lib/api/api_client";`,
            `import { formatApiRoute } from "@/lib/api/format_api_route";`,
        ];
        standardImports.forEach(imp => {
            const match = imp.match(/from "(.*)"/);
            if (!match)
                return;
            const modulePath = match[1];
            if (!sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === modulePath)) {
                sourceFile.addImportDeclaration({
                    moduleSpecifier: modulePath,
                    namedImports: (0, extract_named_imports_1.extractNamedImports)(imp),
                });
            }
        });
        // --- 2. Import des erreurs API (UNE SEULE FOIS) ---
        // --- ON MET À JOUR L'IMPORT DES ERREURS ---
        (0, ensure_api_error_imports_1.ensureApiErrorImports)(sourceFile);
    }
    // --- Imports usecases (modèles, types, etc.) ---
    const imports = (0, collect_ds_impl_imports_1.collectDsImplImports)(f.$usecases?.filter((uc) => !uc.$delete) ?? [], module, f, config);
    imports.forEach((imp) => {
        const importValue = imp.match(/from "(.*)"/)?.[1];
        if (!importValue)
            return;
        if (!sourceFile.getImportDeclaration((d) => d.getModuleSpecifierValue() === importValue)) {
            sourceFile.addImportDeclaration({
                moduleSpecifier: importValue,
                namedImports: (0, extract_named_imports_1.extractNamedImports)(imp),
            });
        }
    });
    // --- Préserver méthodes manuelles ---
    const existingMethods = dsClass.getMethods();
    const manualMethods = existingMethods.filter((m) => !(f.$usecases ?? []).some((uc) => uc.$name === m.getName()));
    // --- Mise à jour méthode par méthode ---
    for (const uc of f.$usecases ?? []) {
        const methodName = uc.$name;
        const method = dsClass.getMethod(methodName);
        if (uc.$delete) {
            method?.remove();
            console.log(`Méthode ${methodName} supprimée`);
            continue;
        }
        const impl = uc.$implementationInDataSource ?? "undefined";
        const newMethodSignature = (0, generate_signatures_1.generateDsImplMethodSignature)(uc, f.$name);
        // --- Cas 1 : Stub ---
        if (impl === "undefined") {
            const stubBody = `{
                throw new Error("Method not implemented.");
            }`;
            if (method) {
                if (!uc.$rewriteInDataSourceImpl) {
                    console.log(`Méthode ${methodName} ignorée (déjà implémentée)`);
                    continue;
                }
                method.replaceWithText(`${newMethodSignature} ${stubBody}`);
                console.log(`Méthode ${methodName} réécrite (stub)`);
            }
            else {
                const returnType = uc.$returnType
                    ? `Promise<${(0, map_params_1.mapParamToModelType)(uc.$returnType.$type, f.$name)}${uc.$returnType.$list ? '[]' : ''}${uc.$returnType.$nullable ? ' | null' : ''}>`
                    : "Promise<void>";
                dsClass.addMember({
                    kind: ts_morph_1.StructureKind.Method,
                    name: methodName,
                    isAsync: uc.$async ?? true,
                    statements: [`throw new Error("Method not implemented.");`],
                    docs: uc.$description ? [{
                            description: [
                                uc.$description,
                                ...(uc.$params || []).map(p => `@param ${p.$name} ${p.$type}`),
                                `@returns ${returnType}`
                            ].join("\n")
                        }] : [],
                    parameters: uc.$params?.map(p => ({
                        name: p.$name,
                        type: (0, map_params_1.mapParamToModelType)(p.$type, f.$name),
                        hasQuestionToken: !!p.$optional,
                    })) ?? [],
                    returnType,
                });
                console.log(`Méthode ${methodName} ajoutée (stub)`);
            }
            continue;
        }
        // --- Cas 2 : Implémentation API ---
        if ((0, is_api_implementation_1.isApiImplementation)(impl)) {
            if (api) {
                const endpointKey = impl.$endpoint;
                const route = (0, find_api_route_1.findApiRoute)(api, endpointKey);
                if (!route) {
                    console.warn(`Endpoint ${endpointKey} introuvable pour ${methodName}`);
                    continue;
                }
                const paramsMap = {};
                uc.$params?.forEach(p => {
                    paramsMap[p.$name] = p.$name;
                });
                const { pathParamsCode, queryParamsCode, bodyCode } = (0, build_api_request_code_1.buildApiRequestCode)(route, paramsMap, impl.$mapping);
                const returnTypeNullable = !!uc.$returnType?.$nullable;
                // === NOUVEAU : mapping de réponse + typage ===
                const { returnCode, imports: responseImports, dataType } = (0, build_response_mapping_code_1.buildResponseMappingCode)(uc, f, route, config, endpointKey);
                // === Typage du client ===
                const clientCall = `apiClient<${dataType}>`;
                // === Gestion des erreurs (avec typage error) ===
                const { code: errorHandling, errorTypes } = (0, build_error_handling_code_1.buildErrorHandlingCode)(route, returnTypeNullable, endpointKey);
                // === Imports des types d'erreur ===
                errorTypes.forEach(typeName => {
                    const modulePath = "@/shared/constants/api_types";
                    const decl = sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === modulePath);
                    if (!decl) {
                        sourceFile.addImportDeclaration({
                            moduleSpecifier: modulePath,
                            namedImports: [typeName]
                        });
                    }
                    else if (!decl.getNamedImports().some(n => n.getName() === typeName)) {
                        decl.addNamedImport(typeName);
                    }
                });
                // Ajouter les imports de mapping
                // === Imports ===
                responseImports.forEach(imp => {
                    const match = imp.match(/from "(.*)"/);
                    if (!match)
                        return;
                    const modulePath = match[1];
                    const decl = sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === modulePath);
                    if (!decl) {
                        sourceFile.addImportDeclaration({
                            moduleSpecifier: modulePath,
                            namedImports: (0, extract_named_imports_1.extractNamedImports)(imp),
                        });
                    }
                    else {
                        const name = (0, extract_named_imports_1.extractNamedImports)(imp)[0];
                        if (!decl.getNamedImports().some(n => n.getName() === name)) {
                            decl.addNamedImport(name);
                        }
                    }
                });
                const apiBody = `{
                    try {
                        const route = formatApiRoute(API_ROUTES.${endpointKey.replace(".", ".")}.path, ${pathParamsCode}, ${queryParamsCode});
                        console.log("Calling API route:", route);
                        const { data, error, status } = await ${clientCall}(route, {
                            method: "${route.$method}",
                            ${bodyCode !== "undefined" ? `body: ${bodyCode},` : ""}
                            ${route.$isMultipart ? `isMultipart: true,` : ""}
                        });
                
                        ${errorHandling}

                        console.log("Response before cast:", data);
        
                        // === CAST LOCAL ===
                        const typedData = data as ${dataType};

                        console.log("Response after cast:", typedData);
                
                        return ${returnCode}
                    } catch (err) {
                        console.error("Unexpected error in ${methodName}:", err);
                        throw err;
                    }
                }`;
                if (method) {
                    if (!uc.$rewriteInDataSourceImpl) {
                        console.log(`Méthode ${methodName} ignorée (déjà implémentée)`);
                        continue;
                    }
                    method.replaceWithText(`${newMethodSignature} ${apiBody}`);
                    console.log(`Méthode ${methodName} réécrite (API + mapping réponse)`);
                }
                else {
                    dsClass.addMember({
                        kind: ts_morph_1.StructureKind.Method,
                        name: methodName,
                        isAsync: true,
                        statements: apiBody.split("\n").slice(1, -1),
                        parameters: uc.$params?.map(p => ({
                            name: p.$name,
                            type: (0, map_params_1.mapParamToModelType)(p.$type, f.$name),
                            hasQuestionToken: !!p.$optional,
                        })) ?? [],
                        returnType: `Promise<${uc.$returnType ? (0, map_params_1.mapParamToModelType)(uc.$returnType.$type, f.$name) + (uc.$returnType.$list ? '[]' : '') + (uc.$returnType.$nullable ? ' | null' : '') : 'unknown'}>`,
                    });
                    console.log(`Méthode ${methodName} ajoutée (API + mapping réponse)`);
                }
            }
            else {
                console.warn(`API introuvable pour ${methodName}`);
            }
            continue;
        }
        // --- Autres implémentations ---
        console.warn("Autre type d'implemtation");
    }
    // --- Nettoyage & préservation ---
    const ucNames = (f.$usecases ?? []).map((uc) => uc.$name);
    dsClass.getMethods().forEach((m) => {
        const name = m.getName();
        if (!ucNames.includes(name)) {
            console.log(`Méthode ${name} conservée (non listée dans la config)`);
        }
    });
    manualMethods.forEach((m) => {
        if (!dsClass.getMethod(m.getName())) {
            dsClass.addMember(m.getText());
            console.log(`Méthode manuelle ${m.getName()} préservée`);
        }
    });
    // === NETTOYAGE AUTOMATIQUE ===
    sourceFile.organizeImports(); // ← AJOUTE ÇA
    // --- Formatage ---
    sourceFile.formatText({
        indentSize: 4,
        convertTabsToSpaces: true,
        ensureNewLineAtEndOfFile: true,
    });
    sourceFile.saveSync();
    console.log(`Implémentation mise à jour : ${dsImplPath}`);
}
