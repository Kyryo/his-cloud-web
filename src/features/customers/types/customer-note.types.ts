export type CustomerNoteType =
  | "GENERAL"
  | "CLINICAL"
  | "BILLING"
  | "ADMINISTRATIVE"
  | "OTHER";

export type CustomerNote = {
  id: number;
  uuid: string;
  tenant: number;
  customer: number;
  customer_name: string;
  customer_identifier: string;
  note_type: CustomerNoteType;
  title: string;
  body: string;
  is_pinned: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_name: string;
};

export type CreateCustomerNotePayload = {
  customer: number;
  note_type?: CustomerNoteType;
  title?: string;
  body: string;
  is_pinned?: boolean;
  is_active?: boolean;
};

export type UpdateCustomerNotePayload = Omit<
  CreateCustomerNotePayload,
  "customer"
>;

export const CUSTOMER_NOTE_TYPE_OPTIONS: Array<{
  value: CustomerNoteType;
  label: string;
}> = [
  { value: "GENERAL", label: "General" },
  { value: "CLINICAL", label: "Clinical" },
  { value: "BILLING", label: "Billing" },
  { value: "ADMINISTRATIVE", label: "Administrative" },
  { value: "OTHER", label: "Other" },
];
