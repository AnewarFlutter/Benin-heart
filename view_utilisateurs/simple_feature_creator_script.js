import fs from 'fs';
import path from 'path';

function updateFeaturesDi(feature) {
    const diFilePath = path.join(process.cwd(), 'src', 'di', 'features_di.ts');

    const importStatements = `
import { ${capitalize(feature)}Controller } from "@/adapters/${feature}/${feature}_controller";
import { RestApi${capitalize(feature)}DataSourceImpl } from "@/features/${feature}/data/datasources/rest_api_${feature}_data_source_impl";
import { ${capitalize(feature)}RepositoryImpl } from "@/features/${feature}/data/repositories/${feature}_repository_impl";
import { Get${capitalize(feature)}ByIdUseCase } from "@/features/${feature}/domain/usecases/get_${feature}_by_id_usecase";
`;

    const setupStatements = `
/**
 *  Dependency Injection (DI) setup for the ${capitalize(feature)} Feature.
 */
const ${feature}DataSource = new RestApi${capitalize(feature)}DataSourceImpl();  // Or Firebase${capitalize(feature)}DataSourceImpl | MongoDB${capitalize(feature)}DataSourceImpl | Supabase${capitalize(feature)}DataSourceImpl | etc
const ${feature}Repository = new ${capitalize(feature)}RepositoryImpl(${feature}DataSource);

const get${capitalize(feature)}ByIdUseCase = new Get${capitalize(feature)}ByIdUseCase(${feature}Repository);

const ${feature}Controller = new ${capitalize(feature)}Controller(
    get${capitalize(feature)}ByIdUseCase,
);
`;

    if (!fs.existsSync(diFilePath)) {
        // Fichier n'existe pas → création complète
        const content = `
${importStatements}\n

// Dependency Injection setup for all features

${setupStatements}

/*
    - Etc for other features
*/

// Export de l'objet featuresDi
export const featuresDi = {
    ${feature}Controller,
};
`;
        fs.mkdirSync(path.dirname(diFilePath), { recursive: true });
        fs.writeFileSync(diFilePath, content.trim());
        console.log(`Created features DI file: ${diFilePath}`);
    } else {
        // Fichier existe → append feature si pas déjà présent
        let currentContent = fs.readFileSync(diFilePath, 'utf8');

        if (currentContent.includes(`${feature}Controller`)) {
            console.log(`${feature}Controller already exists in featuresDi.`);
            return;
        }

        // 1️⃣ Ajouter les imports au tout début
        const lines = currentContent.split('\n');
        let firstNonImportIndex = lines.findIndex(line => !line.startsWith('import '));
        if (firstNonImportIndex === -1) firstNonImportIndex = lines.length;
        lines.splice(firstNonImportIndex, 0, importStatements.trim());
        currentContent = lines.join('\n');

        // 2️⃣ Ajouter la configuration DI avant l'export final
        const exportRegex = /export\s+const\s+featuresDi\s*=\s*{([\s\S]*?)}/m;
        if (exportRegex.test(currentContent)) {
            currentContent = currentContent.replace(exportRegex, (_, p1) => {
                const existing = p1.trim();
                const cleanedExisting = existing.replace(/,+\s*$/, ''); // enlève virgules finales
                return `export const featuresDi = {${cleanedExisting ? cleanedExisting + ',' : ''}\n    ${feature}Controller\n}`;
            });

            // Ajouter setupStatements juste avant l'export
            const exportIndex = currentContent.lastIndexOf('export const featuresDi');
            currentContent = currentContent.slice(0, exportIndex) + setupStatements + '\n' + currentContent.slice(exportIndex);
        } else {
            // Pas d'export → on ajoute à la fin
            currentContent += '\n' + setupStatements + `\nexport const featuresDi = {\n    ${feature}Controller\n};\n`;
        }

        fs.writeFileSync(diFilePath, currentContent);
        console.log(`Updated features DI file with feature: ${feature}`);
    }
}

