// Schéma Zod pour valider le nouveau format YAML de configuration SCAF
// Couvre : ProjectName/Version, modules/features, entities (avec attributes/default/related), enums, usecases (params/returnType avec list/nullable/related)
// Améliorations suggérées : Ajouter 'relations' explicites pour hasOne/hasMany/belongsTo ; 'validations' par attribute (min/max/regex) ; 'indexes' pour DB.
import { z } from 'zod';

/**
 * Schemas Zod pour valider le nouveau format YAML de configuration API 
*/

const HttpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

/* ---------- Paramètres ---------- */
// ── 1. Base du schéma (sans récursivité) ──
const baseApiParamSchema = z.object({
    $type: z.enum(["string", "number", "boolean", "object", "array", "File"]),
    $list: z.boolean().optional().default(false),
    $optional: z.boolean().optional().default(false),
    $description: z.string().optional(),
    $examples: z.array(z.string()).optional(),
    $keyType: z.object({ $type: z.enum(["string", "number", "boolean", "object", "array", "File"]) }).optional(),
    // $items: z.object({ type: z.string() }).optional(),
});

// ── 2. Type TS complet (récursif) ──
export type ApiParam = z.infer<typeof baseApiParamSchema> & {
    $schema?: Record<string, ApiParam>;
    $items?: ApiParam;
    $valueType?: ApiParam;
};

// ── 3. Schéma Zod final avec récursivité ──
export const ApiParamSchema: z.ZodType<ApiParam> = z.lazy(() =>
    baseApiParamSchema.extend({
        $schema: z.record(z.string(), ApiParamSchema).optional(),
        $items: ApiParamSchema.optional(),
        $valueType: ApiParamSchema.optional(),
    })
);

const ApiParamsSchema = z
    .object({
        $query: z.record(z.string(), ApiParamSchema).optional(),
        $path: z.record(z.string(), ApiParamSchema).optional(),
        $body: z.record(z.string(), ApiParamSchema).optional(),
    })
    .refine(d => Object.values(d).some(v => v !== undefined), {
        message: "Au moins un type de paramètre (query, path, body) doit être défini",
    })
    .optional();

/* ---------- Réponses ---------- */
const HttpStatusKey = z.string().regex(/^(200|201|202|400|401|403|404|409|422|500|501|503)$/, {
    message: "Code HTTP autorisé : 200,201,202,400,401,403,404,409,422,500",
});

const ApiResponseByStatusSchema = z.object({
    $description: z.string().optional(),
    $schema: z.record(z.string().min(1), ApiParamSchema).refine(
        s => s && Object.keys(s).length > 0,
        { message: "`schema` obligatoire et non vide dans `byStatus`" }
    ),
    $mock: z.any().optional()
});

const ByStatusSchema = z.record(HttpStatusKey, ApiResponseByStatusSchema).optional();

const ApiResponseSchema = z.object({
    $default: z.object({
        $description: z.string().optional(),
        $schema: z.record(z.string().min(1), ApiParamSchema).refine(
            s => s && Object.keys(s).length > 0,
            { message: "`schema` obligatoire et non vide dans `response.default`" }
        ),
    }),
    $byStatus: ByStatusSchema,
});

/* ---------- Route ---------- */
export const ApiRouteSchema = z.object({
    $path: z.string().min(1, "Le chemin de la route est obligatoire"),
    $method: HttpMethodSchema.default("GET"),
    $description: z.string().optional(),
    $auth: z.boolean().default(true),
    $params: ApiParamsSchema,
    $isMultipart: z.boolean().default(false).optional(),
    $response: ApiResponseSchema.optional(),
    $skip: z.boolean().optional().default(false),
    $mockResponse: z.any().optional(),
    $mockParams: z.record(z.string(), z.any()).optional(),
});

/* ---------- Groupe & Config ---------- */
export const ApiGroupSchema = z.object({
    $description: z.string().optional(),
    $routes: z.record(z.string().min(1), ApiRouteSchema),
    $skip: z.boolean().optional().default(false),
});

