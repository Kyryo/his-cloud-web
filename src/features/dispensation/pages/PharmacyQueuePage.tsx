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
import { PharmacyQueueDispenseStatusBadge } from "@/features/dispensation/components/PharmacyQueueDispenseStatusBadge";
import { fetchDispensationQueue } from "@/features/dispensation/services/dispensation.service";
import type { DispensationQueueItem } from "@/features/dispensation/types/dispensation.types";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export function PharmacyQueuePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<DispensationQueueItem[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      try {
        const response = await fetchDispensationQueue({
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
            title: "Could not load pharmacy queue",
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
    <ListPageLayout data-testid="pharmacy-queue-page">
      <InventoryListPageHeader
        title="Pharmacy queue"
        description="Dispense storable products from sales orders."
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
            placeholder="Search order or patient…"
            className="max-w-sm"
            data-testid="pharmacy-queue-search"
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
            onClick={() => router.push(ROUTES.pharmacyHistory)}
          >
            View history
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-brand-muted">Loading queue…</p>
        ) : items.length === 0 ? (
          <InventoryListEmptyState
            icon={Pill}
            title="No orders waiting"
            description="Need a sales order with storable products (not services), a clinic on the order, and a state at or past the pharmacy queue start setting (default: confirmed/sale)."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-brand-border bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Clinic
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Ordered
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {items.map((item) => (
                  <tr
                    key={item.uuid}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-slate-50",
                    )}
                    onClick={() =>
                      router.push(ROUTES.pharmacyQueueDetail(item.uuid))
                    }
                  >
                    <td className="px-4 py-3 font-mono text-sm font-medium text-brand-navy">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {item.customer_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {item.clinic_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <PharmacyQueueDispenseStatusBadge
                        dispensableLineCount={item.dispensable_line_count}
                        remainingLineCount={item.remaining_line_count}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-muted">
                      {formatDisplayDateTime(item.date_order)}
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
