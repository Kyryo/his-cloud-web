export type InsuranceScheme = {
  id: number;
  uuid: string;
  tenant: number;
  insurance_company: number;
  insurance_company_name: string;
  name: string;
  code: string;
  description: string;
  pricelist_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
};

export type InsuranceSchemesListResponse = {
  results: InsuranceScheme[];
};

export type CustomerInsurance = {
  id: number;
  uuid: string;
  customer: number;
  insurance_scheme: number;
  scheme_name: string;
  insurance_company_name: string;
  membership_number: string;
  suffix: string;
  is_principal_member: boolean;
  principal_member_name: string;
  relationship_to_principal_member: string;
  is_primary: boolean;
  date_joined: string | null;
  pricelist_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateCustomerInsurancePayload = {
  insurance_scheme: number;
  membership_number: string;
  suffix?: string;
  is_principal_member: boolean;
  principal_member_name?: string;
  relationship_to_principal_member?: string;
  is_primary?: boolean;
  date_joined?: string;
  is_active?: boolean;
};

export type UpdateCustomerInsurancePayload = Partial<CreateCustomerInsurancePayload>;

export const PRINCIPAL_MEMBER_RELATIONSHIPS = [
  "Self",
  "Spouse",
  "Child",
  "Sister",
  "Brother",
  "Parent",
  "Stepchild",
  "Legal Guardian",
  "Partner",
] as const;

export type PrincipalMemberRelationship =
  (typeof PRINCIPAL_MEMBER_RELATIONSHIPS)[number];
