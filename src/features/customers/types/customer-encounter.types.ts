import type { PaginatedListResponse } from "@/types/api.types";

export type CustomerEncounterAction =
  | "CUSTOMER_CREATED"
  | "CUSTOMER_UPDATED"
  | "CUSTOMER_ARCHIVED"
  | "INSURANCE_ADDED"
  | "INSURANCE_UPDATED"
  | "INSURANCE_ARCHIVED"
  | "ADDRESS_ADDED"
  | "ADDRESS_UPDATED"
  | "ADDRESS_ARCHIVED"
  | "NOTE_ADDED"
  | "NOTE_UPDATED"
  | "NOTE_ARCHIVED"
  | "OTHER"
  | string;

export type CustomerEncounter = {
  id: number;
  uuid: string;
  tenant: number;
  customer: number;
  customer_name: string;
  customer_identifier: string;
  occurred_at: string;
  actor: number | null;
  actor_name: string;
  actor_email: string;
  action: CustomerEncounterAction;
  action_display: string;
  summary: string;
  details: Record<string, unknown>;
  source: string;
  related_object_type: string;
  related_object_id: number | null;
  related_object_uuid: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerEncountersListResponse =
  PaginatedListResponse<CustomerEncounter>;

export type CustomerEncountersListFilters = {
  customerId: number;
  page?: number;
  pageSize?: number;
};
