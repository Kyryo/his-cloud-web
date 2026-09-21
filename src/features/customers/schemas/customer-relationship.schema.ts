import { z } from "zod";

import {
  CUSTOMER_RELATIONSHIP_TYPES,
  type CreateCustomerRelationshipPayload,
} from "@/features/customers/types/customer-relationship.types";

export const createCustomerRelationshipSchema = z.object({
  related_uuid: z.string().uuid("Select a client"),
  relationship: z.enum(CUSTOMER_RELATIONSHIP_TYPES, {
    message: "Select a relationship",
  }),
  notes: z.string().trim().optional(),
});

export type CreateCustomerRelationshipFormValues = z.infer<
  typeof createCustomerRelationshipSchema
>;

export const createCustomerRelationshipDefaultValues: CreateCustomerRelationshipFormValues =
  {
    related_uuid: "",
    relationship: "SPOUSE",
    notes: "",
  };

export function toCustomerRelationshipPayload(
  values: CreateCustomerRelationshipFormValues,
): CreateCustomerRelationshipPayload {
  return {
    related: values.related_uuid,
    relationship: values.relationship,
    notes: values.notes?.trim() || "",
  };
}
