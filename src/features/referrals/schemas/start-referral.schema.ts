import { z } from "zod";

import type { ClinicalReferral } from "@/features/clinical-opd/types/clinical-opd.types";
import type { StartClinicalReferralPayload } from "@/features/clinical-opd/types/clinical-opd.types";

export const startReferralSchema = z
  .object({
    mode_of_payment: z.enum(["cash", "insurance", "free"]),
    insurance_scheme: z.string().optional(),
    requires_pre_authorization: z.boolean(),
    pre_authorization_number: z.string().trim(),
    pre_authorization_comments: z.string().trim(),
    notes: z.string().trim(),
  })
  .superRefine((values, context) => {
    if (values.mode_of_payment === "insurance" && !values.insurance_scheme) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an insurance scheme",
        path: ["insurance_scheme"],
      });
    }

    if (
      values.requires_pre_authorization &&
      !values.pre_authorization_number.trim()
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pre-authorization number is required",
        path: ["pre_authorization_number"],
      });
    }
  });

export type StartReferralFormValues = z.infer<typeof startReferralSchema>;

export function createStartReferralDefaultValues(
  referral: ClinicalReferral,
): StartReferralFormValues {
  const mode =
    referral.mode_of_payment === "insurance" ||
    referral.mode_of_payment === "free" ||
    referral.mode_of_payment === "cash"
      ? referral.mode_of_payment
      : "cash";

  return {
    mode_of_payment: mode,
    insurance_scheme:
      mode === "insurance" ? (referral.insurance_scheme_uuid ?? "") : "",
    requires_pre_authorization:
      mode === "insurance" ? Boolean(referral.requires_pre_authorization) : false,
    pre_authorization_number: referral.pre_authorization_number ?? "",
    pre_authorization_comments: referral.pre_authorization_comments ?? "",
    notes: "",
  };
}

export function toStartReferralPayload(
  values: StartReferralFormValues,
): StartClinicalReferralPayload {
  return {
    mode_of_payment: values.mode_of_payment,
    insurance_scheme_uuid:
      values.mode_of_payment === "insurance"
        ? values.insurance_scheme || null
        : null,
    requires_pre_authorization:
      values.mode_of_payment === "insurance"
        ? values.requires_pre_authorization
        : false,
    pre_authorization_number: values.requires_pre_authorization
      ? values.pre_authorization_number.trim()
      : "",
    pre_authorization_comments: values.requires_pre_authorization
      ? values.pre_authorization_comments.trim()
      : "",
    notes: values.notes.trim(),
  };
}
