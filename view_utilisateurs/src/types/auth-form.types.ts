export interface FormHeaderConfig {
  title: string
  description: string
  icon?: React.ReactNode
}

export interface FormFieldConfig {
  id: string
  label: string
  type: string
  placeholder?: string
  required?: boolean
  description?: string
  showForgotPassword?: boolean
  forgotPasswordLink?: string
  columnSpan?: 1 | 2  // 1 = demi-largeur, 2 = pleine largeur
}

export interface SocialLoginConfig {
  enabled: boolean
  separator?: string
  providers?: Array<{
    name: string
    icon: React.ReactNode
    buttonText: string
  }>
}

export interface FormLinkConfig {
  text: string
  linkText: string
  href: string
}

export interface FormButtonConfig {
  text: string
  type?: "submit" | "button"
  variant?: "default" | "outline"
  icon?: React.ReactNode
}

export interface OTPConfig {
  length: number
  title: string
  description: string
  submitButtonText?: string
  submitButtonIcon?: React.ReactNode
  fieldLabel?: string
  resendLink?: {
    text: string
    linkText: string
    href: string
  }
  termsText?: string
}

export interface AuthFormConfig {
  header: FormHeaderConfig
  fields: FormFieldConfig[]
  submitButton: FormButtonConfig
  socialLogin?: SocialLoginConfig
  footerLink?: FormLinkConfig
}
