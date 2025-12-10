/**
 * Messages de validation pour les formulaires
 */

export const VALIDATION_MESSAGES = {
  // Identifiants
  identifierRequired: "Email ou numéro de téléphone requis",
  emailInvalid: "Adresse email invalide",
  phoneInvalid: "Numéro de téléphone invalide",

  // Mots de passe
  passwordMinLength: "Le mot de passe doit contenir au moins 8 caractères",
  passwordsDoNotMatch: "Les mots de passe ne correspondent pas",

  // Informations utilisateur
  lastnameRequired: "Le nom est requis",
  firstnameRequired: "Le prénom est requis",

  // OTP
  otpCodeLength: "Le code doit contenir exactement 6 chiffres",
} as const

export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES

/**
 * Fonction pour obtenir un message de validation
 */
export function getValidationMessage(key: string): string {
  return VALIDATION_MESSAGES[key as ValidationMessageKey] || key
}
