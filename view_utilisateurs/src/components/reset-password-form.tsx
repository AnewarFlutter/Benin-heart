"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
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
import { FormError } from "@/components/ui/form-error"
import { AuthFormConfig } from "@/types/auth-form.types"
import { getValidationMessage } from "@/shared/constants/validation-messages"

const resetPasswordSchema = z.object({
  password: z.string().min(8, getValidationMessage("passwordMinLength")),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: getValidationMessage("passwordsDoNotMatch"),
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  config: AuthFormConfig
  onSubmit?: (data: ResetPasswordFormData) => void | Promise<void>
}

export function ResetPasswordForm({
  className,
  config,
  onSubmit: onSubmitProp,
  ...props
}: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const handleSubmit = async (data: ResetPasswordFormData) => {
    if (!onSubmitProp) return

    setIsSubmitting(true)
    try {
      await onSubmitProp(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordField = config.fields.find(f => f.id === "password")
  const confirmPasswordField = config.fields.find(f => f.id === "confirm-password")

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

        {/* Password field */}
        <Field>
          <FieldLabel htmlFor="password">{passwordField?.label || "Nouveau mot de passe"}</FieldLabel>
          <Input
            {...form.register("password")}
            id="password"
            type="password"
            placeholder={passwordField?.placeholder || "*******************"}
          />
          {passwordField?.description && (
            <FieldDescription>{passwordField.description}</FieldDescription>
          )}
          <FormError message={form.formState.errors.password?.message} />
        </Field>

        {/* Confirm Password field */}
        <Field>
          <FieldLabel htmlFor="confirmPassword">{confirmPasswordField?.label || "Confirmer le nouveau mot de passe"}</FieldLabel>
          <Input
            {...form.register("confirmPassword")}
            id="confirmPassword"
            type="password"
            placeholder={confirmPasswordField?.placeholder || "*******************"}
          />
          {confirmPasswordField?.description && (
            <FieldDescription>{confirmPasswordField.description}</FieldDescription>
          )}
          <FormError message={form.formState.errors.confirmPassword?.message} />
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
