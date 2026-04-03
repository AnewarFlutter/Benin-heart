import fs from "fs";
import path from "path";
import { Project } from "ts-morph";
import { ModulesConfigSchema } from "../../config_validator";
import { toCasing } from "../../utils/casing";
import { CasingStyle } from "../../utils/types";
import { getFileName } from "../../utils/functions/commons/file_name";

/**
 * Ajoute ou met à jour l'injection de dépendances pour une feature.
 * - Génère ou met à jour le fichier DI spécifique à la feature.
 * - Met à jour `features_di.ts` de manière incrémentale.
 */
export function appendFeatureDI(config: ModulesConfigSchema, project: Project) {
    const diDir = path.join(process.cwd(), "src", "di");
    const aggregatorPath = path.join(diDir, "features_di.ts");
    fs.mkdirSync(diDir, { recursive: true });

    for (const mod of config.$modules) {
        if (mod.$delete || mod.$skip) continue;
        if (mod.$features.length === 0) continue;
        const casing: CasingStyle = mod.$fileNameCasing ?? "snakeCase";

        for (const feat of mod.$features) {
            if (feat.$delete || feat.$skip) continue;

            const featureFile = getFileName(casing, feat.$name);
            const pascal = toCasing.pascalCase(feat.$name);
            const camel = toCasing.camelCase(feat.$name);
            const controllerVar = `${camel}Controller`;

            const featureDiPath = path.join(diDir, `${featureFile}_di.ts`);

            // --- Génération du DI spécifique ---
            const dsVar = `${camel}DataSource`;
            const repoVar = `${camel}Repo`;

            const usecases = feat.$usecases?.filter(uc => !uc.$delete) ?? [];
            const usecaseLines = usecases
                .map(uc => {
                    const ucPascal = toCasing.pascalCase(uc.$name);
                    const ucCamel = toCasing.camelCase(uc.$name);
                    return `const ${ucCamel}UseCase = new ${ucPascal}UseCase(${repoVar});`;
                })
                .join("\n");

            const usecaseArgs = usecases.map(uc => `${toCasing.camelCase(uc.$name)}UseCase`).join(",\n    ");

            const controllerLine = usecaseArgs
                ? `const ${controllerVar} = new ${pascal}Controller(\n    ${usecaseArgs}\n);`
                : `const ${controllerVar} = new ${pascal}Controller();`;

            const featureDiContent = `
import { ${pascal}Controller } from "@/adapters/${mod.$name}/${featureFile}/${getFileName(casing, `${featureFile}_controller`)}";
import { RestApi${pascal}DataSourceImpl } from "@/modules/${mod.$name}/${featureFile}/data/datasources/${getFileName(casing, `rest_api_${featureFile}_data_source_impl`)}";
import { ${pascal}RepositoryImpl } from "@/modules/${mod.$name}/${featureFile}/data/repositories/${getFileName(casing, `${featureFile}_repository_impl`)}";
${usecases
                .map(uc => `import { ${toCasing.pascalCase(uc.$name)}UseCase } from "@/modules/${mod.$name}/${featureFile}/domain/usecases/${getFileName(casing, `${uc.$name}_use_case`)}";`)
                    .join("\n")}

/** DI – ${pascal} */
const ${dsVar} = new RestApi${pascal}DataSourceImpl();
const ${repoVar} = new ${pascal}RepositoryImpl(${dsVar});
${usecaseLines}
${controllerLine}

export { ${controllerVar} };
`.trimStart();

            fs.writeFileSync(featureDiPath, featureDiContent, "utf-8");

            // --- Mise à jour de l'agrégateur ---
            let aggregatorContent = "";
            if (fs.existsSync(aggregatorPath)) {
                aggregatorContent = fs.readFileSync(aggregatorPath, "utf-8");
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
            } else {
                aggregatorContent += `\n\nexport const featuresDi = {\n    ${controllerVar}\n};\n`;
            }

            fs.writeFileSync(aggregatorPath, aggregatorContent, "utf-8");
        }
    }

    // --- Optionnel: formatage ts-morph ---
    try {
        const sf = project.createSourceFile(aggregatorPath, fs.readFileSync(aggregatorPath, "utf-8"), { overwrite: true });
        sf.organizeImports();
        sf.formatText({ indentSize: 4 });
        sf.saveSync();
    } catch (e) {
        console.warn("Formatage ignoré:", e);
    }
}
