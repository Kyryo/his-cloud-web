import { BFF_CUSTOMERS_ROUTES } from "@/constants/api";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import { bffRequest } from "@/lib/bff-client";
import { formatCompactNumber } from "@/utils/format-compact-number";

export type CustomerSummaryStats = {
  totalClients: number;
  newThisMonth: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  averageAge: number;
};

type CustomerSummaryStatsResponse = {
  total_clients: number;
  new_this_month: number;
  male_count: number;
  female_count: number;
  other_count: number;
  average_age: number;
};

export async function fetchCustomerSummaryStats(): Promise<CustomerSummaryStats> {
  const data = await bffRequest<CustomerSummaryStatsResponse>(
    BFF_CUSTOMERS_ROUTES.summaryStats,
  );

  return {
    totalClients: data.total_clients,
    newThisMonth: data.new_this_month,
    maleCount: data.male_count,
    femaleCount: data.female_count,
    otherCount: data.other_count,
    averageAge: data.average_age,
  };
}

export function formatGenderCounts(stats: CustomerSummaryStats): string {
  if (stats.totalClients === 0) {
    return "—";
  }

  return `${formatCompactNumber(stats.maleCount)} / ${formatCompactNumber(stats.femaleCount)}`;
}

export function formatGenderBreakdown(stats: CustomerSummaryStats): string {
  const parts = [
    `${formatCompactNumber(stats.maleCount)} male`,
    `${formatCompactNumber(stats.femaleCount)} female`,
  ];

  if (stats.otherCount > 0) {
    parts.push(`${formatCompactNumber(stats.otherCount)} other`);
  }

  if (stats.totalClients === 0) {
    return "—";
  }

  return parts.join(" · ");
}

export function normalizeCustomerNameKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function findDuplicateCustomerNameKeys(
  customers: Customer[],
): Set<string> {
  const counts = new Map<string, number>();

  for (const customer of customers) {
    const key = normalizeCustomerNameKey(formatCustomerName(customer));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([key]) => key),
  );
}

export function isPossibleDuplicateCustomer(
  customer: Customer,
  duplicateKeys: Set<string>,
): boolean {
  return duplicateKeys.has(
    normalizeCustomerNameKey(formatCustomerName(customer)),
  );
}
