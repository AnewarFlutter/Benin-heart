import { toCasing } from "../casing";

export const ReadmeModuleTemplate = (moduleName: string) => `# ${toCasing.pascalCase(moduleName)} Module

# Description et autres informations du module ici....
`;