const ApiConfigSchema = z.object({
    $baseUrl: z
        .object({
            $envVar: z.string().min(1, "La variable d'environnement est obligatoire"),
            $default: z.string().url("La valeur par défaut doit être une URL valide"),
        })
        .optional(),
    $endpoints: z.record(z.string().min(1), ApiGroupSchema).optional(),
    $version: z.string().min(1, "La version de l'API est obligatoire"),
    $description: z.string().optional(),
    $title: z.string().optional(),
    $environnement: z.enum(['dev', 'prod']).default('dev'),
    // 💡 Nouveau :PRECISE si on doit carrement sauter l'exécution de cette api
    $skip: z.boolean().optional().default(false),
}).refine(d => d.$baseUrl != null || d.$endpoints != null, {
    message: "Au moins `baseUrl` ou `endpoints` doit être défini dans `api`",
});

/**
 * Schemas Zod pour valider le nouveau format YAML de configuration
 */

// ----------- Implamentation du dataSource -----------

const ImplementationMappingSchema = z.object({
    $source: z.string(), // paramètre source
    $transform: z.string().optional(), // JS expression , ex: "ModelUser.fromJsonList(value)"
    $fallback: z.any().optional(), // autre paramètre
});

const ApiImplementationSchema = z.object({
    $type: z.literal("api"),
    $client: z.enum(["fetch", "axios"]).default("fetch"),
    $endpoint: z.string(), // ex: "AUTH.LOGIN"
    $mapping: z.object({
        $body: z.record(z.string(), z.union([z.string(), ImplementationMappingSchema])).optional(),
        $query: z.record(z.string(), z.union([z.string(), ImplementationMappingSchema])).optional(),
        $path: z.record(z.string(), z.union([z.string(), ImplementationMappingSchema])).optional(),
    }).optional(),
    $responseMapping: z.object({  // ← NOUVEAU : Mapping pour output
        $returnValue: z.union([z.string(), ImplementationMappingSchema]),  // Simple string (ex: "data") ou objet pour transform
    }).optional(),  // Optionnel → inférence si absent
});

const ImplementationSchema = z.union([
    z.literal("undefined"),
    z.literal("supabase"),
    z.literal("appwrite"),
    ApiImplementationSchema
]).default("undefined");

/**
 * Modules configurations
 */

const AttributeSchemaRelatedItem = z.object({
    $name: z.string(),
    $module: z.string(),
    $feature: z.string().optional(),
    $kind: z.enum(["entity", "model", "custom", "enum"]).optional().default("entity"),
});

// Nouveau : accepte string (ancien format) OU objet OU tableau d'objets
export const AttributeSchemaRelated = z.union([
    z.string(), // ancien format rapide : "User"
    AttributeSchemaRelatedItem,
    z.array(AttributeSchemaRelatedItem),
]);

const AttributeSchema = z.object({
    $name: z.string(),
    $type: z.string(),
    $optional: z.boolean().optional(),
    $nullable: z.boolean().optional(),
    $list: z.boolean().optional(),
    $default: z.union([z.string(), z.number(), z.boolean()]).optional(),
    $related: AttributeSchemaRelated.optional(), // feature liée (ex: user)
    $description: z.string().optional(), // description de l'attribut

    // AJOUT ICI : Valeur de mock personnalisée
    $mock: z.any().optional().describe("Valeur de mock pour génération automatique (tests, Storybook, preview)"),

    // Option alternative plus lisible (tu peux garder les deux)
    $mockValue: z.any().optional(),

    $rawMocksValue: z.boolean().optional().default(false),
});

const EnumSchema = z.object({
    $name: z.string(),
    $values: z.array(z.union([z.string(), z.number()])),
    $description: z.string().optional(),
    $splitPerFile: z.boolean().optional().default(false),
    $descriptions: z.record(z.string(), z.string()).optional(), // ← NOUVEAU : description par valeur
    $mock: z.array(z.union([z.string(), z.number()])).optional(),
    $rawMocksValue: z.boolean().optional().default(false)
});

const ParamSchema = z.object({
    $name: z.string(),
    $type: z.string(),
    $optional: z.boolean().optional(),
    $related: z.string().optional(), // Ajout pour matcher config (ex: sex avec related: user)
    $description: z.string().optional(),
});

const ReturnTypeSchema = z.object({
    $type: z.string(),
    $list: z.boolean().optional(),
    $nullable: z.boolean().optional(),
});

const UsecaseImportSchema = z.object({
    $name: z.string(), // Nom du type utilisé dans le code (ex: payload, EntityUser)
    $from: z.string().refine(
        (s) => s.startsWith("--module "),
        { message: "from must start with --module <module_name>" }
    ),
    $step: z.enum(["module", "feature"]).optional(),
    // Optionnel : forcer le kind (par défaut inféré)
    $kind: z.enum(["entity", "model", "custom", "enum"]).optional(),
});

