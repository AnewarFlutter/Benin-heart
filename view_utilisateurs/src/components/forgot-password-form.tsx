"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { LoadingButton } from "@/components/loading-button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FormError } from "@/components/ui/form-error"
import { AuthFormConfig } from "@/types/auth-form.types"
import { getValidationMessage } from "@/shared/constants/validation-messages"

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Ce champ est requis"),
  loginType: z.enum(["email", "phone"]),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  config: AuthFormConfig
  onSubmit?: (data: ForgotPasswordFormData) => void | Promise<void>
}

export function ForgotPasswordForm({
  className,
  config,
  onSubmit: onSubmitProp,
  ...props
}: ForgotPasswordFormProps) {
  const [loginType, setLoginType] = useState<"email" | "phone">("email")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
      loginType: "email",
    },
  })

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    if (!onSubmitProp) return

    setIsSubmitting(true)
    try {
      await onSubmitProp({ ...data, loginType })
    } finally {
      setIsSubmitting(false)
    }
  }

  const emailField = config.fields.find(f => f.id === "email")
  const phoneField = config.fields.find(f => f.id === "phone")

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
        <Tabs value={loginType} onValueChange={(value) => setLoginType(value as "email" | "phone")} className="w-full">
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
                placeholder={emailField?.placeholder || "m@example.com"}
              />
              {emailField?.description && (
                <FieldDescription>{emailField.description}</FieldDescription>
              )}
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
                    placeholder={phoneField?.placeholder || "77 000 00 00"}
                    defaultCountry="SN"
                    countries={["SN"]}
                    countrySelectProps={{ disabled: true }}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {phoneField?.description && (
                <FieldDescription>{phoneField.description}</FieldDescription>
              )}
              <FormError message={form.formState.errors.identifier?.message} />
            </Field>
          </TabsContent>
        </Tabs>

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
