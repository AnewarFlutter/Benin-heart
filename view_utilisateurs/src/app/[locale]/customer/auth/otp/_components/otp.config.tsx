import { OTPConfig } from "@/types/auth-form.types"
import { ShieldCheck } from "lucide-react"

export const otpConfig: OTPConfig = {
  length: 6,
  title: "Entrez le code de vérification",
  description: "Nous avons envoyé un code à 6 chiffres à votre adresse email",
  submitButtonText: "Vérifier",
  submitButtonIcon: <ShieldCheck className="h-4 w-4" />,
  fieldLabel: "Code de vérification",
  resendLink: {
    text: "Vous n'avez pas reçu le code ?",
    linkText: "Renvoyer",
    href: "#",
  },
  termsText: 'En continuant, vous acceptez nos <a href="#">Conditions d\'utilisation</a> et notre <a href="#">Politique de confidentialité</a>.',
}
