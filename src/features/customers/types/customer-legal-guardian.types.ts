export type CustomerLegalGuardianRelationship =
  | "PARENT"
  | "SPOUSE"
  | "SIBLING"
  | "GRANDPARENT"
  | "OTHER";

export type CustomerLegalGuardian = {
  id: number;
  uuid: string;
  tenant: number;
  customer: number;
  customer_name: string;
  customer_identifier: string;
  full_name: string;
  relationship: CustomerLegalGuardianRelationship;
  phone_number: string;
  email: string;
  national_id: string;
  is_primary: boolean;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_name: string;
};

export type CreateCustomerLegalGuardianPayload = {
  customer: number;
  full_name: string;
  relationship?: CustomerLegalGuardianRelationship;
  phone_number?: string;
  email?: string;
  national_id?: string;
  is_primary?: boolean;
  notes?: string;
  is_active?: boolean;
};

export type UpdateCustomerLegalGuardianPayload = Omit<
  CreateCustomerLegalGuardianPayload,
  "customer"
>;

export const CUSTOMER_LEGAL_GUARDIAN_RELATIONSHIP_OPTIONS: Array<{
  value: CustomerLegalGuardianRelationship;
  label: string;
}> = [
  { value: "PARENT", label: "Parent" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "SIBLING", label: "Sibling" },
  { value: "GRANDPARENT", label: "Grandparent" },
  { value: "OTHER", label: "Other" },
];
