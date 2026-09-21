export const CUSTOMER_RELATIONSHIP_TYPES = [
  "SPOUSE",
  "CHILD",
  "PARENT",
  "SIBLING",
  "PARTNER",
  "OTHER",
] as const;

export type CustomerRelationshipType =
  (typeof CUSTOMER_RELATIONSHIP_TYPES)[number];

export const CUSTOMER_RELATIONSHIP_LABELS: Record<
  CustomerRelationshipType,
  string
> = {
  SPOUSE: "Spouse",
  CHILD: "Child",
  PARENT: "Parent",
  SIBLING: "Sibling",
  PARTNER: "Partner",
  OTHER: "Other",
};

export type CustomerRelationshipDirection = "outgoing" | "incoming";

export type CustomerRelationship = {
  id: number;
  uuid: string;
  tenant: number;
  principal: number;
  principal_uuid: string;
  principal_name: string;
  principal_identifier: string;
  related: number;
  related_uuid: string;
  related_name: string;
  related_identifier: string;
  relationship: CustomerRelationshipType | string;
  notes: string;
  direction: CustomerRelationshipDirection;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_name: string;
};

export type CustomerRelationshipListResponse = {
  results: CustomerRelationship[];
};

export type CreateCustomerRelationshipPayload = {
  related: string;
  relationship: CustomerRelationshipType;
  notes?: string;
};

export type UpdateCustomerRelationshipPayload = {
  relationship?: CustomerRelationshipType;
  notes?: string;
};
