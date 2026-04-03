"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesConfigSchema = exports.PermissionsConfigSchema = exports.AttributeSchemaRelated = exports.ApiGroupSchema = exports.ApiRouteSchema = exports.ApiParamSchema = void 0;
exports.validateConfig = validateConfig;
// Schéma Zod pour valider le nouveau format YAML de configuration SCAF
// Couvre : ProjectName/Version, modules/features, entities (avec attributes/default/related), enums, usecases (params/returnType avec list/nullable/related)
// Améliorations suggérées : Ajouter 'relations' explicites pour hasOne/hasMany/belongsTo ; 'validations' par attribute (min/max/regex) ; 'indexes' pour DB.
const zod_1 = require("zod");
/**
 * Schemas Zod pour valider le nouveau format YAML de configuration API
*/
const HttpMethodSchema = zod_1.z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);
/* ---------- Paramètres ---------- */
// ── 1. Base du schéma (sans récursivité) ──
const baseApiParamSchema = zod_1.z.object({
    $type: zod_1.z.enum(["string", "number", "boolean", "object", "array", "File"]),
    $list: zod_1.z.boolean().optional().default(false),
    $optional: zod_1.z.boolean().optional().default(false),
    $description: zod_1.z.string().optional(),
    $examples: zod_1.z.array(zod_1.z.string()).optional(),
    $keyType: zod_1.z.object({ $type: zod_1.z.enum(["string", "number", "boolean", "object", "array", "File"]) }).optional(),
    // $items: z.object({ type: z.string() }).optional(),
});
// ── 3. Schéma Zod final avec récursivité ──
exports.ApiParamSchema = zod_1.z.lazy(() => baseApiParamSchema.extend({
    $schema: zod_1.z.record(zod_1.z.string(), exports.ApiParamSchema).optional(),
    $items: exports.ApiParamSchema.optional(),
    $valueType: exports.ApiParamSchema.optional(),
}));
const ApiParamsSchema = zod_1.z
    .object({
    $query: zod_1.z.record(zod_1.z.string(), exports.ApiParamSchema).optional(),
    $path: zod_1.z.record(zod_1.z.string(), exports.ApiParamSchema).optional(),
    $body: zod_1.z.record(zod_1.z.string(), exports.ApiParamSchema).optional(),
})
    .refine(d => Object.values(d).some(v => v !== undefined), {
    message: "Au moins un type de paramètre (query, path, body) doit être défini",
})
    .optional();
