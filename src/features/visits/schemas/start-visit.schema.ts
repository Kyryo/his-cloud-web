import { z } from "zod";

export const startVisitSchema = z
  .object({
    consultation_service: z.string().optional(),
    clinic: z.string().min(1, "Default clinic is required"),
    department: z.string().min(1, "Select a department"),
    visit_date: z.string().min(1, "Visit date is required"),
    mode_of_payment: z.enum(["cash", "insurance"]),
    insurance_scheme: z.string().optional(),
    requires_pre_authorization: z.boolean(),
    pre_authorization_number: z.string().trim(),
    pre_authorization_comments: z.string().trim(),
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

export type StartVisitFormValues = z.infer<typeof startVisitSchema>;

export function createStartVisitDefaultValues(
  defaults?: Partial<StartVisitFormValues>,
): StartVisitFormValues {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  const visitDate = local.toISOString().slice(0, 16);

  return {
    consultation_service: "",
    clinic: "",
    department: "",
    visit_date: visitDate,
    mode_of_payment: "cash",
    insurance_scheme: "",
    requires_pre_authorization: false,
    pre_authorization_number: "",
    pre_authorization_comments: "",
    ...defaults,
  };
}

export function toCreateVisitPayload(
  customerUuid: string,
  values: StartVisitFormValues,
): {
  consultation_service: string | null;
  customer: string;
  clinic: string;
  department: string;
  visit_date: string;
  mode_of_payment: "cash" | "insurance";
  insurance_scheme?: string | null;
  requires_pre_authorization: boolean;
  pre_authorization_number: string;
  pre_authorization_comments: string;
  is_walk_in: boolean;
} {
  return {
    consultation_service: values.consultation_service || null,
    customer: customerUuid,
    clinic: values.clinic,
    department: values.department,
    visit_date: new Date(values.visit_date).toISOString(),
    mode_of_payment: values.mode_of_payment,
    insurance_scheme:
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
    is_walk_in: true,
  };
}
