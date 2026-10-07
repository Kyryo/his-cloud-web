import type { CustomerGender } from "@/features/customers/types/customer.types";
import type { PayerMember } from "@/features/customers/types/payer-member.types";
import { splitClientSearchName } from "@/features/customers/utils/format-customer";

export type CustomerRegistrationDraft = {
  firstName: string;
  middleName: string;
  lastName: string;
  gender?: CustomerGender;
  dob?: string;
  phoneNumber?: string;
  email?: string;
  membershipNumber: string;
  suffix: string;
  isPrincipalMember: boolean;
  relationship: string;
  principalMemberName: string;
  schemeName: string;
};

const RELATIONSHIPS: Record<string, string> = {
  wife: "Spouse",
  husband: "Spouse",
  spouse: "Spouse",
  child: "Child",
  son: "Child",
  daughter: "Child",
  sister: "Sister",
  brother: "Brother",
  parent: "Parent",
  father: "Parent",
  mother: "Parent",
  partner: "Partner",
};

function memberText(member: PayerMember, ...keys: string[]) {
  const record = member as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function titleCaseName(value: string) {
  return value
    .toLowerCase()
    .replace(/(^|[\s'-])([a-z])/g, (_match, separator: string, letter: string) => {
      return `${separator}${letter.toUpperCase()}`;
    });
}

function personName(member: PayerMember) {
  const first = titleCaseName(memberText(member, "first_name", "firstName"));
  const last = titleCaseName(memberText(member, "last_name", "lastName"));
  if (first || last) {
    const lastParts = last.split(/\s+/).filter(Boolean);
    if (lastParts.length <= 1) {
      return { firstName: first, middleName: "", lastName: last };
    }
    return {
      firstName: first,
      middleName: lastParts.slice(0, -1).join(" "),
      lastName: lastParts[lastParts.length - 1] ?? "",
    };
  }

  const split = splitClientSearchName(titleCaseName(memberText(member, "name")));
  return {
    firstName: split.first_name,
    middleName: split.middle_name,
    lastName: split.last_name,
  };
}

function memberGender(value: string): CustomerGender | undefined {
  const normalized = value.trim().toLowerCase();
  if (normalized === "m" || normalized === "male") {
    return "Male";
  }
  if (normalized === "f" || normalized === "female") {
    return "Female";
  }
  if (normalized === "other") {
    return "Other";
  }
  return undefined;
}

function memberDob(value: string) {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const slash = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(trimmed);
  if (!slash) {
    return undefined;
  }
  const day = slash[1]?.padStart(2, "0");
  const month = slash[2]?.padStart(2, "0");
  const year = slash[3];
  return `${year}-${month}-${day}`;
}

function splitMembership(value: string) {
  const trimmed = value.trim();
  const dash = trimmed.lastIndexOf("-");
  if (dash <= 0) {
    return { membershipNumber: trimmed, suffix: "" };
  }
  const suffix = trimmed.slice(dash + 1);
  if (!/^\d+$/.test(suffix)) {
    return { membershipNumber: trimmed, suffix: "" };
  }
  return { membershipNumber: trimmed.slice(0, dash), suffix };
}

export function toCustomerRegistrationDraft(
  member: PayerMember,
  payerCode = "",
): CustomerRegistrationDraft {
  const name = personName(member);
  const fullMembership = memberText(member, "membership_number");
  const membership = splitMembership(fullMembership);
  const relationship = memberText(member, "relationship").toLowerCase();
  const suffixIsPrincipal =
    payerCode.trim().toUpperCase() === "MASM" && membership.suffix === "0";
  const relationshipIsPrincipal =
    relationship === "holder" ||
    relationship === "principal" ||
    relationship === "self" ||
    relationship === "member";
  const isPrincipalMember = suffixIsPrincipal || relationshipIsPrincipal;
  const fullName = [name.firstName, name.middleName, name.lastName]
    .filter(Boolean)
    .join(" ");
  const email = memberText(member, "email");

  return {
    ...name,
    gender: memberGender(memberText(member, "gender", "sex")),
    dob: memberDob(
      memberText(member, "date_of_birth", "dob", "birth_date", "dateOfBirth"),
    ),
    phoneNumber: memberText(member, "phone_number", "phone", "mobile", "cellphone"),
    email: email.includes("@") ? email : undefined,
    membershipNumber: fullMembership,
    suffix: "",
    isPrincipalMember,
    relationship: isPrincipalMember ? "Self" : RELATIONSHIPS[relationship] ?? "",
    principalMemberName: isPrincipalMember ? fullName : "",
    schemeName: memberText(member, "productName", "product_name", "scheme_name"),
  };
}
