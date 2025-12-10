import fs from 'fs';
import path from 'path';

// Helpers
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const toSnakeCase = (str) =>
    str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const toCamelCase = (str) => str.charAt(0).toLowerCase() + str.slice(1);

// Arguments
const args = process.argv.slice(2);
const [featureName, usecaseName, paramsStr = '', returnType = 'void', asyncFlag = ''] = args;

// Récupérer l'option --related (si présente)
let relatedFeature = null;
const relatedIndex = args.indexOf('--related');
if (relatedIndex !== -1 && args[relatedIndex + 1]) {
    relatedFeature = args[relatedIndex + 1].toLowerCase();
}

if (!featureName || !usecaseName) {
    console.error(
        'Usage: node simple_usecase_creator_script.js <featureName> <usecaseName> [params] [returnType] [async] [--related feature]'
    );
    process.exit(1);
}

const isAsync = asyncFlag === 'async';
const fileName = `${toSnakeCase(usecaseName)}_usecase.ts`;

// Parser les paramètres
const paramList = paramsStr
    .split(',')
    .filter(Boolean)
    .map((p) => {
        const [name, type] = p.split(':').map((s) => s.trim());
        return { name, type };
    });

// Générer signatures
const paramsSignature = paramList
    .map((p) => `${p.name}: ${p.type}`)
    .join(', ');
const paramNames = paramList.map((p) => p.name).join(', ');

// --- Helpers pour mapper entités -> modèles dans data ---
const mapEntityToModel = (type, featureName, relatedFeature) => {
    const entityCurrent = `Entity${capitalize(featureName)}`;
    const modelCurrent = `Model${capitalize(featureName)}`;

    if (type.includes(entityCurrent)) {
        return type.replace(new RegExp(`\\b${entityCurrent}\\b`, 'g'), modelCurrent);
    }

    if (relatedFeature) {
        const entityOther = `Entity${capitalize(relatedFeature)}`;
        const modelOther = `Model${capitalize(relatedFeature)}`;
        if (type.includes(entityOther)) {
            return type.replace(new RegExp(`\\b${entityOther}\\b`, 'g'), modelOther);
        }
    }

    return type;
};

// Collecte imports MODELS (dans data)
const collectModelImports = (params, returnType, featureName, relatedFeature) => {
    const allTypes = [...params.map((p) => p.type), returnType];
    const imports = [];

    allTypes.forEach((type) => {
        if (type.includes(`Entity${capitalize(featureName)}`)) {
            imports.push({
                feature: featureName,
                model: `Model${capitalize(featureName)}`,
            });
        }
        if (relatedFeature && type.includes(`Entity${capitalize(relatedFeature)}`)) {
            imports.push({
                feature: relatedFeature,
                model: `Model${capitalize(relatedFeature)}`,
            });
        }
    });

    return imports;
};

// Collecte imports ENTITIES (dans domain)
const collectEntityImports = (params, returnType, featureName, relatedFeature) => {
    const allTypes = [...params.map((p) => p.type), returnType];
    const imports = [];

    allTypes.forEach((type) => {
        if (type.includes(`Entity${capitalize(featureName)}`)) {
            imports.push({
                feature: featureName,
                entity: `Entity${capitalize(featureName)}`,
            });
        }
        if (relatedFeature && type.includes(`Entity${capitalize(relatedFeature)}`)) {
            imports.push({
                feature: relatedFeature,
                entity: `Entity${capitalize(relatedFeature)}`,
            });
        }
    });

    return imports;
};

// Inject imports dans fichier (modèles ou entités)
const ensureImports = (filePath, imports, kind = 'model') => {
    if (!imports.length) return;
    let content = fs.readFileSync(filePath, 'utf8');

    imports.forEach(({ feature, model, entity }) => {
        const importLine =
            kind === 'model'
                ? `import { ${model} } from "@/features/${feature}/data/models/model_${feature}";`
                : `import { ${entity} } from "@/features/${feature}/domain/entities/entity_${feature}";`;

        if (!content.includes(importLine)) {
            const firstImportIndex = content.indexOf('import');
            if (firstImportIndex !== -1) {
                const nextLineIndex = content.indexOf('\n', firstImportIndex) + 1;
                content =
                    content.slice(0, nextLineIndex) +
                    importLine +
                    '\n' +
                    content.slice(nextLineIndex);
            } else {
                content = importLine + '\n' + content;
            }
        }
    });

    fs.writeFileSync(filePath, content);
};