/* ---------- Réponses ---------- */
const HttpStatusKey = zod_1.z.string().regex(/^(200|201|202|400|401|403|404|409|422|500|501|503)$/, {
    message: "Code HTTP autorisé : 200,201,202,400,401,403,404,409,422,500",
});
const ApiResponseByStatusSchema = zod_1.z.object({
    $description: zod_1.z.string().optional(),
    $schema: zod_1.z.record(zod_1.z.string().min(1), exports.ApiParamSchema).refine(s => s && Object.keys(s).length > 0, { message: "`schema` obligatoire et non vide dans `byStatus`" }),
    $mock: zod_1.z.any().optional()
});
const ByStatusSchema = zod_1.z.record(HttpStatusKey, ApiResponseByStatusSchema).optional();
const ApiResponseSchema = zod_1.z.object({
    $default: zod_1.z.object({
        $description: zod_1.z.string().optional(),
        $schema: zod_1.z.record(zod_1.z.string().min(1), exports.ApiParamSchema).refine(s => s && Object.keys(s).length > 0, { message: "`schema` obligatoire et non vide dans `response.default`" }),
    }),
    $byStatus: ByStatusSchema,
});
/* ---------- Route ---------- */
exports.ApiRouteSchema = zod_1.z.object({
    $path: zod_1.z.string().min(1, "Le chemin de la route est obligatoire"),
    $method: HttpMethodSchema.default("GET"),
    $description: zod_1.z.string().optional(),
    $auth: zod_1.z.boolean().default(true),
    $params: ApiParamsSchema,
    $isMultipart: zod_1.z.boolean().default(false).optional(),
    $response: ApiResponseSchema.optional(),
    $skip: zod_1.z.boolean().optional().default(false),
    $mockResponse: zod_1.z.any().optional(),
    $mockParams: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
/* ---------- Groupe & Config ---------- */
exports.ApiGroupSchema = zod_1.z.object({
    $description: zod_1.z.string().optional(),
    $routes: zod_1.z.record(zod_1.z.string().min(1), exports.ApiRouteSchema),
    $skip: zod_1.z.boolean().optional().default(false),
});
const ApiConfigSchema = zod_1.z.object({
    $baseUrl: zod_1.z
        .object({
        $envVar: zod_1.z.string().min(1, "La variable d'environnement est obligatoire"),
        $default: zod_1.z.string().url("La valeur par défaut doit être une URL valide"),
    })
        .optional(),
    $endpoints: zod_1.z.record(zod_1.z.string().min(1), exports.ApiGroupSchema).optional(),
    $version: zod_1.z.string().min(1, "La version de l'API est obligatoire"),
    $description: zod_1.z.string().optional(),
    $title: zod_1.z.string().optional(),
    $environnement: zod_1.z.enum(['dev', 'prod']).default('dev'),
    // 💡 Nouveau :PRECISE si on doit carrement sauter l'exécution de cette api
    $skip: zod_1.z.boolean().optional().default(false),
}).refine(d => d.$baseUrl != null || d.$endpoints != null, {
    message: "Au moins `baseUrl` ou `endpoints` doit être défini dans `api`",
});
/**
 * Schemas Zod pour valider le nouveau format YAML de configuration
 */
// ----------- Implamentation du dataSource -----------
const ImplementationMappingSchema = zod_1.z.object({
    $source: zod_1.z.string(), // paramètre source
    $transform: zod_1.z.string().optional(), // JS expression , ex: "ModelUser.fromJsonList(value)"
    $fallback: zod_1.z.any().optional(), // autre paramètre
});
const ApiImplementationSchema = zod_1.z.object({
    $type: zod_1.z.literal("api"),
    $client: zod_1.z.enum(["fetch", "axios"]).default("fetch"),
    $endpoint: zod_1.z.string(), // ex: "AUTH.LOGIN"
    $mapping: zod_1.z.object({
        $body: zod_1.z.record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), ImplementationMappingSchema])).optional(),
        $query: zod_1.z.record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), ImplementationMappingSchema])).optional(),
        $path: zod_1.z.record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), ImplementationMappingSchema])).optional(),
    }).optional(),
    $responseMapping: zod_1.z.object({
        $returnValue: zod_1.z.union([zod_1.z.string(), ImplementationMappingSchema]), // Simple string (ex: "data") ou objet pour transform
    }).optional(), // Optionnel → inférence si absent
});
const ImplementationSchema = zod_1.z.union([
    zod_1.z.literal("undefined"),
    zod_1.z.literal("supabase"),
    zod_1.z.literal("appwrite"),
    ApiImplementationSchema
]).default("undefined");
/**
 * Modules configurations
 */
