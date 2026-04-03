"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureApiErrorImports = ensureApiErrorImports;
/**
 * Ensure that the given source file imports all the necessary API error classes.
 * If the import declaration does not exist, it will be created.
 * If the import declaration exists, but is missing some of the necessary classes,
 * they will be added.
 *
 * @param sourceFile The source file to ensure the imports in.
 */
function ensureApiErrorImports(sourceFile) {
    const ERROR_CLASSES = [
        "ApiError",
        "BadRequestError",
        "UnauthorizedError",
        "ForbiddenError",
        "NotFoundError",
        "ValidationError",
        "InternalServerError",
        "ServiceUnavailableError",
    ];
    const modulePath = "@/lib/api/api_errors";
    const importDecl = sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === modulePath);
    if (!importDecl) {
        // Aucun import → on crée
        sourceFile.addImportDeclaration({
            moduleSpecifier: modulePath,
            namedImports: ERROR_CLASSES,
        });
        return;
    }
    // Import existe → on récupère les namedImports actuels
    const currentNamed = importDecl.getNamedImports().map(n => n.getName());
    // On identifie les manquants
    const missing = ERROR_CLASSES.filter(cls => !currentNamed.includes(cls));
    if (missing.length > 0) {
        // On ajoute les manquants
        missing.forEach(cls => {
            importDecl.addNamedImport(cls);
        });
    }
}
