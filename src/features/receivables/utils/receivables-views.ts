import { ROUTES } from "@/constants/routes";
import {
  RECEIVABLES_AGING_BUCKETS,
  type ReceivablesAgingBucket,
} from "@/features/receivables/types/receivables.types";

export const RECEIVABLES_VIEWS = ["debtors", "invoices"] as const;
export type ReceivablesView = (typeof RECEIVABLES_VIEWS)[number];

export const RECEIVABLES_VIEW_PARAM = "view";
export const RECEIVABLES_SEARCH_PARAM = "q";
export const RECEIVABLES_PAGE_PARAM = "page";
export const RECEIVABLES_AGING_PARAM = "aging";

export function parseReceivablesView(
  value: string | null | undefined,
): ReceivablesView {
  return value === "invoices" ? "invoices" : "debtors";
}

export function parseReceivablesAging(
  value: string | null | undefined,
): ReceivablesAgingBucket | null {
  if (
    value &&
    (RECEIVABLES_AGING_BUCKETS as readonly string[]).includes(value)
  ) {
    return value as ReceivablesAgingBucket;
  }
  return null;
}

export function parseReceivablesPage(value: string | null | undefined): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

type ReceivablesHrefOptions = {
  view?: ReceivablesView;
  search?: string;
  page?: number;
  aging?: ReceivablesAgingBucket | null;
};

export function receivablesHref({
  view = "debtors",
  search = "",
  page = 1,
  aging = null,
}: ReceivablesHrefOptions = {}): string {
  const params = new URLSearchParams();

  if (view === "invoices") {
    params.set(RECEIVABLES_VIEW_PARAM, "invoices");
  }

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.set(RECEIVABLES_SEARCH_PARAM, trimmedSearch);
  }

  if (page > 1) {
    params.set(RECEIVABLES_PAGE_PARAM, String(page));
  }

  if (view === "invoices" && aging) {
    params.set(RECEIVABLES_AGING_PARAM, aging);
  }

  const query = params.toString();
  return query ? `${ROUTES.receivables}?${query}` : ROUTES.receivables;
}
