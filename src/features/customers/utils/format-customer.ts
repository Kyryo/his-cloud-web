import type { Customer } from "@/features/customers/types/customer.types";

export function formatCustomerName(customer: Pick<
  Customer,
  "first_name" | "middle_name" | "last_name" | "full_name"
>): string {
  if (customer.full_name?.trim()) {
    return customer.full_name.trim();
  }

  return [customer.first_name, customer.middle_name, customer.last_name]
    .filter(Boolean)
    .join(" ");
}

const CLIENT_NAME_SEARCH_PATTERN = /^[a-zA-Z][a-zA-Z\s\-']*$/;

export function looksLikeClientName(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 2 && CLIENT_NAME_SEARCH_PATTERN.test(trimmed);
}

export function splitClientSearchName(value: string): {
  first_name: string;
  middle_name: string;
  last_name: string;
} {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { first_name: "", middle_name: "", last_name: "" };
  }

  if (parts.length === 1) {
    return { first_name: parts[0], middle_name: "", last_name: "" };
  }

  if (parts.length === 2) {
    return { first_name: parts[0], middle_name: "", last_name: parts[1] };
  }

  return {
    first_name: parts[0],
    middle_name: parts.slice(1, -1).join(" "),
    last_name: parts[parts.length - 1],
  };
}

export function formatCustomerSearchLabel(
  customer: Pick<
    Customer,
    | "first_name"
    | "middle_name"
    | "last_name"
    | "full_name"
    | "customer_identifier"
  >,
): string {
  const name = formatCustomerName(customer);
  return customer.customer_identifier
    ? `${name} · ${customer.customer_identifier}`
    : name;
}

export function formatDisplayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDisplayDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function calculateAgeInDays(dob?: string | null): number | null {
  if (!dob) {
    return null;
  }

  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  const diffMs = today.getTime() - birthDate.getTime();
  if (diffMs < 0) {
    return null;
  }

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function formatAdaptiveAge(dob?: string | null): string {
  const diffDays = calculateAgeInDays(dob);
  if (diffDays === null) {
    return "N/A";
  }

  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  }

  const birthDate = new Date(dob as string);
  const today = new Date();

  const months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth()) -
    (today.getDate() < birthDate.getDate() ? 1 : 0);
  if (months < 12) {
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    years--;
  }

  return `${years} year${years === 1 ? "" : "s"}`;
}
