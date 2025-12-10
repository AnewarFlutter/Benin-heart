import { AuthFormConfig } from "@/types/auth-form.types"
import { APP_ROUTES } from "@/shared/constants/routes"
import { KeyRound } from "lucide-react"

export const resetPasswordConfig: AuthFormConfig = {
  header: {
    title: "Réinitialisez votre mot de passe",
    description: "Entrez votre nouveau mot de passe ci-dessous",
  },
  fields: [
    {
      id: "password",
      label: "Nouveau mot de passe",
      type: "password",
      placeholder: "*******************",
      required: true,
    },
    {
      id: "confirm-password",
      label: "Confirmer le nouveau mot de passe",
      type: "password",
      placeholder: "*******************",
      required: true,
    },
  ],
  submitButton: {
    text: "Réinitialiser le mot de passe",
    type: "submit",
    icon: <KeyRound className="h-4 w-4" />,
  },
  socialLogin: {
    enabled: false,
  },
  footerLink: {
    text: "Vous vous souvenez de votre mot de passe ?",
    linkText: "Retour à la connexion",
    href: APP_ROUTES.auth.login,
  },
}
