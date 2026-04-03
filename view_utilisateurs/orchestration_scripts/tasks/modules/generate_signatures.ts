import { UsecaseSchema } from "../../config_validator";
import { mapParamToModelType } from "../../utils/functions/commons/map_params";

// NOUVELLE FONCTION : Générer signature de méthode pour repoImpl (avec mapping types pour params)

/**
 * Génère la signature d'une méthode pour le repository implémentant une uc.
 * La signature est composée de la description de l'ucase, du nom de l'ucase, des paramètres, du type de retour et de la promesse si l'ucase est asynchrone.
 * @param uc Le schéma de l'ucase.
 * @returns La signature de la méthode.
 */
export function generateRepoImplMethodSignature(uc: UsecaseSchema): string {
    const paramsSignature = uc.$params?.map(p => `${p.$name}${p.$optional ? '?' : ''}: ${p.$type}`).join(', ') || '';
    const returnType = uc.$returnType ? `${uc.$returnType.$type}${uc.$returnType.$list ? '[]' : ''}${uc.$returnType.$nullable ? ' | null' : ''}` : 'void';
    const isAsync = uc.$async ?? true;
    return `${uc.$description ? `    /**\n     * ${uc.$description}\n     */\n` : ''}    ${isAsync ? 'async' : ''} ${uc.$name}(${paramsSignature}): ${isAsync ? `Promise<${returnType}>` : returnType}`;
}


// Générer signature de méthode pour dsImpl (avec throw)

/**
 * Génère la signature d'une méthode pour dsImpl (avec throw)
 * La signature est composée de la description de l'ucase, du nom de l'ucase, des paramètres, du type de retour et de la promesse si l'ucase est asynchrone.
 * @param uc Le schéma de l'ucase.
 * @param featureName Le nom de la feature correspondant à l'entité.
 * @returns La signature de la méthode.
 */
export function generateDsImplMethodSignature(uc: UsecaseSchema, featureName: string): string {
    const paramsSignature = uc.$params?.map(p => `${p.$name}${p.$optional ? '?' : ''}: ${mapParamToModelType(p.$type, featureName)}`).join(', ') || '';
    const returnType = uc.$returnType ? `${mapParamToModelType(uc.$returnType.$type, featureName)}${uc.$returnType.$list ? '[]' : ''}${uc.$returnType.$nullable ? ' | null' : ''}` : 'void';
    const isAsync = uc.$async ?? true;
    return `${uc.$description ? `    /**\n     * ${uc.$description}\n     */\n` : ''}    ${isAsync ? 'async' : ''} ${uc.$name}(${paramsSignature}): ${isAsync ? `Promise<${returnType}>` : returnType}`;
}

// ────── Générer signature execute() → identique à la méthode repo ──────

/**
 * Génère la signature d'une méthode execute() qui appelle directement la méthode correspondante du repository.
 * La signature est composée de la description de l'ucase, du nom de l'ucase, des paramètres, du type de retour et de la promesse si l'ucase est asynchrone.
 * @param uc Le schéma de l'ucase.
 * @returns La signature de la méthode execute().
 */
export function generateExecuteSignature(uc: UsecaseSchema): string {
    const params = uc.$params?.map(p => `${p.$name}${p.$optional ? '?' : ''}: ${p.$type}`).join(', ') || '';
    const ret = uc.$returnType
        ? `${uc.$returnType.$type}${uc.$returnType.$list ? '[]' : ''}${uc.$returnType.$nullable ? ' | null' : ''}`
        : 'void';
    const async = uc.$async ?? true;
    return `${async ? 'async ' : ''}execute(${params}): ${async ? `Promise<${ret}>` : ret}`;
}