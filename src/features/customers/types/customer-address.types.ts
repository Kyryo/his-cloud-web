export type CustomerAddressType =
  | "HOME"
  | "WORK"
  | "BILLING"
  | "MAILING"
  | "OTHER";

export type CustomerAddress = {
  id: number;
  uuid: string;
  tenant: number;
  customer: number;
  customer_name: string;
  customer_identifier: string;
  address_type: CustomerAddressType;
  line1: string;
  line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_name: string;
};

export type CreateCustomerAddressPayload = {
  customer: number;
  address_type: CustomerAddressType;
  line1: string;
  line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  is_primary?: boolean;
  notes?: string;
  is_active?: boolean;
};

export type UpdateCustomerAddressPayload = Omit<
  CreateCustomerAddressPayload,
  "customer"
>;

export const CUSTOMER_ADDRESS_TYPE_OPTIONS: Array<{
  value: CustomerAddressType;
  label: string;
}> = [
  { value: "HOME", label: "Home" },
  { value: "WORK", label: "Work" },
  { value: "BILLING", label: "Billing" },
  { value: "MAILING", label: "Mailing" },
  { value: "OTHER", label: "Other" },
];