const AttributeSchemaRelatedItem = zod_1.z.object({
    $name: zod_1.z.string(),
    $module: zod_1.z.string(),
    $feature: zod_1.z.string().optional(),
    $kind: zod_1.z.enum(["entity", "model", "custom", "enum"]).optional().default("entity"),
});
// Nouveau : accepte string (ancien format) OU objet OU tableau d'objets
exports.AttributeSchemaRelated = zod_1.z.union([
    zod_1.z.string(), // ancien format rapide : "User"
    AttributeSchemaRelatedItem,
    zod_1.z.array(AttributeSchemaRelatedItem),
]);
const AttributeSchema = zod_1.z.object({
    $name: zod_1.z.string(),
    $type: zod_1.z.string(),
    $optional: zod_1.z.boolean().optional(),
    $nullable: zod_1.z.boolean().optional(),
    $list: zod_1.z.boolean().optional(),
    $default: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()]).optional(),
    $related: exports.AttributeSchemaRelated.optional(), // feature liée (ex: user)
    $description: zod_1.z.string().optional(), // description de l'attribut
    // AJOUT ICI : Valeur de mock personnalisée
    $mock: zod_1.z.any().optional().describe("Valeur de mock pour génération automatique (tests, Storybook, preview)"),
    // Option alternative plus lisible (tu peux garder les deux)
    $mockValue: zod_1.z.any().optional(),
    $rawMocksValue: zod_1.z.boolean().optional().default(false),
});
const EnumSchema = zod_1.z.object({
    $name: zod_1.z.string(),
    $values: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])),
    $description: zod_1.z.string().optional(),
    $splitPerFile: zod_1.z.boolean().optional().default(false),
    $descriptions: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(), // ← NOUVEAU : description par valeur
    $mock: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).optional(),
    $rawMocksValue: zod_1.z.boolean().optional().default(false)
});
const ParamSchema = zod_1.z.object({
    $name: zod_1.z.string(),
    $type: zod_1.z.string(),
    $optional: zod_1.z.boolean().optional(),
    $related: zod_1.z.string().optional(), // Ajout pour matcher config (ex: sex avec related: user)
    $description: zod_1.z.string().optional(),
});
const ReturnTypeSchema = zod_1.z.object({
    $type: zod_1.z.string(),
    $list: zod_1.z.boolean().optional(),
    $nullable: zod_1.z.boolean().optional(),
});
const UsecaseImportSchema = zod_1.z.object({
    $name: zod_1.z.string(), // Nom du type utilisé dans le code (ex: payload, EntityUser)
    $from: zod_1.z.string().refine((s) => s.startsWith("--module "), { message: "from must start with --module <module_name>" }),
    $step: zod_1.z.enum(["module", "feature"]).optional(),
    // Optionnel : forcer le kind (par défaut inféré)
    $kind: zod_1.z.enum(["entity", "model", "custom", "enum"]).optional(),
});
const UsecaseSchema = zod_1.z.object({
    $name: zod_1.z.string(),
    $async: zod_1.z.boolean().optional().default(true),
    $params: zod_1.z.array(ParamSchema).optional().default([]),
    $returnType: ReturnTypeSchema.optional(),
    $related: zod_1.z.string().optional(),
    $description: zod_1.z.string().optional(),
    $returnDescription: zod_1.z.string().optional(),
    // ← NOUVEAU : Déclaration explicite des imports
    $imports: zod_1.z.array(UsecaseImportSchema).optional().default([]),
    $delete: zod_1.z.boolean().optional().default(false),
    // 💡 Nouveau : précise si ce usecase doit être réécrit dans le controller
    $rewriteInController: zod_1.z.boolean().optional().default(false), // 🔥 Nouveau
    // 💡 Nouveau : précise si ce usecase doit être réécrit dans le dataSourceImpl
    $rewriteInDataSourceImpl: zod_1.z.boolean().optional().default(false),
    $implementationInDataSource: ImplementationSchema.optional(),
    $mockParams: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    $mockResponse: zod_1.z.any().optional(),
    $rawMocksValue: zod_1.z.boolean().optional().default(false)
});
const EntitySchema = zod_1.z.object({
    $generate: zod_1.z.boolean().optional().default(true),
    $name: zod_1.z.string(),
    $model: zod_1.z.string(),
    $parseFromJsonCaseType: zod_1.z.enum(['camelCase', 'snakeCase', 'pascalCase', 'kebabCase']).optional().default('snakeCase'),
    $attributes: zod_1.z.array(AttributeSchema),
    $overwrite: zod_1.z.boolean().optional().default(false),
    // ✅ Nouveau : accepte string | number | objet
    $mocks: zod_1.z.array(zod_1.z.union([
        zod_1.z.string(),
        zod_1.z.number(),
        zod_1.z.record(zod_1.z.string(), zod_1.z.any()) // ✅ clé string, valeur any
    ])).optional(),
    $rawMocksValue: zod_1.z.boolean().optional().default(false)
});
const CustomTypeSchema = zod_1.z.object({
    $name: zod_1.z.string(),
    $description: zod_1.z.string().optional(),
    $attributes: zod_1.z.array(AttributeSchema),
    $generate: zod_1.z.boolean().optional().default(true),
    $mock: zod_1.z.any().optional().describe("Valeur de mock pour génération automatique (tests, Storybook, preview)"),
    $mocks: zod_1.z.array(zod_1.z.union([
        zod_1.z.string(),
        zod_1.z.number(),
        zod_1.z.record(zod_1.z.string(), zod_1.z.any()) // ✅ clé string, valeur any
    ])).optional(),
    $rawMocksValue: zod_1.z.boolean().optional().default(false),
});
const FeatureSchema = zod_1.z.object({
    $name: zod_1.z.string(),
    $entity: EntitySchema.optional(),
    $enums: zod_1.z.array(EnumSchema).optional().default([]),
    $usecases: zod_1.z.array(UsecaseSchema).optional().default([]),
    $types: zod_1.z.array(CustomTypeSchema).optional().default([]),
    $override: zod_1.z.boolean().optional().default(false),
    $delete: zod_1.z.boolean().optional().default(false),
    // 💡 Nouveau :PRECISE si on doit carrement sauter l'exécution de la feature
    $skip: zod_1.z.boolean().optional().default(false),
    // 💡 Nouveau : précise si le controller complet doit être régénéré
    $rewriteInController: zod_1.z.boolean().optional().default(false), // ← NOUVEAU : Rewrite controller
    // 💡 Nouveau : précise si le dataSourceImpl complet doit être régénéré
    $rewriteInDataSourceImpl: zod_1.z.boolean().optional().default(false),
});
const ModuleSchema = zod_1.z.object({
    $name: zod_1.z.string(),
    $features: zod_1.z.array(FeatureSchema).optional().default([]),
    $types: zod_1.z.array(CustomTypeSchema).optional().default([]), // ← NOUVEAU (niveau module)
    $enums: zod_1.z.array(EnumSchema).optional().default([]),
    $override: zod_1.z.boolean().optional().default(false),
    $fileNameCasing: zod_1.z.enum(['camelCase', 'kebabCase', 'snakeCase', "pascalCase"]).optional().default('snakeCase'),
    $delete: zod_1.z.boolean().optional().default(false),
    // 💡 Nouveau :PRECISE si on doit carrement sauter l'exécution du module
    $skip: zod_1.z.boolean().optional().default(false),
});
const ModulesConfigSchema = zod_1.z.object({
    $modules: zod_1.z.array(ModuleSchema),
});
const PermissionItemSchema = zod_1.z.object({
    $key: zod_1.z.string().toUpperCase(),
    $value: zod_1.z.string(),
    $description: zod_1.z.string().optional(),
    $group: zod_1.z.string().optional(),
    $available: zod_1.z.boolean().default(true),
});
const PermissionGroupSchema = zod_1.z.object({
    $name: zod_1.z.string(),
    $description: zod_1.z.string().optional(),
});
exports.PermissionsConfigSchema = zod_1.z
    .object({
    $overwrite: zod_1.z.boolean().default(true),
    $fileNameCasing: zod_1.z.enum(["kebabCase", "snakeCase", "camelCase", "pascalCase"]).default("snakeCase"),
    $enumName: zod_1.z.string().default("UserPermission"),
    $constantName: zod_1.z.string().default("APP_MODULES_STATES"),
    $groups: zod_1.z.array(PermissionGroupSchema).optional(),
    $items: zod_1.z.array(PermissionItemSchema).min(1),
    // 💡 Nouveau :PRECISE si on doit carrement sauter l'exécution de cette liste de permisions
    $skip: zod_1.z.boolean().optional().default(false),
})
    .optional();
