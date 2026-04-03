"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrUpdateController = generateOrUpdateController;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
const casing_1 = require("../../utils/casing");
const templates_base_1 = require("../../utils/templates/templates_base");
const get_usecase_import_path_for_controller_1 = require("./get_usecase_import_path_for_controller");
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Génère ou met à jour le controller de la feature.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 * @param project Le projet ts-morph.
 */
function generateOrUpdateController(module, f, config, project) {
    console.log("🧭 [Controller] Génération ou mise à jour du controller...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const adaptersPath = path_1.default.join(root, "adapters", module.$name, featureFile);
    const controllerPath = path_1.default.join(adaptersPath, `${(0, file_name_1.getFileName)(casing, `${featureFile}_controller`)}.ts`);
    const controllerExists = fs_1.default.existsSync(controllerPath);
    const shouldRewriteController = f.$override || f.$rewriteInController || !controllerExists;
    if (shouldRewriteController) {
        console.log("♻️ Réécriture complète du controller...");
        fs_1.default.writeFileSync(controllerPath, templates_base_1.T.controller(module, f, config));
        console.log(`🆕 Controller ${f.$name} créé`);
    }
    else {
        // 🔧 Le fichier existe : on manipule l’AST partiellement
        console.log("✏️ Mise à jour sélective du controller...");
        const tsProject = project ?? new ts_morph_1.Project({
            tsConfigFilePath: "tsconfig.json",
            skipFileDependencyResolution: true,
        });
        const sourceFile = tsProject.addSourceFileAtPath(controllerPath);
        const controllerClass = sourceFile.getClass(`${casing_1.toCasing.pascalCase(f.$name)}Controller`);
        if (!controllerClass) {
            console.warn(`⚠️ Classe controller introuvable, création complète...`);
            fs_1.default.writeFileSync(controllerPath, templates_base_1.T.controller(module, f, config));
            console.log(`🆕 Controller ${f.$name} créé apres la non-trouvaille`);
        }
        else {
            // Récupération du constructeur
            let constructor = controllerClass.getConstructors()[0];
            if (!constructor) {
                constructor = controllerClass.addConstructor({ parameters: [] });
            }
            // 🧩 Cas partiel : gestion méthode par méthode
            for (const uc of f.$usecases ?? []) {
                const methodName = casing_1.toCasing.camelCase(uc.$name);
                // --- IMPORT ---
                const className = `${casing_1.toCasing.pascalCase(uc.$name)}UseCase`;
                const importPath = (0, get_usecase_import_path_for_controller_1.getUsecaseImportPathForController)(uc.$name, module, f);
                if (!sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === importPath)) {
                    sourceFile.addImportDeclaration({
                        namedImports: [className],
                        moduleSpecifier: importPath,
                    });
                }
                // --- CONSTRUCTEUR ---
                const paramName = `${methodName}UseCase`;
                if (!constructor.getParameter(paramName)) {
                    constructor.addParameter({
                        name: paramName,
                        type: className,
                        scope: ts_morph_1.Scope.Private,
                        isReadonly: true,
                    });
                }
                const methodExists = controllerClass.getInstanceProperty(methodName);
                if (uc.$delete) {
                    // Supprime la méthode
                    methodExists?.remove();
                    console.log(`🗑️ Méthode ${methodName} supprimée`);
                    // --- Supprime le paramètre du constructeur ---
                    const param = constructor.getParameter(paramName);
                    param?.remove();
                    if (param)
                        console.log(`🗑️ Paramètre du constructeur ${paramName} supprimé`);
                    // --- Supprime l'import correspondant ---
                    const importDecl = sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === importPath);
                    if (importDecl) {
                        // Vérifie si le named import existe et le supprime
                        const namedImport = importDecl.getNamedImports().find(n => n.getName() === className);
                        if (namedImport)
                            namedImport.remove();
                        // Si plus aucun named import, supprime la déclaration complète
                        if (importDecl.getNamedImports().length === 0)
                            importDecl.remove();
                        console.log(`🗑️ Import ${className} supprimé`);
                    }
                    continue;
                }
                // --- MÉTHODE ---
                // Vérifie si la méthode existe
                if (methodExists && !uc.$rewriteInController) {
                    console.log(`⏩ Méthode ${methodName} déjà existante, ignorée`);
                    continue;
                }
                // Suppression avant réinsertion
                methodExists?.remove();
                // Construction du corps minimal (selon les données de uc)
                const params = uc.$params?.map(p => `${p.$name}${p.$optional ? '?' : ''}: ${p.$type}`).join(', ') || '';
                const returnType = uc.$returnType
                    ? `${uc.$returnType.$type}${uc.$returnType.$list ? '[]' : ''}${uc.$returnType.$nullable ? ' | null' : ''}`
                    : 'void';
                const args = uc.$params?.map(p => p.$name).join(', ') || '';
                const docLines = [
                    uc.$description || uc.$name,
                    ...(uc.$params || []).map(p => `@param ${p.$name} ${p.$type}`),
                    `@returns ${returnType}`,
                ];
                const docBlock = `${docLines.map(l => `${l}`).join('\n')}`;
                const methodDecl = controllerClass.addProperty({
                    name: methodName,
                    docs: [docBlock],
                    initializer: writer => writer.write(`async (${params}): Promise<${returnType}> => {
            try {
                const res = await this.${paramName}.execute(${args});
                return res;
            } catch (e) {
                console.log(\`Error while executing ${uc.$name}: \${e}\`);
                return ${returnType.includes('null') || returnType.includes('| null') ? 'null' : returnType.includes('[]') ? '[]' : 'undefined'};
            }
        }`),
                });
                // Forcer un saut de ligne après la méthode
                methodDecl.replaceWithText(methodDecl.getFullText() + '\n');
                console.log(`✨ Méthode ${methodName} ajoutée ou mise à jour`);
            }
            // Formatte correctement le constructeur pour que chaque paramètre soit sur une ligne
            constructor.formatText({
                indentSize: 4,
                convertTabsToSpaces: true,
            });
            sourceFile.formatText({
                indentSize: 4,
                convertTabsToSpaces: true,
                ensureNewLineAtEndOfFile: true
            });
            sourceFile.saveSync();
            console.log(`✅ Controller mis à jour : ${controllerPath}`);
        }
    }
    console.log("✅ [Controller] Terminés.");
}
