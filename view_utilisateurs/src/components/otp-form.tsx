"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { LoadingButton } from "@/components/loading-button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { FormError } from "@/components/ui/form-error"
import { OTPConfig } from "@/types/auth-form.types"
import { otpFormSchema, type OTPFormData } from "@/shared/constants/forms/auth"
import { getValidationMessage } from "@/shared/constants/validation-messages"

interface OTPFormProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  config: OTPConfig
  onSubmit?: (data: OTPFormData) => void | Promise<void>
  onResend?: () => void | Promise<void>
}

export function OTPForm({ className, config, onSubmit: onSubmitProp, onResend, ...props }: OTPFormProps) {
  const halfLength = Math.floor(config.length / 2)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpFormSchema(getValidationMessage)),
    defaultValues: {
      code: "",
    },
  })

  const handleSubmit = async (data: OTPFormData) => {
    if (!onSubmitProp) return

    setIsSubmitting(true)
    try {
      await onSubmitProp(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          {/* Header Section */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">{config.title}</h1>
            <FieldDescription>
              {config.description}
            </FieldDescription>
          </div>

          {/* OTP Input Field */}
          <Field>
            <FieldLabel htmlFor="otp" className="sr-only">
              {config.fieldLabel || "Verification code"}
            </FieldLabel>
            <Controller
              name="code"
              control={form.control}
              render={({ field }) => (
                <InputOTP
                  maxLength={config.length}
                  id="otp"
                  containerClassName="gap-4"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                    {Array.from({ length: halfLength }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                    {Array.from({ length: config.length - halfLength }).map((_, i) => (
                      <InputOTPSlot key={i + halfLength} index={i + halfLength} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            <FormError message={form.formState.errors.code?.message} />

            {/* Resend Link */}
            {config.resendLink && (
              <FieldDescription className="text-center">
                {config.resendLink.text}{" "}
                <button
                  type="button"
                  onClick={onResend}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  {config.resendLink.linkText}
                </button>
              </FieldDescription>
            )}
          </Field>

          {/* Submit Button */}
          <Field>
            <LoadingButton
              type="submit"
              icon={config.submitButtonIcon}
              loading={isSubmitting}
            >
              {config.submitButtonText || "Verify"}
            </LoadingButton>
          </Field>
        </FieldGroup>
      </form>

      {/* Terms and Privacy */}
      {config.termsText && (
        <FieldDescription className="px-6 text-center" dangerouslySetInnerHTML={{ __html: config.termsText }} />
      )}
    </div>
  )
}