const UsecaseSchema = z.object({
    $name: z.string(),
    $async: z.boolean().optional().default(true),
    $params: z.array(ParamSchema).optional().default([]),
    $returnType: ReturnTypeSchema.optional(),
    $related: z.string().optional(),
    $description: z.string().optional(),
    $returnDescription: z.string().optional(),

    // ← NOUVEAU : Déclaration explicite des imports
    $imports: z.array(UsecaseImportSchema).optional().default([]),
    $delete: z.boolean().optional().default(false),

    // 💡 Nouveau : précise si ce usecase doit être réécrit dans le controller
    $rewriteInController: z.boolean().optional().default(false), // 🔥 Nouveau

    // 💡 Nouveau : précise si ce usecase doit être réécrit dans le dataSourceImpl
    $rewriteInDataSourceImpl: z.boolean().optional().default(false),

    $implementationInDataSource: ImplementationSchema.optional(),

    $mockParams: z.record(z.string(), z.any()).optional(),
    $mockResponse: z.any().optional(),
    $rawMocksValue: z.boolean().optional().default(false)
});

const EntitySchema = z.object({
    $generate: z.boolean().optional().default(true),
    $name: z.string(),
    $model: z.string(),
    $parseFromJsonCaseType: z.enum(['camelCase', 'snakeCase', 'pascalCase', 'kebabCase']).optional().default('snakeCase'),
    $attributes: z.array(AttributeSchema),
    $overwrite: z.boolean().optional().default(false),
    // ✅ Nouveau : accepte string | number | objet
    $mocks: z.array(
        z.union([
            z.string(),
            z.number(),
            z.record(z.string(), z.any())  // ✅ clé string, valeur any
        ])
    ).optional(), 
    $rawMocksValue: z.boolean().optional().default(false)   
});

const CustomTypeSchema = z.object({
    $name: z.string(),
    $description: z.string().optional(),
    $attributes: z.array(AttributeSchema),
    $generate: z.boolean().optional().default(true),
    $mock: z.any().optional().describe("Valeur de mock pour génération automatique (tests, Storybook, preview)"),
    $mocks: z.array(
        z.union([
            z.string(),
            z.number(),
            z.record(z.string(), z.any())  // ✅ clé string, valeur any
        ])
    ).optional(),

    $rawMocksValue: z.boolean().optional().default(false),
});

const FeatureSchema = z.object({
    $name: z.string(),
    $entity: EntitySchema.optional(),
    $enums: z.array(EnumSchema).optional().default([]),
    $usecases: z.array(UsecaseSchema).optional().default([]),
    $types: z.array(CustomTypeSchema).optional().default([]),
    $override: z.boolean().optional().default(false),
    $delete: z.boolean().optional().default(false),

    // 💡 Nouveau :PRECISE si on doit carrement sauter l'exécution de la feature
    $skip: z.boolean().optional().default(false),

    // 💡 Nouveau : précise si le controller complet doit être régénéré
    $rewriteInController: z.boolean().optional().default(false), // ← NOUVEAU : Rewrite controller

    // 💡 Nouveau : précise si le dataSourceImpl complet doit être régénéré
    $rewriteInDataSourceImpl: z.boolean().optional().default(false),
});

const ModuleSchema = z.object({
    $name: z.string(),
    $features: z.array(FeatureSchema).optional().default([]),
    $types: z.array(CustomTypeSchema).optional().default([]), // ← NOUVEAU (niveau module)
    $enums: z.array(EnumSchema).optional().default([]),
    $override: z.boolean().optional().default(false),
    $fileNameCasing: z.enum(['camelCase', 'kebabCase', 'snakeCase', "pascalCase"]).optional().default('snakeCase'),
    $delete: z.boolean().optional().default(false),
    // 💡 Nouveau :PRECISE si on doit carrement sauter l'exécution du module
    $skip: z.boolean().optional().default(false),
});

const ModulesConfigSchema = z.object({
    $modules: z.array(ModuleSchema),
});

const PermissionItemSchema = z.object({
    $key: z.string().toUpperCase(),
    $value: z.string(),
    $description: z.string().optional(),
    $group: z.string().optional(),
    $available: z.boolean().default(true),
});

