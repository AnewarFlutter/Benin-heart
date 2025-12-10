/**
 *  ActionResult is a type that represents the result of an action.
 *  It contains a boolean success property, a message property, and an optional data property.
 *  The data property is typed as T, which means it can be any type.
 *  This type is used in actions files to help the user know the status of its functions.
 * 
 *  @template T The type of the data property.
 *  @returns A type that represents the result of an action.
 * 
 *  @example
 *  const result: ActionResult<{ id: number }> = { success: true, message: "User has been fetched.", data: { id: 1 } };
 *  result.success; // true
 *  result.message; // "User has been fetched."
 *  result.data; // { id: 1 }
 */
export type AppActionResult<T = unknown> = {
    success: boolean;
    message: string;
    data?: T;
}

/**
 *  AppStateContent is a type that represents the content of an app state.
 *  It contains the title and description of the app state in both French and English.
 *  It also contains a boolean isBlocking property, which indicates if the app state should redirect the user to a static page.
 *  It also contains a boolean isInternal property, which indicates if the app state is only for internal use (i.e. for developers).
 *  It also contains an optional image property, which is the path to an image that should be displayed in the app state.
 */
export type AppStateContent = {
    titleFr: string;
    descriptionFr: string;
    titleEn: string;
    descriptionEn: string;
    image?: string | null;
    isBlocking: boolean; // if true = redirect to static page
    isInternal: boolean; // if true = only for internal use (developers)
};

/**
 *  AppStatusContentLocalized is a type that represents the content of an app state in a specific language.
 *  It contains the title and description of the app state in that language.
 *  It also contains an optional image property, which is the path to an image that should be displayed in the app state.
 */
export type AppStatusContentLocalized = {
    title: string;
    description: string;
    isBlocking: boolean;
    image?: string | null;
};

/**
 *  AppStatusContent is a type that represents the content of an app state in both French and English.
 *  It is a record of AppStatus to AppStatusContentLocalized.
 *  It is used to store the content of an app state in both languages.
 */
export type AppStatusContent = {
    [key: string]: AppStatusContentLocalized;
};

/**
 *  App Locales type
 *  @const {string}
 */
export const AppLocalesValues = ["fr", "en"] as const;
export type AppLocalesValues = typeof AppLocalesValues[number];
