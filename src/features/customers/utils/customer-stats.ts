import type { Customer } from "@/features/customers/types/customer.types";
import { fetchCustomers } from "@/features/customers/services/customers.service";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import { formatCompactNumber } from "@/utils/format-compact-number";

export type CustomerSummaryStats = {
  totalClients: number;
  newThisMonth: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  averageAge: number;
};

const STATS_PAGE_SIZE = 100;
const MAX_STATS_PAGES = 10;

function startOfCurrentMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseCreatedAt(value: string): Date {
  return new Date(value);
}

async function fetchCount(filters: Parameters<typeof fetchCustomers>[0] = {}) {
  const response = await fetchCustomers({
    page: 1,
    pageSize: 1,
    isActive: true,
    ...filters,
  });

  return response.pagination?.count ?? response.results.length;
}

type ScanResult = {
  newThisMonth: number;
  averageAge: number;
};

/**
 * Single pass over the active-customer pages (ordered by newest first) that
 * derives both "new this month" and "average age" — avoiding two overlapping
 * sets of paginated requests.
 */
async function scanActiveCustomers(totalClients: number): Promise<ScanResult> {
  if (totalClients === 0) {
    return { newThisMonth: 0, averageAge: 0 };
  }

  const monthStart = startOfCurrentMonth();
  const pagesToFetch = Math.min(
    MAX_STATS_PAGES,
    Math.max(1, Math.ceil(totalClients / STATS_PAGE_SIZE)),
  );

  let newThisMonth = 0;
  let countingNew = true;
  let ageSum = 0;
  let ageCount = 0;

  for (let page = 1; page <= pagesToFetch; page += 1) {
    const response = await fetchCustomers({
      page,
      pageSize: STATS_PAGE_SIZE,
      isActive: true,
      ordering: "-created_at",
    });

    if (response.results.length === 0) {
      break;
    }

    for (const customer of response.results) {
      if (countingNew) {
        if (parseCreatedAt(customer.created_at) >= monthStart) {
          newThisMonth += 1;
        } else {
          countingNew = false;
        }
      }

      if (customer.age > 0) {
        ageSum += customer.age;
        ageCount += 1;
      }
    }

    if (!response.pagination?.next) {
      break;
    }
  }

  return {
    newThisMonth,
    averageAge: ageCount === 0 ? 0 : Math.round((ageSum / ageCount) * 10) / 10,
  };
}

export async function fetchCustomerSummaryStats(): Promise<CustomerSummaryStats> {
  const [totalClients, maleCount, femaleCount, otherCount] = await Promise.all([
    fetchCount(),
    fetchCount({ gender: "Male" }),
    fetchCount({ gender: "Female" }),
    fetchCount({ gender: "Other" }),
  ]);

  const { newThisMonth, averageAge } = await scanActiveCustomers(totalClients);

  return {
    totalClients,
    newThisMonth,
    maleCount,
    femaleCount,
    otherCount,
    averageAge,
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
