import { z } from "zod";

export const mfaPasswordSchema = z.object({
  password: z.string().min(1, "Current password is required"),
});

export const totpActivateSchema = mfaPasswordSchema.extend({
  code: z.string().optional(),
});

export const webAuthnNameSchema = mfaPasswordSchema.extend({
  name: z.string().trim().max(100).optional(),
});

export type MfaPasswordValues = z.infer<typeof mfaPasswordSchema>;
export type TotpActivateValues = z.infer<typeof totpActivateSchema>;