// Paths
const featurePath = path.join(process.cwd(), 'src', 'features', featureName);
const domainPath = path.join(featurePath, 'domain');
const usecasePath = path.join(domainPath, 'usecases');
const repositoryPath = path.join(domainPath, 'repositories', `${featureName}_repository.ts`);
const dataSourcePath = path.join(featurePath, 'data', 'datasources', `${featureName}_data_source.ts`);
const dataSourceImplPath = path.join(
    featurePath,
    'data',
    'datasources',
    `rest_api_${featureName}_data_source_impl.ts`
);
const repositoryImplPath = path.join(
    featurePath,
    'data',
    'repositories',
    `${featureName}_repository_impl.ts`
);


// Nom de méthode
const methodName = toCamelCase(usecaseName);

// 1️⃣ Créer fichier usecase
const usecaseFilePath = path.join(usecasePath, fileName);
const usecaseContent = `import { ${capitalize(featureName)}Repository } from "../repositories/${featureName}_repository";

/**
 * ${capitalize(usecaseName)} use case for ${capitalize(featureName)} feature.
 */
export class ${capitalize(usecaseName)}UseCase {
    constructor(private readonly repository: ${capitalize(featureName)}Repository) {}

    /**
     * Executes the use case.
     */
    ${isAsync ? 'async ' : ''}execute(${paramsSignature}): ${isAsync ? `Promise<${returnType}>` : returnType
    } {
        return this.repository.${methodName}(${paramNames});
    }
}
`;

if (!fs.existsSync(usecasePath)) fs.mkdirSync(usecasePath, { recursive: true });
fs.writeFileSync(usecaseFilePath, usecaseContent);
console.log(`Created usecase file: ${fileName}`);

// Ajouter imports d’entités si besoin
const entityImports = collectEntityImports(paramList, returnType, featureName, relatedFeature);
ensureImports(usecaseFilePath, entityImports, 'entity');

// 2️⃣ Repository
if (fs.existsSync(repositoryPath)) {
    let repoContent = fs.readFileSync(repositoryPath, 'utf8');
    const methodSignature = `
    /**
     * ${capitalize(usecaseName)}.
     */
    ${methodName}(${paramsSignature}): ${isAsync ? `Promise<${returnType}>` : returnType
        };
`;
    if (!repoContent.includes(`${methodName}(`)) {
        const insertIndex = repoContent.lastIndexOf('}');
        repoContent =
            repoContent.slice(0, insertIndex) +
            methodSignature +
            repoContent.slice(insertIndex);
        fs.writeFileSync(repositoryPath, repoContent);
        console.log(`Updated repository: ${repositoryPath}`);

        // Ajouter imports entités si besoin
        ensureImports(repositoryPath, entityImports, 'entity');
    }
}

// 3️⃣ Datasource
if (fs.existsSync(dataSourcePath)) {
    let dsContent = fs.readFileSync(dataSourcePath, 'utf8');
    const mappedReturnType = mapEntityToModel(returnType, featureName, relatedFeature);
    const mappedParams = paramList
        .map((p) => `${p.name}: ${mapEntityToModel(p.type, featureName, relatedFeature)}`)
        .join(', ');

    const dsSignature = `
    /**
     * ${capitalize(usecaseName)}.
     */
    ${methodName}(${mappedParams}): ${isAsync ? `Promise<${mappedReturnType}>` : mappedReturnType
        };
`;
    if (!dsContent.includes(`${methodName}(`)) {
        const insertIndex = dsContent.lastIndexOf('}');
        dsContent =
            dsContent.slice(0, insertIndex) +
            dsSignature +
            dsContent.slice(insertIndex);
        fs.writeFileSync(dataSourcePath, dsContent);
        console.log(`Updated datasource: ${dataSourcePath}`);

        const imports = collectModelImports(paramList, returnType, featureName, relatedFeature);
        ensureImports(dataSourcePath, imports, 'model');
    }
}

// 4️⃣ Datasource impl
if (fs.existsSync(dataSourceImplPath)) {
    let dsImplContent = fs.readFileSync(dataSourceImplPath, 'utf8');
    const mappedReturnType = mapEntityToModel(returnType, featureName, relatedFeature);
    const mappedParams = paramList
        .map((p) => `${p.name}: ${mapEntityToModel(p.type, featureName, relatedFeature)}`)
        .join(', ');

    const implMethod = `
    /**
     * ${capitalize(usecaseName)}.
     */
    ${isAsync ? 'async ' : ''}${methodName}(${mappedParams}): ${isAsync ? `Promise<${mappedReturnType}>` : mappedReturnType
        } {
        throw new Error("Method not implemented.");
    }
`;
    if (!dsImplContent.includes(`${methodName}(`)) {
        const insertIndex = dsImplContent.lastIndexOf('}');
        dsImplContent =
            dsImplContent.slice(0, insertIndex) +
            implMethod +
            dsImplContent.slice(insertIndex);
        fs.writeFileSync(dataSourceImplPath, dsImplContent);
        console.log(`Updated datasource implementation: ${dataSourceImplPath}`);

        const imports = collectModelImports(paramList, returnType, featureName, relatedFeature);
        ensureImports(dataSourceImplPath, imports, 'model');
    }
}

