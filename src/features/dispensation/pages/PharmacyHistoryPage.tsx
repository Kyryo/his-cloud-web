"use client";

import { Pill } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { fetchDispensations } from "@/features/dispensation/services/dispensation.service";
import type { Dispensation } from "@/features/dispensation/types/dispensation.types";
import { formatDispensationQuantity } from "@/features/dispensation/utils/dispensation-qty";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";
import { useToast } from "@/providers/toast-provider";

const PAGE_SIZE = 20;

export function PharmacyHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<Dispensation[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      try {
        const response = await fetchDispensations({
          page,
          page_size: PAGE_SIZE,
          search: submittedSearch || undefined,
        });
        if (!cancelled) {
          setItems(response.results ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Could not load dispensation history",
            description:
              error instanceof Error ? error.message : "Something went wrong.",
            variant: "error",
          });
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [page, submittedSearch, toast]);

  return (
    <ListPageLayout data-testid="pharmacy-history-page">
      <InventoryListPageHeader
        title="Dispensation history"
        description="Completed pharmacy dispensations."
      />

      <ListPageDataSectionsStack>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setPage(1);
                setSubmittedSearch(search.trim());
              }
            }}
            placeholder="Search…"
            className="max-w-sm"
          />
          <button
            type="button"
            className="text-sm font-medium text-brand-primary underline-offset-2 hover:underline"
            onClick={() => {
              setPage(1);
              setSubmittedSearch(search.trim());
            }}
          >
            Search
          </button>
          <button
            type="button"
            className="text-sm text-brand-muted hover:text-brand-navy"
            onClick={() => router.push(ROUTES.pharmacyQueue)}
          >
            Back to queue
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-brand-muted">Loading history…</p>
        ) : items.length === 0 ? (
          <InventoryListEmptyState
            icon={Pill}
            title="No dispensations yet"
            description="Completed dispensations will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-brand-border bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    When
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Location
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {items.map((item) => (
                  <tr key={item.uuid}>
                    <td className="px-4 py-3 text-sm text-brand-muted">
                      {formatDisplayDateTime(item.dispensed_at)}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-brand-navy">
                      {item.sales_order_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {item.product_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {item.location_name}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-brand-slate">
                      {formatDispensationQuantity(item.quantity)}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {item.dispensed_by_name ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="text-sm disabled:opacity-40"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span className="text-sm text-brand-muted">Page {page}</span>
          <button
            type="button"
            className="text-sm disabled:opacity-40"
            disabled={items.length < PAGE_SIZE || isLoading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      </ListPageDataSectionsStack>
    </ListPageLayout>
  );
}
