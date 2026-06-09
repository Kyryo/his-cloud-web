import type { CustomerVisitStatus } from "@/features/customers/types/customer-visit-status.types";

export type CustomerGender = "Male" | "Female" | "Other";

export type Customer = {
  id: number;
  uuid: string;
  tenant: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  customer_identifier: string;
  phone_number: string | null;
  email: string | null;
  patient_uuid: string;
  gender: CustomerGender | string;
  dob: string;
  dob_is_estimated: boolean;
  age: number;
  has_synced_to_openmrs: boolean;
  has_synced_to_odoo: boolean;
  is_active: boolean;
  visit_status: CustomerVisitStatus;
  created_at: string;
  updated_at: string;
  created_by: number | null;
};

export type { CustomerVisitStatus };

export type CustomersPagination = {
  count: number;
  next: string | null;
  previous: string | null;
};

export type CustomersListResponse = {
  results: Customer[];
  pagination: CustomersPagination | null;
};

export type CustomerListFilters = {
  search?: string;
  page?: number;
  pageSize?: number;
  gender?: CustomerGender;
  hasSyncedToOdoo?: boolean;
  isActive?: boolean;
  ordering?: string;
};

export type CreateCustomerPayload = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: CustomerGender;
  dob?: string;
  dob_is_estimated?: boolean;
  phone_number?: string;
  email?: string;
  customer_identifier?: string;
};

export type UpdateCustomerPayload = CreateCustomerPayload;