const PermissionGroupSchema = z.object({
    $name: z.string(),
    $description: z.string().optional(),
});

export const PermissionsConfigSchema = z
    .object({
        $overwrite: z.boolean().default(true),
        $fileNameCasing: z.enum(["kebabCase", "snakeCase", "camelCase", "pascalCase"]).default("snakeCase"),
        $enumName: z.string().default("UserPermission"),
        $constantName: z.string().default("APP_MODULES_STATES"),
        $groups: z.array(PermissionGroupSchema).optional(),
        $items: z.array(PermissionItemSchema).min(1),
        // 💡 Nouveau :PRECISE si on doit carrement sauter l'exécution de cette liste de permisions
        $skip: z.boolean().optional().default(false),
    })
    .optional();

const RolePermissionRefSchema = z.string()
    .regex(/^[A-Z_]+$/, "Doit être une clé de permission existante (ex: RESERVATION_CREATE)");

const RoleItemSchema = z.object({
    $key: z.string().regex(/^[A-Z_]+$/, "Doit être en UPPER_SNAKE_CASE"),
    $value: z.string().min(1, "Valeur du rôle obligatoire (ex: joueur, coach)"),
    $description: z.string().optional(),
    $level: z.number().int().min(0).max(99).default(1),
    $group: z.string().optional(),
    $available: z.boolean().default(true),

    // Référence aux $key des permissions (ex: RESERVATION_CREATE)
    $permissions: z.array(
        z.union([
            RolePermissionRefSchema,           // référence normale
            z.literal("*")                     // wildcard
        ])
    ).optional().default([]),
});

const RoleGroupSchema = z.object({
    $name: z.string().regex(/^[A-Z_]+$/, "Nom de groupe en UPPERCASE"),
    $description: z.string().optional(),
});

export const RolesConfigSchema = z.object({
    $override: z.boolean().default(false),
    $skip: z.boolean().default(false),
    $fileNameCasing: z.enum(["kebabCase", "snakeCase", "camelCase", "pascalCase"]).default("snakeCase"),
    $enumName: z.string().default("UserRole"),
    $constantName: z.string().default("ROLE_PERMISSIONS"),
    $groups: z.array(RoleGroupSchema).optional(),
    $items: z.array(RoleItemSchema).min(1),
}).optional();

const ProjectConfigSchema = z.object({
    $ProjectName: z.string({ message: "Nom de l'application (Obligatoire)" }),
    $Version: z.string({ message: "Version de l'application ex: 1.0.0 (Obligatoire)" }),
    $environnement: z.enum(['dev', 'prod']).optional().default('dev'),
    $Language: z.enum(['fr', 'en']).optional().default('en'),
    $DeploymentLanguage: z.enum(['local', 'docker']).optional().default('local'),
    $modules: z.array(ModuleSchema).optional(),
    $primaryApi: ApiConfigSchema.optional(),
    $otherApis: z.array(ApiConfigSchema).optional(),
    $permissions: PermissionsConfigSchema.optional(),
    $roles: RolesConfigSchema.optional(),
});

export type ProjectConfigSchema = z.infer<typeof ProjectConfigSchema>;
export type ApiConfigSchema = z.infer<typeof ApiConfigSchema>;
export type ApiImplementationSchema = z.infer<typeof ApiImplementationSchema>;
export type ModulesConfigSchema = z.infer<typeof ModulesConfigSchema>;
export type ModuleSchema = z.infer<typeof ModuleSchema>;
export type EntitySchema = z.infer<typeof EntitySchema>;
export type UsecaseImportSchema = z.infer<typeof UsecaseImportSchema>;
export type UsecaseSchema = z.infer<typeof UsecaseSchema>;
export type AttributeSchema = z.infer<typeof AttributeSchema>;
export type CustomTypeSchema = z.infer<typeof CustomTypeSchema>;
export type FeatureSchema = z.infer<typeof FeatureSchema>;
export type EnumSchema = z.infer<typeof EnumSchema>;
export type ParamSchema = z.infer<typeof ParamSchema>;
export type AttributeSchemaRelatedItem = z.infer<typeof AttributeSchemaRelatedItem>;
export type UseCaseSchema = z.infer<typeof UsecaseSchema>;

export function validateConfig(raw: unknown) {
    return ProjectConfigSchema.parse(raw);
}