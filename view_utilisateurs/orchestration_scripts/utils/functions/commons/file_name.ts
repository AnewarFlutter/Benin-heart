import { toCasing } from "../../casing";
import { CasingStyle } from "../../types";


/**
 * Retourne le nom du fichier selon le style du module.
 * @param style Casing du module
 * @param baseName Nom de base (ex: "userProfile")
 */
export const getFileName = (style: CasingStyle, baseName: string): string => {
    const normalized = toCasing.camelCase(baseName);
    return toCasing[style](normalized);
};