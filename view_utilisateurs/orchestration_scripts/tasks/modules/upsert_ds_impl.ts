import fs from "fs";
import path from "path";
import { Project, StructureKind } from "ts-morph";
import { ModuleSchema, FeatureSchema, ModulesConfigSchema, ApiConfigSchema } from "../../config_validator";
import { toCasing } from "../../utils/casing";
import { extractNamedImports } from "../../utils/helpers/extract_named_imports";
import { isApiImplementation } from "../../utils/helpers/is_api_implementation";
import { T } from "../../utils/templates/templates_base";
import { buildResponseMappingCode } from "../../utils/functions/api/build_response_mapping_code";
import { collectDsImplImports } from "../../utils/functions/module/imports/collect_ds_impl_imports";
import { findApiRoute } from "../../utils/helpers/find_api_route";
import { generateDsImplMethodSignature } from "./generate_signatures";
import { mapParamToModelType } from "../../utils/functions/commons/map_params";
import { getFileName } from "../../utils/functions/commons/file_name";
import { buildApiRequestCode } from "../api/build_api_request_code";
import { buildErrorHandlingCode } from "../api/build_error_handling_code";
import { ensureApiErrorImports } from "../api/ensure_api_error_imports";

export function generateOrUpdateDataSourceImplementation(
    module: ModuleSchema,
    f: FeatureSchema,
    config: ModulesConfigSchema,
    project?: Project,
    api?: ApiConfigSchema,
) {
    console.log("DataSource Impl] Génération ou mise à jour...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = getFileName(casing, f.$name);
    const root = path.join(process.cwd(), "src");
    const featurePath = path.join(root, "modules", module.$name, featureFile);
    const dsImplPath = path.join(
        featurePath,
        "data",
        "datasources",
        `${getFileName(casing, `rest_api_${featureFile}_data_source_impl`)}.ts`
    );

    const dsImplExists = fs.existsSync(dsImplPath);
    const shouldRewriteDsImpl = f.$override || f.$rewriteInDataSourceImpl;

    if (shouldRewriteDsImpl) {
        console.log("Réécriture complète du DataSource Impl...");
        fs.writeFileSync(dsImplPath, T.restDsImpl(module, f, config));
        console.log(`Implémentation REST du datasource ${f.$name} créée`);
        return;
    }

    if (!dsImplExists) {
        console.log("Création de l'implémentation REST du datasource introuvable, création...");
        fs.writeFileSync(dsImplPath, T.restDsImpl(module, f, config));
        console.log(`Création de l'implémentation REST du datasource ${f.$name} création`);
    }

    console.log("Mise à jour sélective du DataSource Impl...");
    const tsProject = project ?? new Project({
        tsConfigFilePath: "tsconfig.json",
        skipFileDependencyResolution: true,
    });
    const sourceFile = tsProject.addSourceFileAtPath(dsImplPath);
    const className = `RestApi${toCasing.pascalCase(f.$name)}DataSourceImpl`;
    const dsClass = sourceFile.getClass(className);

    if (!dsClass) {
        console.warn(`Classe ${className} introuvable, réécriture complète...`);
        fs.writeFileSync(dsImplPath, T.restDsImpl(module, f, config));
        console.log(`Implémentation d'usine REST du datasource ${f.$name} créée`);
        return;
    }

    // --- Ajout des imports API (uniquement si au moins une méthode utilise l'API) ---
    const hasApiUsecase = (f.$usecases ?? []).some(uc =>
        uc.$implementationInDataSource && isApiImplementation(uc.$implementationInDataSource)
    );

    if (hasApiUsecase) {
        // --- Imports nécessaires pour l'API ---
        const standardImports = [
            `import { API_ROUTES } from "@/shared/constants/api_routes";`,
            `import { apiClient } from "@/lib/api/api_client";`,
            `import { formatApiRoute } from "@/lib/api/format_api_route";`,
        ];

        standardImports.forEach(imp => {
            const match = imp.match(/from "(.*)"/);
            if (!match) return;
            const modulePath = match[1];
            if (!sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === modulePath)) {
                sourceFile.addImportDeclaration({
                    moduleSpecifier: modulePath,
                    namedImports: extractNamedImports(imp),
                });
            }
        });

        // --- 2. Import des erreurs API (UNE SEULE FOIS) ---
        // --- ON MET À JOUR L'IMPORT DES ERREURS ---
        ensureApiErrorImports(sourceFile);
    }

    // --- Imports usecases (modèles, types, etc.) ---
    const imports = collectDsImplImports(
        f.$usecases?.filter((uc) => !uc.$delete) ?? [],
        module,
        f,
        config
    );
    imports.forEach((imp) => {
        const importValue = imp.match(/from "(.*)"/)?.[1];
        if (!importValue) return;
        if (!sourceFile.getImportDeclaration((d) => d.getModuleSpecifierValue() === importValue)) {
            sourceFile.addImportDeclaration({
                moduleSpecifier: importValue,
                namedImports: extractNamedImports(imp),
            });
        }
    });

    // --- Préserver méthodes manuelles ---
    const existingMethods = dsClass.getMethods();
    const manualMethods = existingMethods.filter(
        (m) => !(f.$usecases ?? []).some((uc) => uc.$name === m.getName())
    );

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
        const newMethodSignature = generateDsImplMethodSignature(uc, f.$name);

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
            } else {
                const returnType = uc.$returnType
                    ? `Promise<${mapParamToModelType(uc.$returnType.$type, f.$name)}${uc.$returnType.$list ? '[]' : ''}${uc.$returnType.$nullable ? ' | null' : ''}>`
                    : "Promise<void>";

                dsClass.addMember({
                    kind: StructureKind.Method,
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
                        type: mapParamToModelType(p.$type, f.$name),
                        hasQuestionToken: !!p.$optional,
                    })) ?? [],
                    returnType,
                });
                console.log(`Méthode ${methodName} ajoutée (stub)`);
            }
            continue;
        }

        // --- Cas 2 : Implémentation API ---
        if (isApiImplementation(impl)) {
            if (api) {

                const endpointKey = impl.$endpoint;
                const route = findApiRoute(api, endpointKey);

                if (!route) {
                    console.warn(`Endpoint ${endpointKey} introuvable pour ${methodName}`);
                    continue;
                }

                const paramsMap: Record<string, string> = {};
                uc.$params?.forEach(p => {
                    paramsMap[p.$name] = p.$name;
                });

                const { pathParamsCode, queryParamsCode, bodyCode } = buildApiRequestCode(route, paramsMap, impl.$mapping);
                const returnTypeNullable = !!uc.$returnType?.$nullable;

                // === NOUVEAU : mapping de réponse + typage ===
                const { returnCode, imports: responseImports, dataType } = buildResponseMappingCode(
                    uc, f, route, config, endpointKey
                );

                // === Typage du client ===
                const clientCall = `apiClient<${dataType}>`;

                // === Gestion des erreurs (avec typage error) ===
                const { code: errorHandling, errorTypes } = buildErrorHandlingCode(route, returnTypeNullable, endpointKey);

                // === Imports des types d'erreur ===
                errorTypes.forEach(typeName => {
                    const modulePath = "@/shared/constants/api_types";
                    const decl = sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === modulePath);
                    if (!decl) {
                        sourceFile.addImportDeclaration({
                            moduleSpecifier: modulePath,
                            namedImports: [typeName]
                        });
                    } else if (!decl.getNamedImports().some(n => n.getName() === typeName)) {
                        decl.addNamedImport(typeName);
                    }
                });

                // Ajouter les imports de mapping
                // === Imports ===
                responseImports.forEach(imp => {
                    const match = imp.match(/from "(.*)"/);
                    if (!match) return;
                    const modulePath = match[1];
                    const decl = sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === modulePath);
                    if (!decl) {
                        sourceFile.addImportDeclaration({
                            moduleSpecifier: modulePath,
                            namedImports: extractNamedImports(imp),
                        });
                    } else {
                        const name = extractNamedImports(imp)[0];
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
                } else {
                    dsClass.addMember({
                        kind: StructureKind.Method,
                        name: methodName,
                        isAsync: true,
                        statements: apiBody.split("\n").slice(1, -1),
                        parameters: uc.$params?.map(p => ({
                            name: p.$name,
                            type: mapParamToModelType(p.$type, f.$name),
                            hasQuestionToken: !!p.$optional,
                        })) ?? [],
                        returnType: `Promise<${uc.$returnType ? mapParamToModelType(uc.$returnType.$type, f.$name) + (uc.$returnType.$list ? '[]' : '') + (uc.$returnType.$nullable ? ' | null' : '') : 'unknown'}>`,
                    });
                    console.log(`Méthode ${methodName} ajoutée (API + mapping réponse)`);
                }
            } else {
                console.warn(`API introuvable pour ${methodName}`);
            }
            continue;
        }
        // --- Autres implémentations ---
        console.warn("Autre type d'implemtation")
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