/**
 *  Enum containing the different application states.
 *
 *  The application can be in different states, such as online, maintenance, coming soon, down, read-only, or beta.
 *  Each state has a corresponding title and description in both French and English.
 *  The state also has a boolean property isBlocking, which indicates if the state should redirect the user to a static page.
 *  The state also has a boolean property isInternal, which indicates if the state is only for internal use (i.e. for developers).
 *  The state also has an optional image property, which is the path to an image that should be displayed in the app state.
 *
 *  @enum {string}
 */

export enum AppStatus {
    /*
        * The application is fully functional
        * L'application est pleinement opérationnelle
    */ 
    ONLINE = "online",
    /*
        * Planned or ongoing maintenance
        * Maintenance planifiée ou en cours
    */
    MAINTENANCE = "maintenance",
    /*
        * The product is not yet launched
        * Le produit n’est pas encore lancé
    */
    COMING_SOON = "coming_soon",
    /*
        * The application is temporarily unavailable
        * L'application rencontre un problème technique et est donc Hors-ligne pour cause inconnue ou crash
    */
    DOWN = "down",
    /*
        * The app is online but without writing capabilities
        * L'app est en ligne mais sans fonctionnalités d’écriture
    */
    READ_ONLY = "read_only",
    /*
        * Beta version or private test
        * Version de test ouverte ou privée
    */
    BETA = "beta",
    /*
        * Temporarily disabled
        * Désactivée temporairement (ex. : pour non-conformité)
    */
    SUSPENDED = "suspended",
    /*
        * Soft launch or early access
        * Lancement progressif (soft launch, early access)
    */
    LAUNCHING = "launching",
}
export const APP_STATUS_VALUES = Object.values(AppStatus);