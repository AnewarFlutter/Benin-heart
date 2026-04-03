"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCasing = void 0;
/**
 * Collection d'utilitaires pour convertir une chaîne dans différents styles de casse.
 * Chaque fonction prend une chaîne en entrée (peu importe son format initial) et retourne
 * la version normalisée dans le style cible.
 *
 * Exemples d'usage :
 * ```ts
 * toCasing.camelCase("user-name_id");     // → "userNameId"
 * toCasing.camelCase("DeleteUser");       // → "deleteUser"
 * toCasing.kebabCase("UserNameId");       // → "user-name-id"
 * toCasing.snakeCase("UserNameId");       // → "user_name_id"
 * toCasing.pascalCase("user-name_id");    // → "UserNameId"
 * ```
 *
 * Les fonctions gèrent les séparateurs `-` (kebab) et `_` (snake) ainsi que les majuscules
 * (Pascal/Camel). Elles sont **déterministes** et **idempotentes** : appliquer plusieurs fois
 * la même fonction donne toujours le même résultat.
 */
exports.toCasing = {
    /**
     * Convertit en **camelCase**.
     * - Supprime les `-` et `_`.
     * - Met en majuscule la lettre qui suit chaque séparateur.
     * - **Force la première lettre en minuscule** (même si l'entrée est en PascalCase).
     *
     * @param s Chaîne source (ex: "DeleteUser", "delete-user")
     * @returns Chaîne en camelCase (ex: "deleteUser")
     */
    camelCase: (s) => {
        const step1 = s.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase());
        return step1.charAt(0).toLowerCase() + step1.slice(1);
    },
    /**
     * Convertit en **kebab-case**.
     * - Insère un tiret avant chaque majuscule.
     * - Met toute la chaîne en minuscules.
     * - Supprime un éventuel tiret en début de chaîne.
     *
     * @param s Chaîne source (ex: "UserNameId")
     * @returns Chaîne en kebab-case (ex: "user-name-id")
     */
    kebabCase: (s) => s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, ''),
    /**
     * Convertit en **snake_case**.
     * - Insère un underscore avant chaque majuscule.
     * - Met toute la chaîne en minuscules.
     * - Supprime un éventuel underscore en début de chaîne.
     *
     * @param s Chaîne source (ex: "UserNameId")
     * @returns Chaîne en snake_case (ex: "user_name_id")
     */
    snakeCase: (s) => s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''),
    /**
     * Convertit en **PascalCase**.
     * - Met la première lettre en majuscule.
     * - Supprime les `-` et `_`.
     * - Met en majuscule la lettre qui suit chaque séparateur.
     *
     * @param s Chaîne source (ex: "delete-user")
     * @returns Chaîne en PascalCase (ex: "DeleteUser")
     */
    pascalCase: (s) => {
        const camel = exports.toCasing.camelCase(s); // "userRoses"
        return camel.charAt(0).toUpperCase() + camel.slice(1); // "UserRoses"
    },
};
