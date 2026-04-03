export const ActionsTemplate = (module: string, feature: string) => `\
"use server";

/**
 * Ficher action prévu pour le module **${module}** et la feature **${feature}**.
 * Actions utilisées par les composants React pour interagir avec les UseCases via les controllers.
 * N'appelez pas de UseCases directement ici, mais via les controllers.
 * N'appelez jamais les controller depuis les composants React, seulement depuis les fichiers actions.
 */
`