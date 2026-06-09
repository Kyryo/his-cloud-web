export type CustomerVisit = {
  id: number;
  uuid: string;
  visit_type: string;
  visit_type_name: string;
  is_dentist_visit: boolean;
  customer: string;
  customer_name: string;
  customer_identifier: string;
  visit_date: string;
  status: string;
  mode_of_payment: "cash" | "insurance";
  insurance_scheme: string | null;
  requires_pre_authorization: boolean;
  pre_authorization_number: string;
  pre_authorization_comments: string;
  is_active: boolean;
  clinic: string | null;
  clinic_name: string | null;
  created_by: number | null;
  created_by_name: string | null;
  created_by_email?: string | null;
  created_at: string;
  updated_at: string;
};

export type VisitTypeCatalogItem = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  is_active: boolean;
};

export type CreateVisitPayload = {
  visit_type: string;
  customer: string;
  visit_date?: string;
  mode_of_payment: "cash" | "insurance";
  insurance_scheme?: string | null;
  requires_pre_authorization?: boolean;
  pre_authorization_number?: string;
  pre_authorization_comments?: string;
};

export type FetchCustomerVisitsOptions = {
  limit?: number;
};
