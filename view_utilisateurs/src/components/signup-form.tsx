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
import { FormError } from "@/components/ui/form-error"
import { AuthFormConfig } from "@/types/auth-form.types"
import { registerFormSchema, type RegisterFormData } from "@/shared/constants/forms/auth"
import { getValidationMessage } from "@/shared/constants/validation-messages"

interface SignupFormProps extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  config: AuthFormConfig
  onSubmit?: (data: RegisterFormData) => void | Promise<void>
}

export function SignupForm({
  className,
  config,
  onSubmit: onSubmitProp,
  ...props
}: SignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema(getValidationMessage)),
    defaultValues: {
      lastname: "",
      firstname: "",
      email: "",
      telephone: "",
      password: "",
      confirmPassword: "",
    },
  })

  const handleSubmit = async (data: RegisterFormData) => {
    if (!onSubmitProp) return

    setIsSubmitting(true)
    try {
      await onSubmitProp(data)
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

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="lastname">Nom</FieldLabel>
            <Input
              {...form.register("lastname")}
              id="lastname"
              type="text"
              placeholder="Dupont"
            />
            <FormError message={form.formState.errors.lastname?.message} />
          </Field>

          <Field>
            <FieldLabel htmlFor="firstname">Prénom</FieldLabel>
            <Input
              {...form.register("firstname")}
              id="firstname"
              type="text"
              placeholder="Jean"
            />
            <FormError message={form.formState.errors.firstname?.message} />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              {...form.register("email")}
              id="email"
              type="email"
              placeholder="exemple@email.com"
            />
            <FormError message={form.formState.errors.email?.message} />
          </Field>

          <Field>
            <FieldLabel htmlFor="telephone">Téléphone</FieldLabel>
            <Controller
              name="telephone"
              control={form.control}
              render={({ field }) => (
                <PhoneInput
                  id="telephone"
                  placeholder="77 000 00 00"
                  defaultCountry="SN"
                  countries={["SN"]}
                  countrySelectProps={{ disabled: true }}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <FormError message={form.formState.errors.telephone?.message} />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            <Input
              {...form.register("password")}
              id="password"
              type="password"
              placeholder="*******************"
            />
            <FormError message={form.formState.errors.password?.message} />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
            <Input
              {...form.register("confirmPassword")}
              id="confirmPassword"
              type="password"
              placeholder="*******************"
            />
            <FormError message={form.formState.errors.confirmPassword?.message} />
          </Field>
        </div>

        {/* Submit Button */}
        <Field className="md:col-span-2">
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
              {config.footerLink && (
                <FieldDescription className="px-6 text-center">
                  {config.footerLink.text}{" "}
                  <a href={config.footerLink.href} className="underline underline-offset-4">
                    {config.footerLink.linkText}
                  </a>
                </FieldDescription>
              )}
            </Field>
          </>
        )}
      </FieldGroup>
    </form>
  )
}
