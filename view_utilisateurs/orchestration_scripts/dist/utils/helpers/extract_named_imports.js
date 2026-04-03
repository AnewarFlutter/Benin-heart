"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNamedImports = extractNamedImports;
/**
 * Extract named imports from a single import line.
 * @param {string} impLine - Single import line.
 * @returns {string[]} - Array of named imports.
 */
function extractNamedImports(impLine) {
    const match = impLine.match(/import\s*{\s*(.*?)\s*}\s*from/);
    if (!match)
        return [];
    return match[1].split(",").map((s) => s.trim());
}
