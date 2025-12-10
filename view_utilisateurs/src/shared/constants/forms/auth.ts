import { z } from "zod"

/**
 * Authentication form schemas using Zod
 * Designed for use with React Hook Form
 */

const PHONE_REGEX = /^(\+221)?[0-9]{9}$/

/**
 * Login form schema (email or phone)
 */
export const loginFormSchema = (t: (key: string) => string) =>
  z.object({
    identifier: z.string().min(1, { message: t("identifierRequired") }),
    password: z.string().min(8, { message: t("passwordMinLength") }),
    loginType: z.enum(["email", "phone"]),
  })

export type LoginFormData = {
  identifier: string
  password: string
  loginType: "email" | "phone"
}

/**
 * Register form schema
 */
export const registerFormSchema = (t: (key: string) => string) =>
  z
    .object({
      lastname: z.string().min(2, { message: t("lastnameRequired") }),
      firstname: z.string().min(2, { message: t("firstnameRequired") }),
      email: z.string().email({ message: t("emailInvalid") }),
      telephone: z.string().regex(PHONE_REGEX, { message: t("phoneInvalid") }),
      password: z.string().min(8, { message: t("passwordMinLength") }),
      confirmPassword: z.string().min(8, { message: t("passwordMinLength") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    })

export type RegisterFormData = {
  lastname: string
  firstname: string
  email: string
  telephone: string
  password: string
  confirmPassword: string
}

/**
 * Forgot password form schema
 */
export const forgotPasswordFormSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({ message: t("emailInvalid") }),
  })

export type ForgotPasswordFormData = {
  email: string
}

/**
 * Reset password form schema
 */
export const resetPasswordFormSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z.string().min(8, { message: t("passwordMinLength") }),
      confirmPassword: z.string().min(8, { message: t("passwordMinLength") }),
      token: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    })

export type ResetPasswordFormData = {
  password: string
  confirmPassword: string
  token?: string
}

/**
 * OTP verification form schema
 */
export const otpFormSchema = (t: (key: string) => string) =>
  z.object({
    code: z.string().length(6, { message: t("otpCodeLength") }),
  })

export type OTPFormData = {
  code: string
}

/**
 * Legacy compatibility
 * @deprecated Use loginFormSchema instead
 */
export const loginUserFormSchema = loginFormSchema