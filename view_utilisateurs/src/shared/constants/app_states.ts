import { AppStatus } from "../enums/app_status";
import { AppStateContent } from "../types/global";

/**
 * @file This file contains the metadata for the different app states.
 *
 * It exports a constant `APP_STATUS_METADATA` which is a record of `AppStatus` to `AppStateContent`.
 * The `AppStateContent` type represents the content of an app state.
 * It contains the title and description of the app state in both French and English.
 * It also contains a boolean `isBlocking` property, which indicates if the app state should redirect the user to a static page.
 * It also contains a boolean `isInternal` property, which indicates if the app state is only for internal use (i.e. for developers).
 *
 * @constant
 * @type {Record<AppStatus, AppStateContent>}
 */

export const APP_STATUS_METADATA: Record<AppStatus, AppStateContent> = {
  [AppStatus.ONLINE]: {
    titleFr: "Bienvenue 👋",
    descriptionFr: "L'application est pleinement opérationnelle. Vous pouvez naviguer librement.",
    titleEn: "Welcome 👋",
    descriptionEn: "The app is fully operational. You can browse freely.",
    isBlocking: false,
    isInternal: true,
  },
  [AppStatus.MAINTENANCE]: {
    titleFr: "Maintenance en cours 🔧",
    descriptionFr: "Nous effectuons actuellement une maintenance. Revenez dans quelques instants.",
    titleEn: "Under Maintenance 🔧",
    descriptionEn: "We are currently performing maintenance. Please check back shortly.",
    isBlocking: true,
    isInternal: false,
  },
  [AppStatus.COMING_SOON]: {
    titleFr: "Bientôt disponible 🚀",
    descriptionFr: "Notre application arrive très bientôt. Restez connecté pour ne rien rater.",
    titleEn: "Coming Soon 🚀",
    descriptionEn: "Our app is launching very soon. Stay tuned for updates.",
    isBlocking: true,
    isInternal: false,
  },
  [AppStatus.DOWN]: {
    titleFr: "Indisponible temporairement ⚠️",
    descriptionFr: "L'application rencontre un problème technique. Nous travaillons à un retour rapide.",
    titleEn: "Temporarily Unavailable ⚠️",
    descriptionEn: "The app is facing a technical issue. We're working to bring it back soon.",
    isBlocking: true,
    isInternal: false,
  },
  [AppStatus.READ_ONLY]: {
    titleFr: "Mode consultation uniquement 👀",
    descriptionFr: "Certaines fonctionnalités sont temporairement désactivées. Vous pouvez naviguer, mais pas interagir.",
    titleEn: "Read-Only Mode 👀",
    descriptionEn: "Some features are temporarily disabled. You can browse, but not interact.",
    isBlocking: false,
    isInternal: false,
  },
  [AppStatus.BETA]: {
    titleFr: "Version Bêta 🧪",
    descriptionFr: "Vous utilisez une version en cours de test. Merci de nous aider à l'améliorer.",
    titleEn: "Beta Version 🧪",
    descriptionEn: "You're using a beta version. Thank you for helping us improve.",
    isBlocking: false,
    isInternal: false,
  },
  [AppStatus.SUSPENDED]: {
    titleFr: "Service suspendu ⛔",
    descriptionFr: "Ce service est temporairement désactivé. Contactez-nous pour plus d'informations.",
    titleEn: "Service Suspended ⛔",
    descriptionEn: "This service has been temporarily disabled. Contact us for more information.",
    isBlocking: true,
    isInternal: false,
  },
  [AppStatus.LAUNCHING]: {
    titleFr: "Lancement en cours 🛰️",
    descriptionFr: "Nous déployons progressivement la plateforme. Merci de votre patience.",
    titleEn: "Launching Now 🛰️",
    descriptionEn: "We are gradually launching the platform. Thank you for your patience.",
    isBlocking: false,
    isInternal: false,
  },
};