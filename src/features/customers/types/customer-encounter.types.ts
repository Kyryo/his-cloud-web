import type { PaginatedListResponse } from "@/types/api.types";

export type CustomerEncounterAction =
  | "CUSTOMER_CREATED"
  | "CUSTOMER_UPDATED"
  | "CUSTOMER_ARCHIVED"
  | "OPENING_BALANCE_UPDATED"
  | "INSURANCE_ADDED"
  | "INSURANCE_UPDATED"
  | "INSURANCE_ARCHIVED"
  | "ADDRESS_ADDED"
  | "ADDRESS_UPDATED"
  | "ADDRESS_ARCHIVED"
  | "NOTE_ADDED"
  | "NOTE_UPDATED"
  | "NOTE_ARCHIVED"
  | "ORDER_ADDED"
  | "ORDER_CANCELLED"
  | "ORDER_CONFIRMED"
  | "ORDER_INVOICED"
  | "ORDER_REOPENED"
  | "ORDER_PROVIDER_UPDATED"
  | "ORDER_PAYMENT_SPLIT_UPDATED"
  | "ORDER_LINE_ADDED"
  | "ORDER_LINE_UPDATED"
  | "ORDER_LINE_REMOVED"
  | "INVOICE_CREATED"
  | "INVOICE_UPDATED"
  | "INVOICE_CANCELLED"
  | "PAYMENT_RECORDED"
  | "PAYMENT_UPDATED"
  | "PAYMENT_CANCELLED"
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
