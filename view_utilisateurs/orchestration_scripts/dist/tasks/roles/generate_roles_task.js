"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRolesTask = generateRolesTask;
const ts_morph_1 = require("ts-morph");
const path_1 = __importDefault(require("path"));
const ROLES_ENUM_PATH = path_1.default.join(process.cwd(), "src", "shared", "enums", "user_role.ts");
const ROLES_CONST_PATH = path_1.default.join(process.cwd(), "src", "shared", "constants", "values", "role_permissions.ts");
function generateRolesTask(config, project) {
    const rolesConfig = config.$roles;
    if (!rolesConfig?.$items?.length) {
        console.log("Aucune rôle défini → rien à faire.");
        return;
    }
    if (rolesConfig.$skip) {
        console.log("Rôles skipped → Skipped.");
        return;
    }
    const tsProject = project ?? new ts_morph_1.Project({ tsConfigFilePath: "tsconfig.json" });
    const enumName = rolesConfig.$enumName ?? "UserRole";
    const constName = rolesConfig.$constantName ?? "ROLE_PERMISSIONS";
    const overwrite = rolesConfig.$override ?? true;
    console.log(`Génération rôles → ${rolesConfig.$items.length} items | override: ${overwrite}`);
    const sorted = [...rolesConfig.$items].sort((a, b) => a.$key.localeCompare(b.$key));
    const groupDesc = new Map(rolesConfig.$groups?.map(g => [g.$name, g.$description ?? ""]) || []);
    // Validation croisée : toutes les permissions référencées existent-elles ?
    const permissionKeys = new Set(config.$permissions?.$items?.map(p => p.$key) || []);
    for (const role of sorted) {
        for (const perm of role.$permissions || []) {
            if (perm === "*")
                continue;
            if (!permissionKeys.has(perm)) {
                throw new Error(`Rôle ${role.$key} référence une permission inexistante : ${perm}\n` +
                    `Permissions disponibles : ${[...permissionKeys].join(", ")}`);
            }
        }
    }
    // ── 1. Enum UserRole ──
    if (overwrite) {
        const enumContent = `/**
 * ${enumName}
 * Liste exhaustive des rôles utilisateur.
 * Généré automatiquement via config.yml → roles
 */
export enum ${enumName} {
${sorted
            .map(item => {
            const lines = [];
            if (item.$group && item.$group !== (sorted[sorted.indexOf(item) - 1]?.$group ?? "")) {
                const desc = groupDesc.get(item.$group) ?? "";
                lines.push(`  // ── ${item.$group} ── ${desc}`);
            }
            const doc = item.$description ? `  /** ${item.$description} */\n` : "";
            lines.push(`${doc}  ${item.$key} = "${item.$value}",`);
            return lines.join("\n");
        })
            .join("\n")}
}
`.trim();
        tsProject.createSourceFile(ROLES_ENUM_PATH, enumContent + "\n", { overwrite: true });
    }
    else {
        // Mode merge incrémental
        const enumFile = tsProject.getSourceFile(ROLES_ENUM_PATH) ?? tsProject.createSourceFile(ROLES_ENUM_PATH);
        const enumDecl = enumFile.getEnum(enumName) ?? enumFile.addEnum({ name: enumName, isExported: true });
        const currentKeys = new Set(sorted.map(i => i.$key));
        let lastGroup = "";
        for (const item of sorted) {
            if (item.$group && item.$group !== lastGroup) {
                lastGroup = item.$group;
                const desc = groupDesc.get(item.$group) ?? "";
                enumDecl.addMember({ name: `// ── ${item.$group} ── ${desc}` });
            }
            const existing = enumDecl.getMember(item.$key);
            const doc = item.$description ? `/** ${item.$description} */` : "";
            if (existing) {
                existing.set({
                    initializer: `"${item.$value}"`,
                    docs: doc ? [{ description: doc }] : undefined,
                });
            }
            else {
                enumDecl.addMember({
                    name: item.$key,
                    initializer: `"${item.$value}"`,
                    docs: doc ? [{ description: doc }] : undefined,
                });
            }
        }
        // Nettoyage des rôles supprimés
        enumDecl.getMembers().forEach(m => {
            if (ts_morph_1.Node.isEnumMember(m) && !currentKeys.has(m.getName()))
                m.remove();
        });
    }
    // ── 2. Constante ROLE_PERMISSIONS (toujours overwrite complet) ──
    const constFile = tsProject.createSourceFile(ROLES_CONST_PATH, "", { overwrite: true });
    const activeRoles = sorted.filter(r => r.$available !== false);
    const roleBlocks = activeRoles.map(role => {
        const perms = role.$permissions || [];
        const hasWildcard = perms.includes("*");
        const permList = hasWildcard
            ? `["*"] as const`
            : perms.length
                ? `[\n    ${perms
                    .map(p => `UserPermission.${p}`)
                    .join(",\n    ")}\n  ] as const`
                : "[] as const";
        return `  [${enumName}.${role.$key}]: {
    level: ${role.$level ?? 1},
    permissions: ${permList},
  },`;
    });
    constFile.replaceWithText(`
        import { ${enumName} } from "@/shared/enums/user_role";
        import { UserPermission } from "@/shared/enums/auth";
        
        /**
         * Mapping rôle → permissions + niveau hiérarchique
         * Généré automatiquement via config.yml → roles
         */
        export const ${constName} = {
        ${roleBlocks.length ? roleBlocks.join("\n") : "  // Aucun rôle actif"}
        } as const;
        
        /** Type utilitaire : permissions d’un rôle */
        export type RolePermissions<T extends ${enumName}> = 
          typeof ${constName}[T]["permissions"] extends readonly ["*"] 
            ? "*" 
            : typeof ${constName}[T]["permissions"][number];
        
        /** Vérifie si un rôle a une permission (avec support wildcard) */
        export function HasRolePermissionCheck(
          role: ${enumName},
          permission: UserPermission
        ): boolean {
          const perms = ${constName}[role].permissions;
        
          // Cas wildcard : le tableau contient uniquement "*"
          if (perms.length === 1 && perms[0] === "*") {
            return true;
          }
        
          // Cas normal : on force le type pour éviter l'erreur TS sur l'union
          return (perms as readonly UserPermission[]).includes(permission);
        }
        `.trim() + "\n");
    // Formatage & sauvegarde
    tsProject.getSourceFiles([ROLES_ENUM_PATH, ROLES_CONST_PATH]).forEach(f => {
        f.organizeImports();
        f.formatText({ indentSize: 2, convertTabsToSpaces: true });
        f.saveSync();
    });
    console.log(`Rôles générés :
  → ${ROLES_ENUM_PATH}
  → ${ROLES_CONST_PATH}
  → ${sorted.length} rôles | override: ${overwrite}`);
}
