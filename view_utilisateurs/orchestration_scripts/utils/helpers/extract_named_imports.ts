/**
 * Extract named imports from a single import line.
 * @param {string} impLine - Single import line.
 * @returns {string[]} - Array of named imports.
 */
export function extractNamedImports(impLine: string): string[] {
    const match = impLine.match(/import\s*{\s*(.*?)\s*}\s*from/);
    if (!match) return [];
    return match[1].split(",").map((s) => s.trim());
}