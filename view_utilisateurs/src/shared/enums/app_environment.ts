/**
 *  AppEnvironment enum and its values.
 *
 *  This file contains the AppEnvironment enum, which represents the different environments that the application can be in.
 *  It also contains the APP_ENVIRONMENTS_VALUES constant, which is an array of all the values of the AppEnvironment enum.
 *
 *  @constant
 *  @enum {string}
 *  @property {string} PRODUCTION - The production environment.
 *  @property {string} STAGING - The staging environment.
 *  @property {string} DEV - The development environment.
 *  @property {string[]} APP_ENVIRONMENTS_VALUES - An array of all the values of the AppEnvironment enum.
 */

export enum AppEnvironment {
    PRODUCTION = "production",
    STAGING = "staging",
    DEV = "dev",
}
export const APP_ENVIRONMENTS_VALUES = Object.values(AppEnvironment);