// 5️⃣ Repository impl
if (fs.existsSync(repositoryImplPath)) {
    let repoImplContent = fs.readFileSync(repositoryImplPath, 'utf8');
    const repoImplMethod = `
    /**
     * ${capitalize(usecaseName)}.
     */
    ${isAsync ? 'async ' : ''}${methodName}(${paramsSignature}): ${isAsync ? `Promise<${returnType}>` : returnType} {
        try {
            const data = await this.datasource.${methodName}(${paramNames});
            // TODO: Mapper les données si nécessaire, ex: data.toEntity() ou data.map(...)
            return data;
        } catch (e) {
            throw e;
        }
    }
`;
    if (!repoImplContent.includes(`${methodName}(`)) {
        const insertIndex = repoImplContent.lastIndexOf('}');
        repoImplContent =
            repoImplContent.slice(0, insertIndex) +
            repoImplMethod +
            repoImplContent.slice(insertIndex);
        fs.writeFileSync(repositoryImplPath, repoImplContent);
        console.log(`Updated repository implementation: ${repositoryImplPath}`);

        // Ajouter imports entités si besoin
        ensureImports(repositoryImplPath, entityImports, 'entity');
    }
}

// 6️⃣ Controller
const controllerPath = path.join(process.cwd(), 'src', 'adapters', featureName, `${featureName}_controller.ts`);

// --- Collecte imports entités pour le controller
const collectEntityImportsForController = (params, returnType, featureName, relatedFeature) => {
    const allTypes = [...params.map(p => p.type), returnType];
    const imports = [];

    allTypes.forEach(type => {
        if (type.includes(`Entity${capitalize(featureName)}`)) {
            imports.push({ feature: featureName, entity: `Entity${capitalize(featureName)}` });
        }
        if (relatedFeature && type.includes(`Entity${capitalize(relatedFeature)}`)) {
            imports.push({ feature: relatedFeature, entity: `Entity${capitalize(relatedFeature)}` });
        }
    });

    // Éliminer les doublons
    return imports.filter(
        (v, i, a) => a.findIndex(t => t.entity === v.entity && t.feature === v.feature) === i
    );
};

const entityImportsInController = collectEntityImportsForController(paramList, returnType, featureName, relatedFeature);

if (fs.existsSync(controllerPath)) {
    let controllerContent = fs.readFileSync(controllerPath, 'utf8');

    // 6.1️⃣ Injecter les imports des entités dans le controller
    entityImportsInController.forEach(({ feature, entity }) => {
        const importLine = `import { ${entity} } from "@/features/${feature}/domain/entities/entity_${feature}";`;
        if (!controllerContent.includes(importLine)) {
            const lastImportIndex = controllerContent.lastIndexOf('import');
            const insertIndex = controllerContent.indexOf('\n', lastImportIndex) + 1;
            controllerContent =
                controllerContent.slice(0, insertIndex) + importLine + '\n' + controllerContent.slice(insertIndex);
        }
    });

    // 6.2️⃣ Import du usecase si nécessaire
    const usecaseClass = usecaseName;
    const usecaseImportLine = `import { ${capitalize(usecaseName)}UseCase } from "@/features/${featureName}/domain/usecases/${toSnakeCase(usecaseName)}_usecase";`;
    if (!controllerContent.includes(usecaseImportLine)) {
        const lastImportIndex = controllerContent.lastIndexOf('import');
        const insertIndex = controllerContent.indexOf('\n', lastImportIndex) + 1;
        controllerContent = controllerContent.slice(0, insertIndex) + usecaseImportLine + '\n' + controllerContent.slice(insertIndex);
    }

    // 6.3️⃣ Ajouter le usecase au constructeur
    const constructorRegex = /constructor\s*\(([^)]*)\)\s*{/m;
    const constructorMatch = controllerContent.match(constructorRegex);
    if (constructorMatch) {
        let constructorContent = constructorMatch[1].trim();
        if (constructorContent.endsWith(',')) constructorContent = constructorContent.slice(0, -1);
        const newConstructorContent = constructorContent
            ? `${constructorContent},\n        private readonly ${toCamelCase(usecaseName)}UseCase: ${capitalize(usecaseName)}UseCase`
            : `private readonly ${toCamelCase(usecaseName)}UseCase: ${capitalize(usecaseName)}UseCase`;
        controllerContent = controllerContent.replace(constructorRegex, `constructor(\n        ${newConstructorContent}\n    ) {`);
    }

    // 6.4️⃣ Ajouter la méthode fléchée
    const methodName = toCamelCase(usecaseName);
    const methodSignature = `
    ${methodName} = ${isAsync ? 'async' : ''} (${paramsSignature}): ${isAsync ? `Promise<${returnType}>` : returnType} => {
        try {
            const res = ${isAsync ? 'await' : ''} this.${methodName}UseCase.execute(${paramNames});
            return res;
        } catch (e) {
            console.log(\`Error while executing ${usecaseName}: \${e}\`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
        }
    }
`;

    if (!controllerContent.includes(`${methodName} =`)) {
        const classEndIndex = controllerContent.lastIndexOf('}');
        controllerContent = controllerContent.slice(0, classEndIndex) + '\n' + methodSignature + controllerContent.slice(classEndIndex);
    }

    fs.writeFileSync(controllerPath, controllerContent);
    console.log(`Updated controller: ${controllerPath}`);
}


