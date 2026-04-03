"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileName = void 0;
const casing_1 = require("../../casing");
/**
 * Retourne le nom du fichier selon le style du module.
 * @param style Casing du module
 * @param baseName Nom de base (ex: "userProfile")
 */
const getFileName = (style, baseName) => {
    const normalized = casing_1.toCasing.camelCase(baseName);
    return casing_1.toCasing[style](normalized);
};
exports.getFileName = getFileName;