const createFileContent = (feature, type) => {
    switch (type) {
        case 'actions':
            return `"use server";

import { featuresDi } from "@/di/features_di";
import { Entity${capitalize(feature)} } from "@/features/${feature}/domain/entities/entity_${feature}";
import { AppActionResult } from "@/shared/types/global";

/**
 *  Gets a ${feature} by id and returns an ActionResult with the ${feature} data or null if it does not exist.
 *  @param id The id of the ${feature} to get.
 *  @returns A Promise that resolves to an ActionResult with the ${feature} data or null if it does not exist.
 */
export async function get${capitalize(feature)}ByIdAction(id: string) : Promise<AppActionResult<Entity${capitalize(feature)} | null>> {
    const ${feature} = await featuresDi.${feature}Controller.get${capitalize(feature)}ById(id);
    if (${feature} === null) {
        return { success: false, message: "Error while getting ${feature} by id.", data: ${feature} };
    } else {
        return { success: true, message: "${capitalize(feature)} has been fetched.", data: ${feature} };
    }
}

`;
        case 'controller':
            return `// Controller pour la feature ${feature}\n
import { Entity${capitalize(feature)} } from "@/features/${feature}/domain/entities/entity_${feature}";
import { Get${capitalize(feature)}ByIdUseCase } from "@/features/${feature}/domain/usecases/get_${feature}_by_id_usecase";

/**
 *  This class is an adapter for the ${feature} feature.
 *  It acts as an interface between the application and the ${feature} feature.
 *  It provides methods to get a ${feature} by id and update a ${feature}.
 */
export class ${capitalize(feature)}Controller {
    /**
     *  Instantiates a new instance of the ${capitalize(feature)}Controller class.
     *  @param get${capitalize(feature)}ByIdUseCase The use case that gets a ${feature} by id.
     */
    constructor(
        private readonly get${capitalize(feature)}ByIdUseCase: Get${capitalize(feature)}ByIdUseCase,
    ) { }

    /**
     *  Gets a ${feature} by id.
     *  @param id The id of the ${feature} to get.
     *  @returns A Promise that resolves to the ${feature}, or null if it does not exist.
     */
    get${capitalize(feature)}ById = async (id: string): Promise<Entity${capitalize(feature)} | null> => {
        try {
            const res = await this.get${capitalize(feature)}ByIdUseCase.execute(id);
            return res;
        } catch (e) {
            console.log(\`Error while getting ${feature} by id: \${e}\`);
            return null;
        }
    }

}
`;
        case 'page':
            return `// Page ${feature}\n\nexport default function ${capitalize(feature)}Page() {\n  return <div>${feature} works!</div>;\n}\n`;
        case 'usecase':
            return `
import { Entity${capitalize(feature)} } from "../entities/entity_${feature}";
import { ${capitalize(feature)}Repository } from "../repositories/${feature}_repository";

/**
 *  Gets a ${feature} by id using the provided repository.
 *  @param id The id of the ${feature} to get.
 *  @returns A Promise that resolves to the ${feature}, or null if it does not exist.
 */
export class Get${capitalize(feature)}ByIdUseCase {
    constructor(private readonly repository: ${capitalize(feature)}Repository) { }

    /**
     *  Executes the use case.
     *  @param id The id of the ${feature} to retrieve.
     *  @returns A promise that resolves to the ${feature} with the given id, or null if it does not exist.
     */
    async execute(id: string): Promise<Entity${capitalize(feature)} | null> {
        return await this.repository.get${capitalize(feature)}ById(id);
    }
}
`;
        case 'entity':
            return `
/**
 * Entity${capitalize(feature)} is an interface that represents the structure of a ${feature} entity.
 * It contains the basic attributes of a ${feature}.
 * It is used to type the ${feature} entity in the UseCase.
 */
export interface Entity${capitalize(feature)} {
    id?: string | null;
    // Add other relevant fields here
}
`;
        case 'model':
            return `
import { Entity${capitalize(feature)} } from "../../domain/entities/entity_${feature}";

/**
 *  Model${capitalize(feature)} represents the ${feature} domain model implementing Entity${capitalize(feature)}.
 *  Offers helpers to construct from entities/JSON (single and list), serialize to JSON (with/without id),
 *  convert to entities (single and list), and clone via copyWith or fromPartialEntity.
 *  All properties are optional and may be null to support partial payloads across layers.
 */
export class Model${capitalize(feature)} implements Entity${capitalize(feature)} {

    id?: string | null;
    // Add other relevant fields here

    /**
     *  Creates a new Model${capitalize(feature)} instance from an Entity${capitalize(feature)} object.
     *  @param data An Entity${capitalize(feature)} object with the ${feature} data.
     */
    constructor(data: Entity${capitalize(feature)}) {
        Object.assign(this, data);
    }

    static fromEntity(entity: Entity${capitalize(feature)}): Model${capitalize(feature)} {
        return new Model${capitalize(feature)}({ id: entity.id });
    }

    toEntity(): Entity${capitalize(feature)} {
        return { id: this.id };
    }

    toJson(): Record<string, unknown> {
        return { id: this.id };
    }

    toJsonWithoutId(): Record<string, unknown> {
        return {};
    }

    static fromJson(json: Record<string, unknown>): Model${capitalize(feature)} {
        return new Model${capitalize(feature)}({ id: json.id as (string | null) });
    }

    static fromJsonList(jsonList: Record<string, unknown>[]): Model${capitalize(feature)}[] {
        return jsonList.map(json => Model${capitalize(feature)}.fromJson(json));
    }

    static fromEntities(entities: Entity${capitalize(feature)}[]): Model${capitalize(feature)}[] {
        return entities.map(Model${capitalize(feature)}.fromEntity);
    }

    static toEntities(models: Model${capitalize(feature)}[]): Entity${capitalize(feature)}[] {
        return models.map(model => model.toEntity());
    }

    copyWith(data: Partial<Entity${capitalize(feature)}>): Model${capitalize(feature)} {
        return new Model${capitalize(feature)}({
            ...this.toEntity(),
            ...data,
        });
    }

    public static fromPartialEntity(data: Partial<Entity${capitalize(feature)}>): Model${capitalize(feature)} {
        return new Model${capitalize(feature)}({
            ...this,
            ...data,
        });
    }
}
`;
        case 'repository':
            return `
import { Entity${capitalize(feature)} } from "../entities/entity_${feature}";

/**
 *  ${capitalize(feature)}Repository is an interface that represents the contract for a ${capitalize(feature)}
 *  repository.
 *  It contains methods to get a ${feature} by id and update a ${feature}.
 */
export interface ${capitalize(feature)}Repository {
    /**
     *  Gets a ${feature} by id.
     *  @param id The id of the ${feature} to get.
     *  @returns A Promise that resolves to the ${feature}, or null if it does not exist.
     */
    get${capitalize(feature)}ById(id: string): Promise<Entity${capitalize(feature)} | null>;

    /**
     *  Updates a ${feature}.
     *  @param ${feature} The ${feature} to update.
     *  @returns A Promise that resolves to the updated ${feature}, or null if it does not exist.
     */
    update${capitalize(feature)}(${feature}: Entity${capitalize(feature)}): Promise<Entity${capitalize(feature)} | null>;
}
`;
        case 'data_source':
            return `
import { Model${capitalize(feature)} } from "../models/model_${feature}";

/**
 *  ${capitalize(feature)}DataSource is an interface that defines the contract for a ${capitalize(feature)} data source.
 *  It specifies the methods that must be implemented by any data source that provides
 *  access to ${feature} data.
 */
export interface ${capitalize(feature)}DataSource {
    /**
     *  Gets a ${feature} by its id.
     *  @param id The id of the ${feature} to retrieve.
     *  @returns A Promise that resolves to the ${feature} with the given id, or null if the ${feature} does not exist.
     */
    get${capitalize(feature)}ById(id: string): Promise<Model${capitalize(feature)} | null>;

    /**
     *  Updates a ${feature}.
     *  @param ${feature} The ${feature} to update.
     *  @returns A Promise that resolves to the updated ${feature}, or null if the ${feature} does not exist.
     */
    update${capitalize(feature)}(${feature}: Model${capitalize(feature)}): Promise<Model${capitalize(feature)} | null>;
}
`;
        case 'repository_impl':
            return `
import { ${capitalize(feature)}DataSource } from "../datasources/${feature}_data_source";
import { Model${capitalize(feature)} } from "../models/model_${feature}";
import { Entity${capitalize(feature)} } from "../../domain/entities/entity_${feature}";
import { ${capitalize(feature)}Repository } from "../../domain/repositories/${feature}_repository";

/**
 *  Concrete implementation of ${capitalize(feature)}Repository for the ${feature} domain.
 *  Delegates data access to a ${capitalize(feature)}DataSource and maps between Model${capitalize(feature)} and Entity${capitalize(feature)}.
 *  Provides async methods to retrieve a ${feature} by id and update a ${feature}, propagating data source errors.
 */
export class ${capitalize(feature)}RepositoryImpl implements ${capitalize(feature)}Repository {

    private datasource: ${capitalize(feature)}DataSource;

    /**
     *  Constructor for the ${capitalize(feature)}RepositoryImpl class.
     *  @param datasource The ${capitalize(feature)}DataSource that is used to access the ${feature} data.
     */
    constructor(datasource: ${capitalize(feature)}DataSource) {
        this.datasource = datasource;
    }

    /**
     *  Gets a ${feature} by id.
     *  @param id The id of the ${feature} to get.
     *  @returns A Promise that resolves to the ${feature}, or null if the ${feature} does not exist.
     */
    async get${capitalize(feature)}ById(id: string): Promise<Entity${capitalize(feature)} | null> {
        try {
            const data = await this.datasource.get${capitalize(feature)}ById(id);
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    /**
     *  Updates a ${feature}.
     *  @param ${feature} The ${feature} to update.
     *  @returns A Promise that resolves to the updated ${feature}, or null if the ${feature} does not exist.
     */
    async update${capitalize(feature)}(${feature}: Entity${capitalize(feature)}): Promise<Entity${capitalize(feature)} | null> {
        try {
            const data = await this.datasource.update${capitalize(feature)}(Model${capitalize(feature)}.fromEntity(${feature}));
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

}
`;
        case 'rest_api_data_source_impl':
            return `
import { apiClient } from "@/lib/api/api_client";
import { Model${capitalize(feature)} } from "../models/model_${feature}";
import { ${capitalize(feature)}DataSource } from "./${feature}_data_source";
import { API_ROUTES } from "@/shared/constants/api_routes";

/**
 *  Skeleton implementation of a ${feature} data source using a REST API.
 *  Exposes methods to retrieve a ${feature} by ID and update ${feature} records; both are not yet implemented.
 *  @implements {${capitalize(feature)}DataSource}
 */
export class RestApi${capitalize(feature)}DataSourceImpl implements ${capitalize(feature)}DataSource {

    /**
     *  Gets a ${feature} by its id.
     *  @param id The id of the ${feature} to retrieve.
     *  @returns A Promise that resolves to the ${feature} with the given id, or null if it does not exist.
     */
    async get${capitalize(feature)}ById(id: string): Promise<Model${capitalize(feature)} | null> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(API_ROUTES.MOCK_${feature.toUpperCase()}.GET_BY_ID(id), {
                method: "GET",
            });

            if (error) {
                console.error("Error fetching ${feature}:", error);
                return null;
            }
            
            return data ? Model${capitalize(feature)}.fromJson(data) : null;
        } catch (error) {
            console.error("Error fetching ${feature}:", error);
            return null;
        }
    }

    /**
     *  Updates a ${feature}.
     *  @param ${feature} The ${feature} to update.
     *  @returns A Promise that resolves to the updated ${feature}, or null if it does not exist.
     */
    async update${capitalize(feature)}(${feature}: Model${capitalize(feature)}): Promise<Model${capitalize(feature)} | null> {
        throw new Error("Method not implemented.");
    }
}
`;
        case 'firebase_data_source_impl':
            return `
import { Model${capitalize(feature)} } from "../models/model_${feature}";
import { ${capitalize(feature)}DataSource } from "./${feature}_data_source";

/**
 *  Skeleton implementation of a ${feature} data source using a REST API.
 *  Exposes methods to retrieve a ${feature} by ID and update ${feature} records; both are not yet implemented.
 *  @implements {${capitalize(feature)}DataSource}
 */
export class Firebase${capitalize(feature)}DataSourceImpl implements ${capitalize(feature)}DataSource {

    /**
     *  Gets a ${feature} by its id.
     *  @param id The id of the ${feature} to retrieve.
     *  @returns A Promise that resolves to the ${feature} with the given id, or null if it does not exist.
     */
    async get${capitalize(feature)}ById(id: string): Promise<Model${capitalize(feature)} | null> {
        throw new Error("Method not implemented.");
    }

    /**
     *  Updates a ${feature}.
     *  @param ${feature} The ${feature} to update.
     *  @returns A Promise that resolves to the updated ${feature}, or null if it does not exist.
     */
    async update${capitalize(feature)}(${feature}: Model${capitalize(feature)}): Promise<Model${capitalize(feature)} | null> {
        throw new Error("Method not implemented.");
    }
}
`;
        case 'supabase_data_source_impl':
            return `
import { Model${capitalize(feature)} } from "../models/model_${feature}";
import { ${capitalize(feature)}DataSource } from "./${feature}_data_source";

/**
 *  Skeleton implementation of a ${feature} data source using a REST API.
 *  Exposes methods to retrieve a ${feature} by ID and update ${feature} records; both are not yet implemented.
 *  @implements {${capitalize(feature)}DataSource}
 */
export class Supabase${capitalize(feature)}DataSourceImpl implements ${capitalize(feature)}DataSource {

    /**
     *  Gets a ${feature} by its id.
     *  @param id The id of the ${feature} to retrieve.
     *  @returns A Promise that resolves to the ${feature} with the given id, or null if it does not exist.
     */
    async get${capitalize(feature)}ById(id: string): Promise<Model${capitalize(feature)} | null> {
        throw new Error("Method not implemented.");
    }

    /**
     *  Updates a ${feature}.
     *  @param ${feature} The ${feature} to update.
     *  @returns A Promise that resolves to the updated ${feature}, or null if it does not exist.
     */
    async update${capitalize(feature)}(${feature}: Model${capitalize(feature)}): Promise<Model${capitalize(feature)} | null> {
        throw new Error("Method not implemented.");
    }
}
`;
        case 'mongodb_data_source_impl':
            return `
import { Model${capitalize(feature)} } from "../models/model_${feature}";
import { ${capitalize(feature)}DataSource } from "./${feature}_data_source";

/**
 *  Skeleton implementation of a ${feature} data source using a REST API.
 *  Exposes methods to retrieve a ${feature} by ID and update ${feature} records; both are not yet implemented.
 *  @implements {${capitalize(feature)}DataSource}
 */
export class Mongodb${capitalize(feature)}DataSourceImpl implements ${capitalize(feature)}DataSource {

    /**
     *  Gets a ${feature} by its id.
     *  @param id The id of the ${feature} to retrieve.
     *  @returns A Promise that resolves to the ${feature} with the given id, or null if it does not exist.
     */
    async get${capitalize(feature)}ById(id: string): Promise<Model${capitalize(feature)} | null> {
        throw new Error("Method not implemented.");
    }

    /**
     *  Updates a ${feature}.
     *  @param ${feature} The ${feature} to update.
     *  @returns A Promise that resolves to the updated ${feature}, or null if it does not exist.
     */
    async update${capitalize(feature)}(${feature}: Model${capitalize(feature)}): Promise<Model${capitalize(feature)} | null> {
        throw new Error("Method not implemented.");
    }
}
`;
        case 'readme':
            return `
# ${capitalize(feature)} Feature

La feature **${capitalize(feature)}** centralise toute la logique métier et technique liée aux ${feature}(s) dans le projet.
Elle suit la **Clean Architecture** avec séparation claire entre **domaine** (métier) et **données** (implémentations techniques).

---

## 📌 Ce que cette feature permet

* ...
* ...

---

## 🏗️ Structure simplifiée

* **domain/** → Logique métier pure (entités, contrats, usecases, enums).
* **data/** → Implémentations concrètes (repositories, modèles, datasources).
* **${capitalize(feature)}\_README.md** → Documentation de la feature.

---

## 🧩 Composition : DataSource → Repository → UseCases → Controller

Pour utiliser les usecases dans l’application, il faut d’abord composer les différentes couches de la feature.

....

### ✅ Pourquoi cette composition est nécessaire ?

* **Découplage total** : Le ${capitalize(feature)}\`Controller\` ne dépend pas directement d’une techno (ex: Supabase). Il utilise uniquement les **usecases** définis au niveau du domaine.
* **Flexibilité** : Tu peux changer la source de données (\`SupabaseUserDataSourceImpl\` → \`MongoDBUserDataSourceImpl\`) sans modifier la logique métier.
* **Testabilité** : Tu peux injecter un **fake repository ou datasource** lors des tests, sans toucher au code métier.
* **Lisibilité** : Chaque couche a une responsabilité claire :

  * **Datasource** = accès aux données brutes
  * **Repository** = transformation en entités métier
  * **UseCases** = logique métier réutilisable
  * **Controller** = interface prête à l’emploi pour l’UI ou l’API

---

# ⚙️ User Use Cases

Les **use cases** définissent les actions métiers disponibles pour la gestion des utilisateurs.
Ils exposent une API claire et indépendante de l’implémentation technique (\`repository\`).

---

---

## 🚀 Bonnes pratiques

* Toujours injecter un **repository conforme à \`UserRepository\`** dans le constructeur.
* Centraliser les appels métiers dans ces usecases pour éviter de coupler la logique métier aux composants UI ou aux services externes.
* Manipuler uniquement des **\`EntityUser\`** (jamais de modèles \`data/models\`) dans le domaine.

---
`;
        default:
            return `// ${type} fichier pour la feature ${feature}\n`;
    }
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

async function createFeatureStructure(feature) {
    const rootPath = path.join(process.cwd(), 'src');

    const featurePath = path.join(rootPath, 'features', feature);
    const actionsPath = path.join(rootPath, 'actions', feature);
    const adaptersPath = path.join(rootPath, 'adapters', feature);

    const folders = [
        'data/datasources',
        'data/models',
        'data/repositories',
        'domain/entities',
        'domain/repositories',
        'domain/usecases',
    ];

    for (const folder of folders) {
        const fullPath = path.join(featurePath, folder);
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created folder: ${fullPath}`);
    }

    const exampleFiles = [
        { path: path.join(featurePath, 'data', 'datasources', `${feature}_data_source.ts`), content: createFileContent(feature, 'data_source') },
        { path: path.join(featurePath, 'data', 'datasources', `rest_api_${feature}_data_source_impl.ts`), content: createFileContent(feature, 'rest_api_data_source_impl') },
        { path: path.join(featurePath, 'data', 'datasources', `firebase_${feature}_data_source_impl.ts`), content: createFileContent(feature, 'firebase_data_source_impl') },
        { path: path.join(featurePath, 'data', 'datasources', `mongodb_${feature}_data_source_impl.ts`), content: createFileContent(feature, 'mongodb_data_source_impl') },
        { path: path.join(featurePath, 'data', 'datasources', `supabase_${feature}_data_source_impl.ts`), content: createFileContent(feature, 'supabase_data_source_impl') },
        { path: path.join(featurePath, 'data', 'models', `model_${feature}.ts`), content: createFileContent(feature, 'model') },
        { path: path.join(featurePath, 'data', 'repositories', `${feature}_repository_impl.ts`), content: createFileContent(feature, 'repository_impl') },

        { path: path.join(featurePath, 'domain', 'entities', `entity_${feature}.ts`), content: createFileContent(feature, 'entity') },
        { path: path.join(featurePath, 'domain', 'repositories', `${feature}_repository.ts`), content: createFileContent(feature, 'repository') },
        { path: path.join(featurePath, 'domain', 'usecases', `get_${feature}_by_id_usecase.ts`), content: createFileContent(feature, 'usecase') },
        { path: path.join(featurePath, 'domain', 'enums', `${feature}_enums.ts`), content: createFileContent(feature, 'enums') },

        { path: path.join(featurePath, 'types.ts'), content: createFileContent(feature, 'types') },
        { path: path.join(featurePath, `${capitalize(feature)}_README.md`), content: createFileContent(feature, 'readme') },

        { path: path.join(actionsPath, 'actions.ts'), content: createFileContent(feature, 'actions') },
        { path: path.join(adaptersPath, `${feature}_controller.ts`), content: createFileContent(feature, 'controller') },
    ];

    for (const file of exampleFiles) {
        // Crée le dossier parent si absent
        const dir = path.dirname(file.path);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created folder: ${dir}`);
        }

        try {
            fs.writeFileSync(file.path, file.content, { flag: 'wx' }); // fail si existe déjà
            console.log(`Created file: ${file.path}`);
        } catch (err) {
            if (err.code === 'EEXIST') {
                console.log(`File already exists: ${file.path}`);
            } else {
                throw err;
            }
        }
    }


    console.log('Feature structure created successfully!');
}

// Récupère toutes les features passées en arguments
const featureNames = process.argv.slice(2);

if (featureNames.length === 0) {
    console.error('Usage: node simple_feature_creator_script.js <featureName1> [<featureName2> ...]');
    process.exit(1);
}

// Boucle sur chaque feature et crée sa structure
for (const featureName of featureNames) {
    createFeatureStructure(featureName).catch(console.error);
    updateFeaturesDi(featureName);
}