const RolePermissionRefSchema = zod_1.z.string()
    .regex(/^[A-Z_]+$/, "Doit être une clé de permission existante (ex: RESERVATION_CREATE)");
const RoleItemSchema = zod_1.z.object({
    $key: zod_1.z.string().regex(/^[A-Z_]+$/, "Doit être en UPPER_SNAKE_CASE"),
    $value: zod_1.z.string().min(1, "Valeur du rôle obligatoire (ex: joueur, coach)"),
    $description: zod_1.z.string().optional(),
    $level: zod_1.z.number().int().min(0).max(99).default(1),
    $group: zod_1.z.string().optional(),
    $available: zod_1.z.boolean().default(true),
    // Référence aux $key des permissions (ex: RESERVATION_CREATE)
    $permissions: zod_1.z.array(zod_1.z.union([
        RolePermissionRefSchema, // référence normale
        zod_1.z.literal("*") // wildcard
    ])).optional().default([]),
});
const RoleGroupSchema = zod_1.z.object({
    $name: zod_1.z.string().regex(/^[A-Z_]+$/, "Nom de groupe en UPPERCASE"),
    $description: zod_1.z.string().optional(),
});
exports.RolesConfigSchema = zod_1.z.object({
    $override: zod_1.z.boolean().default(false),
    $skip: zod_1.z.boolean().default(false),
    $fileNameCasing: zod_1.z.enum(["kebabCase", "snakeCase", "camelCase", "pascalCase"]).default("snakeCase"),
    $enumName: zod_1.z.string().default("UserRole"),
    $constantName: zod_1.z.string().default("ROLE_PERMISSIONS"),
    $groups: zod_1.z.array(RoleGroupSchema).optional(),
    $items: zod_1.z.array(RoleItemSchema).min(1),
}).optional();
const ProjectConfigSchema = zod_1.z.object({
    $ProjectName: zod_1.z.string({ message: "Nom de l'application (Obligatoire)" }),
    $Version: zod_1.z.string({ message: "Version de l'application ex: 1.0.0 (Obligatoire)" }),
    $environnement: zod_1.z.enum(['dev', 'prod']).optional().default('dev'),
    $Language: zod_1.z.enum(['fr', 'en']).optional().default('en'),
    $DeploymentLanguage: zod_1.z.enum(['local', 'docker']).optional().default('local'),
    $modules: zod_1.z.array(ModuleSchema).optional(),
    $primaryApi: ApiConfigSchema.optional(),
    $otherApis: zod_1.z.array(ApiConfigSchema).optional(),
    $permissions: exports.PermissionsConfigSchema.optional(),
    $roles: exports.RolesConfigSchema.optional(),
});
function validateConfig(raw) {
    return ProjectConfigSchema.parse(raw);
}
