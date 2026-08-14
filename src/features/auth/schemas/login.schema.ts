import { z } from "zod";

const otpCodeRegex = /^\d{6}$/;

export const signinCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signinOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  code: z
    .string()
    .regex(otpCodeRegex, "Enter the 6-digit verification code"),
});

export const signinTotpSchema = z.object({
  code: z.string().regex(otpCodeRegex, "Enter the 6-digit authenticator code"),
});

export const signinRecoverySchema = z.object({
  code: z
    .string()
    .regex(/^\d{8}$/, "Enter the 8-digit recovery code"),
});

export type SigninCredentialsValues = z.infer<typeof signinCredentialsSchema>;
export type SigninOtpValues = z.infer<typeof signinOtpSchema>;
export type SigninTotpValues = z.infer<typeof signinTotpSchema>;
export type SigninRecoveryValues = z.infer<typeof signinRecoverySchema>;