// 7️⃣ DI - features_di
const featuresDiPath = path.join(process.cwd(), 'src', 'di', 'features_di.ts');

if (fs.existsSync(featuresDiPath)) {
    let diContent = fs.readFileSync(featuresDiPath, 'utf8');

    // --- 7.1️⃣ Ajouter import du usecase si nécessaire
    const usecaseClass = usecaseName;
    const usecaseImportLine = `import { ${capitalize(usecaseName)}UseCase } from "@/features/${featureName}/domain/usecases/${toSnakeCase(usecaseName)}_usecase";`;
    if (!diContent.includes(usecaseImportLine)) {
        const lastImportIndex = diContent.lastIndexOf('import');
        const insertIndex = diContent.indexOf('\n', lastImportIndex) + 1;
        diContent = diContent.slice(0, insertIndex) + usecaseImportLine + '\n' + diContent.slice(insertIndex);
    }

    // --- 7.2️⃣ Ajouter instanciation du usecase
    const repositoryVar = `${toCamelCase(featureName)}Repository`;
    const usecaseVar = `${toCamelCase(usecaseName)}UseCase`;
    const usecaseInstantiation = `const ${usecaseVar} = new ${capitalize(usecaseName)}UseCase(${repositoryVar});`;

    if (!diContent.includes(usecaseInstantiation)) {
        // Cherche le dernier usecase instancié pour cette feature
        const regexFeatureUsecase = new RegExp(`const\\s+\\w+UseCase\\s*=\\s*new\\s+\\w+UseCase\\(${repositoryVar}\\);`, 'g');
        let lastMatch;
        let match;
        while ((match = regexFeatureUsecase.exec(diContent)) !== null) {
            lastMatch = match;
        }

        if (lastMatch) {
            const insertIndex = lastMatch.index + lastMatch[0].length;
            diContent = diContent.slice(0, insertIndex) + '\n' + usecaseInstantiation + diContent.slice(insertIndex);
        } else {
            // Si pas de usecase trouvé, ajoute après la déclaration du repository
            const repoRegex = new RegExp(`const\\s+${repositoryVar}\\s*=\\s*new\\s+\\w+\\(${repositoryVar}\\);`);
            const repoMatch = diContent.match(repoRegex);
            if (repoMatch) {
                const insertIndex = diContent.indexOf(repoMatch[0]) + repoMatch[0].length;
                diContent = diContent.slice(0, insertIndex) + '\n' + usecaseInstantiation + diContent.slice(insertIndex);
            }
        }
    }

    // --- 7.3️⃣ Ajouter le usecase dans le controller
    const controllerVar = `${toCamelCase(featureName)}Controller`;
    const controllerRegex = new RegExp(`const\\s+${controllerVar}\\s*=\\s*new\\s+\\w+\\(([^)]*)\\)`);
    const controllerMatch = diContent.match(controllerRegex);

    if (controllerMatch) {
        let constructorContent = controllerMatch[1].trim();

        if (constructorContent.endsWith(',')) constructorContent = constructorContent.slice(0, -1);

        const newConstructorContent = constructorContent
            ? `${constructorContent},\n    ${usecaseVar}`
            : `${usecaseVar}`;

        diContent = diContent.replace(controllerRegex, `const ${controllerVar} = new ${capitalize(featureName)}Controller(\n    ${newConstructorContent}\n)`);
    }

    fs.writeFileSync(featuresDiPath, diContent);
    console.log(`Updated features DI: ${featuresDiPath}`);
}


console.log('Usecase creation complete.');
