import { describe, expect, it } from "vitest";

import type { User } from "@/features/auth/types/auth.types";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import {
  canCloseCustomerVisit,
  getCloseCustomerVisitTooltip,
} from "@/features/customers/utils/can-close-customer-visit";

const clinicIdByUuid = new Map([
  ["clinic-uuid-a", 10],
  ["clinic-uuid-b", 20],
]);

const activeVisit: CustomerVisit = {
  id: 1,
  uuid: "visit-1",
  status: "active",
  clinic: "clinic-uuid-a",
  clinic_name: "Main Clinic",
  visit_type: "type-1",
  visit_type_name: "Outpatient",
  is_dentist_visit: false,
  customer: "customer-1",
  customer_name: "Ada Lovelace",
  customer_identifier: "P-001",
  visit_date: "2024-01-01T10:00:00Z",
  mode_of_payment: "cash",
  insurance_scheme: null,
  requires_pre_authorization: false,
  pre_authorization_number: "",
  pre_authorization_comments: "",
  is_active: true,
  created_by: 1,
  created_by_name: "Dr. Smith",
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-01T10:00:00Z",
};

const baseUser: User = {
  id: 1,
  name: "Admin User",
  url: "/users/1/",
  email: "admin@example.com",
  permissions: {},
  is_admin: true,
  is_active: true,
  location: null,
  groups: [],
  tenant: null,
  clinics: [],
  locations: [],
  primary_clinic: null,
  primary_location: null,
};

const clinicUser: User = {
  ...baseUser,
  is_admin: false,
  clinics: [
    {
      id: 1,
      clinic: 10,
      clinic_name: "Main Clinic",
      clinic_code: "MAIN",
      tenant_name: "Tenant",
      role: "staff",
      is_primary: true,
      is_active: true,
    },
  ],
};

const otherClinicUser: User = {
  ...baseUser,
  is_admin: false,
  clinics: [
    {
      id: 2,
      clinic: 20,
      clinic_name: "Branch Clinic",
      clinic_code: "BRANCH",
      tenant_name: "Tenant",
      role: "staff",
      is_primary: true,
      is_active: true,
    },
  ],
};

describe("canCloseCustomerVisit", () => {
  it("allows admins to close any visit", () => {
    expect(canCloseCustomerVisit(baseUser, activeVisit, clinicIdByUuid)).toBe(
      true,
    );
  });

  it("allows users assigned to the visit clinic", () => {
    expect(canCloseCustomerVisit(clinicUser, activeVisit, clinicIdByUuid)).toBe(
      true,
    );
  });

  it("denies users not assigned to the visit clinic", () => {
    expect(
      canCloseCustomerVisit(otherClinicUser, activeVisit, clinicIdByUuid),
    ).toBe(false);
  });

  it("returns a tooltip when the user cannot close the visit", () => {
    const tooltip = getCloseCustomerVisitTooltip(
      otherClinicUser,
      activeVisit,
      clinicIdByUuid,
    );

    expect(tooltip).toContain("Main Clinic");
    expect(tooltip).toContain("assigned clinics");
  });
});
