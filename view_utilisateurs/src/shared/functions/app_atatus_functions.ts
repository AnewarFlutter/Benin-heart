import { APP_CONFIG } from "../constants/app_config";
import { APP_STATUS_METADATA } from "../constants/app_states";
import { AppStatus } from "../enums/app_status";
import { AppStatusContentLocalized } from "../types/global";

/**
 * Returns the content of the app status based on the given locale.
 * It looks for a NEXT_APP_STATUS environment variable and uses it to determine the app status.
 * If NEXT_APP_STATUS is not defined, it defaults to AppStatus.ONLINE.
 * It then looks up the corresponding metadata in APP_STATUS_METADATA and returns the title, description, and image for the app status in the given locale.
 * @param locale The locale to use for the app status content.
 * @returns An object containing the title, description, image, and isBlocking properties for the app status.
 */

export function getAppStatusContent(locale: string): AppStatusContentLocalized {

    // Convert to AppStatus
    // If NEXT_APP_STATUS is not defined, use AppStatus.ONLINE
    const appStatus: AppStatus = APP_CONFIG.APP_STATUS && AppStatus[APP_CONFIG.APP_STATUS.toUpperCase() as keyof typeof AppStatus]
        ? AppStatus[APP_CONFIG.APP_STATUS.toUpperCase() as keyof typeof AppStatus]
        : AppStatus.ONLINE; // Ou autre valeur par défaut

    const meta = APP_STATUS_METADATA[appStatus];

    const isFrench = locale?.startsWith("fr");

    return {
        title: isFrench ? meta.titleFr : meta.titleEn,
        description: isFrench ? meta.descriptionFr : meta.descriptionEn,
        isBlocking: meta.isBlocking,
        image: meta.image ?? null,
    } satisfies AppStatusContentLocalized;
}