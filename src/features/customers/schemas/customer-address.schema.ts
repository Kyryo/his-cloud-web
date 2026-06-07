import { z } from "zod";

import type { CustomerAddress, CustomerAddressType } from "@/features/customers/types/customer-address.types";

const addressTypeSchema = z.enum([
  "HOME",
  "WORK",
  "BILLING",
  "MAILING",
  "OTHER",
]) satisfies z.ZodType<CustomerAddressType>;

export const createCustomerAddressSchema = z.object({
  address_type: addressTypeSchema,
  line1: z.string().trim().min(1, "Address line 1 is required."),
  line2: z.string().trim(),
  city: z.string().trim(),
  state_province: z.string().trim(),
  postal_code: z.string().trim(),
  country: z.string().trim(),
  is_primary: z.boolean(),
  notes: z.string().trim(),
  is_active: z.boolean(),
});

export type CreateCustomerAddressFormValues = z.infer<
  typeof createCustomerAddressSchema
>;

export const createCustomerAddressDefaultValues: CreateCustomerAddressFormValues =
  {
    address_type: "HOME",
    line1: "",
    line2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "",
    is_primary: true,
    notes: "",
    is_active: true,
  };

export function toCustomerAddressPayload(
  customerId: number,
  values: CreateCustomerAddressFormValues,
) {
  return {
    customer: customerId,
    address_type: values.address_type,
    line1: values.line1.trim(),
    line2: values.line2.trim(),
    city: values.city.trim(),
    state_province: values.state_province.trim(),
    postal_code: values.postal_code.trim(),
    country: values.country.trim(),
    is_primary: values.is_primary,
    notes: values.notes.trim(),
    is_active: values.is_active,
  };
}

export function toUpdateCustomerAddressFormValues(
  address: CustomerAddress,
): CreateCustomerAddressFormValues {
  return {
    address_type: address.address_type,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city ?? "",
    state_province: address.state_province ?? "",
    postal_code: address.postal_code ?? "",
    country: address.country ?? "",
    is_primary: address.is_primary,
    notes: address.notes ?? "",
    is_active: address.is_active,
  };
}

export function toUpdateCustomerAddressPayload(
  values: CreateCustomerAddressFormValues,
) {
  const { customer: _customer, ...payload } = toCustomerAddressPayload(0, values);
  return payload;
}
