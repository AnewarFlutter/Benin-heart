"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/loading-button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FormError } from "@/components/ui/form-error"
import { AuthFormConfig } from "@/types/auth-form.types"
import { loginFormSchema, type LoginFormData } from "@/shared/constants/forms/auth"
import { getValidationMessage } from "@/shared/constants/validation-messages"

interface LoginFormProps extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  config: AuthFormConfig
  onSubmit?: (data: LoginFormData) => void | Promise<void>
}

export function LoginForm({
  className,
  config,
  onSubmit: onSubmitProp,
  ...props
}: LoginFormProps) {
  const [loginType, setLoginType] = useState<"email" | "phone">("email")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema(getValidationMessage)),
    defaultValues: {
      identifier: "",
      password: "",
      loginType: "email",
    },
  })

  const handleLoginTypeChange = (value: string) => {
    const newLoginType = value as "email" | "phone"
    setLoginType(newLoginType)
    // Réinitialiser le champ identifier quand on change de type de connexion
    form.setValue("identifier", "")
  }

  const handleSubmit = async (data: LoginFormData) => {
    if (!onSubmitProp) return

    setIsSubmitting(true)
    try {
      await onSubmitProp({ ...data, loginType })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        {/* Header Section */}
        <div className="flex flex-col items-center gap-1 text-center">
          {config.header.icon && (
            <div className="flex items-center justify-center mb-2">
              {config.header.icon}
            </div>
          )}
          <h1 className="text-2xl font-bold">{config.header.title}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {config.header.description}
          </p>
        </div>

        {/* Login Type Tabs */}
        <Tabs value={loginType} onValueChange={handleLoginTypeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Téléphone</TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <Field>
              <FieldLabel htmlFor="identifier-email">Email</FieldLabel>
              <Input
                {...form.register("identifier")}
                id="identifier-email"
                type="email"
                placeholder="m@example.com"
              />
              <FormError message={form.formState.errors.identifier?.message} />
            </Field>
          </TabsContent>

          <TabsContent value="phone">
            <Field>
              <FieldLabel htmlFor="identifier-phone">Téléphone</FieldLabel>
              <Controller
                name="identifier"
                control={form.control}
                render={({ field }) => (
                  <PhoneInput
                    id="identifier-phone"
                    placeholder="77 000 00 00"
                    defaultCountry="SN"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FormError message={form.formState.errors.identifier?.message} />
            </Field>
          </TabsContent>
        </Tabs>

        {/* Password field */}
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            <a
              href={config.fields.find(f => f.type === "password")?.forgotPasswordLink || "#"}
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Mot de passe oublié ?
            </a>
          </div>
          <Input
            {...form.register("password")}
            id="password"
            type="password"
            placeholder="*******************"
          />
          <FormError message={form.formState.errors.password?.message} />
        </Field>

        {/* Submit Button */}
        <Field>
          <LoadingButton
            type="submit"
            icon={config.submitButton.icon}
            loading={isSubmitting}
          >
            {config.submitButton.text}
          </LoadingButton>
        </Field>

        {/* Social Login Section */}
        {config.socialLogin?.enabled && (
          <>
            <FieldSeparator>
              {config.socialLogin.separator || "Or continue with"}
            </FieldSeparator>
            <Field>
              {config.socialLogin.providers?.map((provider, index) => (
                <Button key={index} variant="outline" type="button">
                  {provider.icon}
                  {provider.buttonText}
                </Button>
              ))}
            </Field>
          </>
        )}

        {/* Footer Link */}
        {config.footerLink && (
          <Field>
            <FieldDescription className="text-center">
              {config.footerLink.text}{" "}
              <a href={config.footerLink.href} className="underline underline-offset-4">
                {config.footerLink.linkText}
              </a>
            </FieldDescription>
          </Field>
        )}
      </FieldGroup>
    </form>
  )
}
