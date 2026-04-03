"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtraLoremValue = exports.MediumLoremValue = exports.MiniLoremValue = exports.placeholderMethods = void 0;
exports.getDefaultValueForType = getDefaultValueForType;
/**
 * Retourne une valeur par défaut TypeScript pour un type donné.
 * Utilisé pour initialiser les champs dans les entités, modèles, etc.
 *
 * Exemples :
 * ```ts
 * getDefaultValueForType("string")        // → '""'
 * getDefaultValueForType("Date")          // → 'new Date()'
 * getDefaultValueForType("boolean")       // → 'false'
 * getDefaultValueForType("UserStatus")    // → 'UserStatus.Active'
 * getDefaultValueForType("EntityUser")    // → 'null'  (entity = référence)
 * getDefaultValueForType("EntityUser[]")  // → '[]'
 * ```
 *
 * @param type Le type sous forme de string (ex: "string", "Date", "EntityUser[]")
 * @param enumValues Map des enums { EnumName: string[] } pour deviner la valeur par défaut
 * @returns Chaîne représentant une valeur par défaut valide en TS
 */
function getDefaultValueForType(type, enumValues = new Map()) {
    // Nettoyer le type
    const trimmed = type.trim();
    // const isOptional = trimmed.endsWith('?');
    const isNullable = trimmed.includes(' | null');
    const cleanType = trimmed.replace(/[?\s| null]+$/, '');
    // Cas : array
    if (cleanType.endsWith('[]')) {
        return '[]';
    }
    // Cas : union avec null → on retourne null par défaut
    if (isNullable) {
        return 'null';
    }
    // Primitifs
    switch (cleanType) {
        case 'string':
            return '""';
        case 'number':
        case 'bigint':
            return '0';
        case 'boolean':
            return 'false';
        case 'Date':
            return 'new Date()';
        case 'any':
        case 'unknown':
        case 'Record<string, any>':
        case 'Record<string, unknown>':
            return '{}';
        case 'void':
            return ''; // pas de valeur
    }
    // Cas : enum connu
    const enumMatch = enumValues.get(cleanType);
    if (enumMatch && enumMatch.length > 0) {
        // Prend la première valeur comme défaut (souvent Active, Pending, etc.)
        return `${cleanType}.${enumMatch[0].split('.').pop()}`;
    }
    // Cas : entity ou type personnalisé → référence → null par défaut
    if (/^Entity[A-Z]/.test(cleanType) || /^[A-Z][a-zA-Z]*$/.test(cleanType)) {
        return 'null';
    }
    // Fallback sécurisé
    return 'undefined';
}
;
exports.placeholderMethods = `// Méthodes générées dynamiquement`;
function loremIpsum(options) {
    if (options.units === "words")
        return "Sunt ex magna sint consequat est.";
    else if (options.units === "sentences")
        return "Cupidatat consectetur laboris qui reprehenderit irure magna ut quis nisi id officia pariatur sit ex.";
    else {
        if (options.count === 1)
            return `Eu mollit laboris dolor eu occaecat do proident eu culpa mollit sunt sit anim fugiat. Nulla nostrud excepteur amet qui ipsum. Mollit sunt eu sit est anim voluptate cillum proident do. Et consequat sint cillum labore consectetur occaecat ipsum velit cupidatat dolor. Dolore commodo est mollit labore Lorem Lorem non amet quis anim deserunt est. Fugiat esse commodo laborum in.
Velit excepteur qui occaecat est minim laboris cupidatat magna nulla. Aliquip ut cillum sint aute elit consectetur dolor ipsum amet nulla est officia cillum amet. Cillum ea reprehenderit non culpa pariatur quis dolor minim mollit et deserunt. Commodo do do consectetur laboris minim nisi et duis nisi duis veniam dolore duis tempor. Proident excepteur anim ea id in cupidatat in labore duis ex aliqua deserunt.`;
        if (options.count === 2)
            return `Aute commodo eiusmod laboris consequat ex. Qui quis non aliqua cupidatat officia. Nostrud aliqua dolor veniam aliqua ullamco sint culpa eiusmod. Est ad minim proident dolore mollit ipsum dolor labore eiusmod ut.

Dolore id minim ea ullamco consequat. Ex ad excepteur ea et sunt incididunt in dolore quis deserunt proident laborum occaecat. Qui amet mollit aliqua eiusmod elit ad reprehenderit deserunt voluptate est labore pariatur nostrud pariatur.

Duis elit exercitation culpa et laboris cillum laboris amet ea nisi. Tempor amet adipisicing nostrud adipisicing officia. Eiusmod ex ipsum consequat labore tempor enim. Ullamco non sit consequat minim non deserunt.`;
        else
            return `In ipsum proident nulla occaecat nostrud duis laborum deserunt id pariatur sunt eu. Laborum velit excepteur eu culpa do cillum. Officia veniam nostrud aliquip commodo nulla officia ullamco cupidatat dolore deserunt ea eu.

Aliquip culpa laboris consequat ad elit ad occaecat ut. Amet sunt tempor quis ad laboris sit ex sunt labore ullamco esse aliqua et. Aliquip pariatur sit occaecat dolor culpa. Exercitation exercitation cillum magna minim ea voluptate officia.

Culpa pariatur anim aliquip exercitation velit. Labore ipsum occaecat eu ullamco nulla adipisicing deserunt et aliquip eiusmod aute. Et sunt anim occaecat aute. Occaecat qui exercitation minim duis incididunt cillum duis eu cupidatat in aliqua.

Aliquip consequat esse excepteur et irure. Sint adipisicing eu nostrud cillum qui cupidatat qui. Deserunt incididunt magna quis est minim incididunt consectetur in qui ea voluptate. Laborum nulla sint pariatur cillum ut irure cillum ex ut.

Excepteur excepteur mollit ipsum veniam ex ipsum. Sint nulla irure exercitation sunt consectetur occaecat. Voluptate eu excepteur dolore consequat sunt magna ea cillum qui eiusmod ea anim in consectetur. Nisi nisi consectetur amet elit non aliqua fugiat dolore laboris ea ullamco officia ad mollit. Reprehenderit dolor id non adipisicing fugiat aute ad sit. Aute sunt cupidatat qui incididunt tempor exercitation exercitation in do voluptate.

Ad fugiat sit adipisicing consequat consequat tempor fugiat sunt consectetur aliquip irure culpa ex. Aliqua adipisicing fugiat fugiat sunt pariatur officia quis commodo reprehenderit. Culpa dolor sint culpa id in esse officia do nulla consequat aute. Quis amet id minim sit sint occaecat aliquip do esse.

Adipisicing culpa non Lorem occaecat pariatur elit fugiat. Consequat non voluptate minim labore eiusmod sit sint adipisicing duis eu ullamco. Proident irure nisi laboris Lorem consectetur labore anim adipisicing. Laborum in exercitation velit duis sit nostrud labore ullamco aliquip fugiat.`;
    }
}
exports.MiniLoremValue = loremIpsum({ count: 1, units: 'paragraphs' });
exports.MediumLoremValue = loremIpsum({ count: 2, units: 'paragraphs' });
exports.ExtraLoremValue = loremIpsum({ count: 5, units: 'paragraphs' });
