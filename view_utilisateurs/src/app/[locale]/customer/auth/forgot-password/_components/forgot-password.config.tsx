import { AuthFormConfig } from "@/types/auth-form.types"
import { APP_ROUTES } from "@/shared/constants/routes"
import { Mail } from "lucide-react"

export const forgotPasswordConfig: AuthFormConfig = {
  header: {
    title: "Mot de passe oublié ?",
    description: "Entrez votre adresse email ou numéro de téléphone et nous vous enverrons un lien pour réinitialiser votre mot de passe",
  },
  fields: [
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "m@example.com",
      required: true,
      description: "Nous enverrons un lien de réinitialisation à cette adresse",
    },
    {
      id: "phone",
      label: "Téléphone",
      type: "tel",
      placeholder: "77 000 00 00",
      required: true,
      description: "Nous enverrons un code de réinitialisation à ce numéro",
    },
  ],
  submitButton: {
    text: "Envoyer le lien",
    type: "submit",
    icon: <Mail className="h-4 w-4" />,
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
