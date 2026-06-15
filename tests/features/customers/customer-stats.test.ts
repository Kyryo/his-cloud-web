import { describe, expect, it } from "vitest";

import {
  findDuplicateCustomerNameKeys,
  formatGenderBreakdown,
  formatGenderCounts,
  isPossibleDuplicateCustomer,
  normalizeCustomerNameKey,
} from "@/features/customers/utils/customer-stats";
import type { Customer } from "@/features/customers/types/customer.types";

function createCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 1,
    uuid: "uuid-1",
    tenant: 1,
    first_name: "Ada",
    middle_name: null,
    last_name: "Lovelace",
    full_name: "Ada Lovelace",
    customer_identifier: "P-001",
    phone_number: null,
    email: null,
    patient_uuid: "patient-1",
    gender: "Female",
    dob: "2000-01-01",
    dob_is_estimated: false,
    age: 26,
    has_synced_to_openmrs: false,
    is_active: true,
    visit_status: "not_started",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    created_by: null,
    ...overrides,
  };
}

describe("formatGenderCounts", () => {
  it("formats male and female counts with a slash", () => {
    expect(
      formatGenderCounts({
        totalClients: 10,
        newThisMonth: 2,
        maleCount: 4,
        femaleCount: 5,
        otherCount: 1,
        averageAge: 32,
      }),
    ).toBe("4 / 5");
  });
});

describe("formatGenderBreakdown", () => {
  it("summarizes gender counts", () => {
    expect(
      formatGenderBreakdown({
        totalClients: 10,
        newThisMonth: 2,
        maleCount: 4,
        femaleCount: 5,
        otherCount: 1,
        averageAge: 32,
      }),
    ).toBe("4 male · 5 female · 1 other");
  });
});

describe("duplicate customer detection", () => {
  it("flags rows that share a normalized name on the current page", () => {
    const customers = [
      createCustomer({ uuid: "a", full_name: "Ada Lovelace" }),
      createCustomer({ uuid: "b", full_name: "ada lovelace" }),
      createCustomer({ uuid: "c", full_name: "Grace Hopper" }),
    ];

    const duplicateKeys = findDuplicateCustomerNameKeys(customers);

    expect(normalizeCustomerNameKey("Ada Lovelace")).toBe("ada lovelace");
    expect(duplicateKeys.has("ada lovelace")).toBe(true);
    expect(isPossibleDuplicateCustomer(customers[0], duplicateKeys)).toBe(true);
    expect(isPossibleDuplicateCustomer(customers[2], duplicateKeys)).toBe(false);
  });
});
