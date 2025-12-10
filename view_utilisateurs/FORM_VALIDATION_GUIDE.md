# Guide de Validation des Formulaires d'Authentification

## 📦 Ce qui a été intégré

✅ **React Hook Form** + **Zod** dans tous les formulaires d'authentification
✅ Validation automatique avec messages d'erreur en français
✅ État de chargement (loading) pendant la soumission
✅ Gestion des erreurs avec affichage visuel

## 🎯 Formulaires intégrés

### 1. LoginForm
- Validation email/téléphone
- Validation mot de passe (minimum 8 caractères)
- Onglets pour basculer entre email et téléphone

### 2. SignupForm (RegisterForm)
- Validation nom, prénom (minimum 2 caractères)
- Validation email
- Validation téléphone sénégalais
- Validation mots de passe + confirmation
- Grille 2x2 responsive

### 3. OTPForm
- Validation code à 6 chiffres
- Bouton "Renvoyer le code"

## 💻 Exemple d'utilisation

### Login

```tsx
// src/app/[locale]/customer/auth/login/page.tsx
import { LoginForm } from "@/components/login-form"
import { loginConfig } from "./_components/login.config"
import type { LoginFormData } from "@/shared/constants/forms/auth"

export default function LoginPage() {
  const handleSubmit = async (data: LoginFormData) => {
    console.log("Login data:", data)
    // {
    //   identifier: "user@example.com" ou "770001234",
    //   password: "motdepasse123",
    //   loginType: "email" ou "phone"
    // }

    // Appelez votre API ici
    // await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) })
  }

  return (
    <div className="container">
      <LoginForm config={loginConfig} onSubmit={handleSubmit} />
    </div>
  )
}
```

### Register

```tsx
// src/app/[locale]/customer/auth/register/page.tsx
import { SignupForm } from "@/components/signup-form"
import { registerConfig } from "./_components/register.config"
import type { RegisterFormData } from "@/shared/constants/forms/auth"

export default function RegisterPage() {
  const handleSubmit = async (data: RegisterFormData) => {
    console.log("Register data:", data)
    // {
    //   lastname: "Dupont",
    //   firstname: "Jean",
    //   email: "jean@example.com",
    //   telephone: "770001234",
    //   password: "motdepasse123",
    //   confirmPassword: "motdepasse123"
    // }

    // Appelez votre API ici
    // await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) })
  }

  return (
    <div className="container">
      <SignupForm config={registerConfig} onSubmit={handleSubmit} />
    </div>
  )
}
```

### OTP

```tsx
// src/app/[locale]/customer/auth/otp/page.tsx
import { OTPForm } from "@/components/otp-form"
import { otpConfig } from "./_components/otp.config"
import type { OTPFormData } from "@/shared/constants/forms/auth"

export default function OTPPage() {
  const handleSubmit = async (data: OTPFormData) => {
    console.log("OTP code:", data.code)
    // { code: "123456" }

    // Appelez votre API ici
    // await fetch('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) })
  }

  const handleResend = async () => {
    console.log("Resending OTP...")
    // await fetch('/api/auth/resend-otp', { method: 'POST' })
  }

  return (
    <div className="container">
      <OTPForm
        config={otpConfig}
        onSubmit={handleSubmit}
        onResend={handleResend}
      />
    </div>
  )
}
```

## 🔍 Messages d'erreur

Les messages sont définis dans `src/shared/constants/validation-messages.ts` :

```typescript
{
  identifierRequired: "Email ou numéro de téléphone requis",
  emailInvalid: "Adresse email invalide",
  phoneInvalid: "Numéro de téléphone invalide",
  passwordMinLength: "Le mot de passe doit contenir au moins 8 caractères",
  passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
  lastnameRequired: "Le nom est requis",
  firstnameRequired: "Le prénom est requis",
  otpCodeLength: "Le code doit contenir exactement 6 chiffres",
}
```

## 🎨 Affichage des erreurs

Les erreurs s'affichent automatiquement sous chaque champ avec le composant `FormError` :

```tsx
<FormError message={form.formState.errors.email?.message} />
```

Style par défaut : texte rouge, petit format, margin-top

## 🔄 État de chargement

Pendant la soumission, le bouton affiche automatiquement un loader :

```tsx
<LoadingButton type="submit" loading={isSubmitting}>
  Se connecter
</LoadingButton>
```

## 📋 Validation Zod

### Login
```typescript
{
  identifier: string (min 1),
  password: string (min 8),
  loginType: "email" | "phone"
}
```

### Register
```typescript
{
  lastname: string (min 2),
  firstname: string (min 2),
  email: string (email valide),
  telephone: string (regex: /^(\+221)?[0-9]{9}$/),
  password: string (min 8),
  confirmPassword: string (doit correspondre)
}
```

### OTP
```typescript
{
  code: string (exactement 6 caractères)
}
```

## 🛠️ Personnalisation

### Modifier les messages d'erreur
Éditez `src/shared/constants/validation-messages.ts`

### Modifier les règles de validation
Éditez `src/shared/constants/forms/auth.ts`

### Ajouter des champs
Modifiez le schéma Zod correspondant et le formulaire

## ✅ Avantages

1. **Validation côté client** instantanée
2. **Messages d'erreur** clairs et en français
3. **TypeScript** : types automatiques pour les données
4. **Réutilisable** : un seul schéma pour tout
5. **Maintenable** : validation centralisée
6. **UX** : feedback immédiat à l'utilisateur

## 🚀 Prochaines étapes

1. Intégrer avec votre backend API
2. Ajouter la gestion des erreurs API
3. Implémenter le stockage des tokens
4. Ajouter les redirections après succès
5. Gérer les erreurs réseau
