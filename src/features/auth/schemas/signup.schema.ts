import { z } from "zod";

const otpCodeRegex = /^\d{6}$/;

export const signupCredentialsSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    password2: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

export const signupProfileSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  clinic_name: z.string().trim().min(1, "Clinic name is required"),
  country: z.string().trim().optional(),
});

export const signupOtpSchema = z.object({
  code: z
    .string()
    .regex(otpCodeRegex, "Enter the 6-digit verification code"),
});

export type SignupCredentialsValues = z.infer<typeof signupCredentialsSchema>;
export type SignupProfileValues = z.infer<typeof signupProfileSchema>;
export type SignupOtpValues = z.infer<typeof signupOtpSchema>;
