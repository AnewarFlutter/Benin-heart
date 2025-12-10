# Composants d'authentification réutilisables

Ce dossier contient des composants d'authentification réutilisables avec des données dynamiques.

## Structure

```
auth/
├── login/
│   ├── _components/
│   │   └── login.config.tsx       # Configuration pour le formulaire de login
│   └── page.tsx                    # Page de login
├── register/
│   ├── _components/
│   │   └── register.config.tsx    # Configuration pour le formulaire d'inscription
│   └── page.tsx                    # Page d'inscription
└── otp/
    ├── _components/
    │   └── otp.config.tsx         # Configuration pour le formulaire OTP
    └── page.tsx                    # Page OTP
```

## Composants réutilisables

### 1. LoginForm / SignupForm

Ces composants acceptent une configuration de type `AuthFormConfig` :

```typescript
interface AuthFormConfig {
  header: FormHeaderConfig
  fields: FormFieldConfig[]
  submitButton: FormButtonConfig
  socialLogin?: SocialLoginConfig
  footerLink?: FormLinkConfig
}
```

#### Exemple d'utilisation

```tsx
import { LoginForm } from "@/components/login-form"
import { AuthFormConfig } from "@/types/auth-form.types"

const myLoginConfig: AuthFormConfig = {
  header: {
    title: "Connexion à votre compte",
    description: "Entrez vos identifiants",
  },
  fields: [
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "exemple@email.com",
      required: true,
    },
    {
      id: "password",
      label: "Mot de passe",
      type: "password",
      required: true,
      showForgotPassword: true,
    },
  ],
  submitButton: {
    text: "Se connecter",
    type: "submit",
  },
  socialLogin: {
    enabled: true,
    separator: "Ou continuer avec",
    providers: [
      {
        name: "github",
        icon: <GithubIcon />,
        buttonText: "Se connecter avec GitHub",
      },
    ],
  },
  footerLink: {
    text: "Pas encore de compte ?",
    linkText: "S'inscrire",
    href: "/register",
  },
}

export default function MyLoginPage() {
  return <LoginForm config={myLoginConfig} />
}
```

### 2. OTPForm

Ce composant accepte une configuration de type `OTPConfig` :

```typescript
interface OTPConfig {
  length: number
  title: string
  description: string
  resendLink?: {
    text: string
    linkText: string
    href: string
  }
  termsText?: string
}
```

#### Exemple d'utilisation

```tsx
import { OTPForm } from "@/components/otp-form"
import { OTPConfig } from "@/types/auth-form.types"

const myOtpConfig: OTPConfig = {
  length: 6,
  title: "Entrez le code de vérification",
  description: "Un code à 6 chiffres a été envoyé à votre email",
  resendLink: {
    text: "Vous n'avez pas reçu le code ?",
    linkText: "Renvoyer",
    href: "#",
  },
  termsText: 'En continuant, vous acceptez nos <a href="#">CGU</a> et notre <a href="#">Politique de confidentialité</a>.',
}

export default function MyOTPPage() {
  return <OTPForm config={myOtpConfig} />
}
```

## Configuration des champs

### FormFieldConfig

```typescript
interface FormFieldConfig {
  id: string                    // ID unique du champ
  label: string                 // Label affiché
  type: string                  // Type HTML (email, password, text, etc.)
  placeholder?: string          // Placeholder optionnel
  required?: boolean            // Champ obligatoire
  description?: string          // Description sous le champ
  showForgotPassword?: boolean  // Afficher "Mot de passe oublié ?"
}
```

### SocialLoginConfig

```typescript
interface SocialLoginConfig {
  enabled: boolean              // Activer la connexion sociale
  separator?: string            // Texte du séparateur
  providers?: Array<{
    name: string                // Nom du provider
    icon: React.ReactNode       // Icône du provider
    buttonText: string          // Texte du bouton
  }>
}
```

## Avantages

1. **Réutilisabilité** : Les composants peuvent être utilisés dans différentes pages avec des configurations différentes
2. **Maintenabilité** : Les données sont séparées de la logique UI
3. **Flexibilité** : Facile d'ajouter ou de modifier des champs sans toucher au composant
4. **Type-safety** : TypeScript assure la cohérence des données
5. **DRY** : Ne répétez pas le code, utilisez les configurations

## Personnalisation

Pour créer un nouveau formulaire d'authentification :

1. Créez un nouveau dossier dans `auth/`
2. Créez un dossier `_components/` avec un fichier de configuration
3. Importez le composant réutilisable et passez-lui la configuration
4. Profitez de la flexibilité !
