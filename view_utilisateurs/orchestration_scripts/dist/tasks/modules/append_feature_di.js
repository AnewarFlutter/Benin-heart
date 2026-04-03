"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendFeatureDI = appendFeatureDI;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const casing_1 = require("../../utils/casing");
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Ajoute ou met à jour l'injection de dépendances pour une feature.
 * - Génère ou met à jour le fichier DI spécifique à la feature.
 * - Met à jour `features_di.ts` de manière incrémentale.
 */
function appendFeatureDI(config, project) {
    const diDir = path_1.default.join(process.cwd(), "src", "di");
    const aggregatorPath = path_1.default.join(diDir, "features_di.ts");
    fs_1.default.mkdirSync(diDir, { recursive: true });
    for (const mod of config.$modules) {
        if (mod.$delete || mod.$skip)
            continue;
        if (mod.$features.length === 0)
            continue;
        const casing = mod.$fileNameCasing ?? "snakeCase";
        for (const feat of mod.$features) {
            if (feat.$delete || feat.$skip)
                continue;
            const featureFile = (0, file_name_1.getFileName)(casing, feat.$name);
            const pascal = casing_1.toCasing.pascalCase(feat.$name);
            const camel = casing_1.toCasing.camelCase(feat.$name);
            const controllerVar = `${camel}Controller`;
            const featureDiPath = path_1.default.join(diDir, `${featureFile}_di.ts`);
            // --- Génération du DI spécifique ---
            const dsVar = `${camel}DataSource`;
            const repoVar = `${camel}Repo`;
            const usecases = feat.$usecases?.filter(uc => !uc.$delete) ?? [];
            const usecaseLines = usecases
                .map(uc => {
                const ucPascal = casing_1.toCasing.pascalCase(uc.$name);
                const ucCamel = casing_1.toCasing.camelCase(uc.$name);
                return `const ${ucCamel}UseCase = new ${ucPascal}UseCase(${repoVar});`;
            })
                .join("\n");
            const usecaseArgs = usecases.map(uc => `${casing_1.toCasing.camelCase(uc.$name)}UseCase`).join(",\n    ");
            const controllerLine = usecaseArgs
                ? `const ${controllerVar} = new ${pascal}Controller(\n    ${usecaseArgs}\n);`
                : `const ${controllerVar} = new ${pascal}Controller();`;
            const featureDiContent = `
import { ${pascal}Controller } from "@/adapters/${mod.$name}/${featureFile}/${(0, file_name_1.getFileName)(casing, `${featureFile}_controller`)}";
import { RestApi${pascal}DataSourceImpl } from "@/modules/${mod.$name}/${featureFile}/data/datasources/${(0, file_name_1.getFileName)(casing, `rest_api_${featureFile}_data_source_impl`)}";
import { ${pascal}RepositoryImpl } from "@/modules/${mod.$name}/${featureFile}/data/repositories/${(0, file_name_1.getFileName)(casing, `${featureFile}_repository_impl`)}";
${usecases
                .map(uc => `import { ${casing_1.toCasing.pascalCase(uc.$name)}UseCase } from "@/modules/${mod.$name}/${featureFile}/domain/usecases/${(0, file_name_1.getFileName)(casing, `${uc.$name}_use_case`)}";`)
                .join("\n")}

/** DI – ${pascal} */
const ${dsVar} = new RestApi${pascal}DataSourceImpl();
const ${repoVar} = new ${pascal}RepositoryImpl(${dsVar});
${usecaseLines}
${controllerLine}

export { ${controllerVar} };
`.trimStart();
            fs_1.default.writeFileSync(featureDiPath, featureDiContent, "utf-8");
            // --- Mise à jour de l'agrégateur ---
            let aggregatorContent = "";
            if (fs_1.default.existsSync(aggregatorPath)) {
                aggregatorContent = fs_1.default.readFileSync(aggregatorPath, "utf-8");
            }
            // Import si absent
            const importLine = `import { ${controllerVar} } from "./${featureFile}_di";`;
            if (!aggregatorContent.includes(importLine)) {
                aggregatorContent = `${importLine}\n${aggregatorContent}`;
            }
            // Ajouter au featuresDi si absent
            const regex = /export const featuresDi\s*=\s*{([\s\S]*?)}/;
            if (regex.test(aggregatorContent)) {
                aggregatorContent = aggregatorContent.replace(regex, (match, inner) => {
                    const trimmed = inner.trim();
                    if (!trimmed.includes(controllerVar)) {
                        const newInner = trimmed ? `${trimmed},\n    ${controllerVar}` : `    ${controllerVar}`;
                        return `export const featuresDi = {\n${newInner}\n}`;
                    }
                    return match;
                });
            }
            else {
                aggregatorContent += `\n\nexport const featuresDi = {\n    ${controllerVar}\n};\n`;
            }
            fs_1.default.writeFileSync(aggregatorPath, aggregatorContent, "utf-8");
        }
    }
    // --- Optionnel: formatage ts-morph ---
    try {
        const sf = project.createSourceFile(aggregatorPath, fs_1.default.readFileSync(aggregatorPath, "utf-8"), { overwrite: true });
        sf.organizeImports();
        sf.formatText({ indentSize: 4 });
        sf.saveSync();
    }
    catch (e) {
        console.warn("Formatage ignoré:", e);
    }
}
