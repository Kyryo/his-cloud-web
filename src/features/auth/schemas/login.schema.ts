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

export type SigninCredentialsValues = z.infer<typeof signinCredentialsSchema>;
export type SigninOtpValues = z.infer<typeof signinOtpSchema>;
