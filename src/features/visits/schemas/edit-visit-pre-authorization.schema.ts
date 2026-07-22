import { z } from "zod";

export const editVisitPreAuthorizationSchema = z
  .object({
    requires_pre_authorization: z.boolean(),
    pre_authorization_number: z.string().trim(),
    pre_authorization_comments: z.string().trim(),
  })
  .superRefine((values, context) => {
    if (
      values.requires_pre_authorization &&
      !values.pre_authorization_number.trim()
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a pre-authorization number",
        path: ["pre_authorization_number"],
      });
    }
  });

export type EditVisitPreAuthorizationFormValues = z.infer<
  typeof editVisitPreAuthorizationSchema
>;

export function toEditVisitPreAuthorizationDefaultValues(visit: {
  requires_pre_authorization: boolean;
  pre_authorization_number: string | null | undefined;
  pre_authorization_comments: string | null | undefined;
}): EditVisitPreAuthorizationFormValues {
  return {
    requires_pre_authorization: Boolean(visit.requires_pre_authorization),
    pre_authorization_number: visit.pre_authorization_number?.trim() || "",
    pre_authorization_comments: visit.pre_authorization_comments?.trim() || "",
  };
}

export function toUpdateVisitPreAuthorizationPayload(
  values: EditVisitPreAuthorizationFormValues,
): {
  requires_pre_authorization: boolean;
  pre_authorization_number: string;
  pre_authorization_comments: string;
} {
  if (!values.requires_pre_authorization) {
    return {
      requires_pre_authorization: false,
      pre_authorization_number: "",
      pre_authorization_comments: "",
    };
  }
  return {
    requires_pre_authorization: true,
    pre_authorization_number: values.pre_authorization_number.trim(),
    pre_authorization_comments: values.pre_authorization_comments.trim(),
  };
}

export function visitHasPreAuthorizationDetails(visit: {
  pre_authorization_number?: string | null;
  pre_authorization_comments?: string | null;
}): boolean {
  return Boolean(
    visit.pre_authorization_number?.trim() ||
      visit.pre_authorization_comments?.trim(),
  );
}
