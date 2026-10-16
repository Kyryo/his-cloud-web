"use client";

import { Receipt } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { OverviewEmptyState } from "@/features/platform-admin/components/overview/OverviewEmptyState";
import { OverviewSection } from "@/features/platform-admin/components/overview/OverviewSection";
import { OverviewSegmentedControl } from "@/features/platform-admin/components/overview/OverviewSegmentedControl";
import {
  formatMoney,
  type FinanceRecordKind,
  type FinanceRecordRow,
} from "@/features/platform-admin/utils/finance-series";

type Filter = "all" | FinanceRecordKind;

const KIND_META: Record<
  FinanceRecordKind,
  { label: string; dot: string; sign: string }
> = {
  payment: { label: "Payment", dot: "bg-primary", sign: "+" },
  cost: { label: "Cost", dot: "bg-[#d4a373] dark:bg-[#c08a55]", sign: "−" },
  cash: { label: "Cash balance", dot: "bg-foreground/40", sign: "" },
};

const PAGE = 12;

function formatDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

type Props = { rows: FinanceRecordRow[] };

export function FinanceRecordsTable({ rows }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [visible, setVisible] = useState(PAGE);
  const counts = useMemo(
    () => ({
      all: rows.length,
      payment: rows.filter((r) => r.kind === "payment").length,
      cost: rows.filter((r) => r.kind === "cost").length,
      cash: rows.filter((r) => r.kind === "cash").length,
    }),
    [rows],
  );
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.kind === filter)),
    [rows, filter],
  );

  return (
    <OverviewSection
      title="History"
      description="Every recorded payment, cost and cash balance, newest first."
      actions={
        <OverviewSegmentedControl<Filter>
          label="Filter records"
          options={[
            { value: "all", label: `All ${counts.all}` },
            { value: "payment", label: `Payments ${counts.payment}` },
            { value: "cost", label: `Costs ${counts.cost}` },
            { value: "cash", label: `Cash ${counts.cash}` },
          ]}
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setVisible(PAGE);
          }}
        />
      }
    >
      {filtered.length === 0 ? (
        <OverviewEmptyState
          icon={Receipt}
          title="No records"
          description={
            rows.length === 0
              ? "Record your first payment, cost or cash balance to start tracking."
              : "Nothing matches this filter."
          }
          height={200}
        />
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-2 pb-2 font-medium">Date</th>
                <th className="px-2 pb-2 font-medium">Type</th>
                <th className="px-2 pb-2 font-medium">Description</th>
                <th className="px-2 pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/[0.06] border-t border-foreground/[0.07]">
              {filtered.slice(0, visible).map((row) => {
                const meta = KIND_META[row.kind];
                return (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-foreground/[0.025]"
                  >
                    <td className="whitespace-nowrap px-2 py-3 text-muted-foreground tabular-nums">
                      {formatDate(row.date)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3">
                      <span className="inline-flex items-center gap-2 text-foreground">
                        <i className={cn("size-1.5 rounded-full", meta.dot)} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span className="block font-medium text-foreground">
                        {row.title}
                      </span>
                      <span className="block max-w-md truncate text-xs text-muted-foreground">
                        {row.detail}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "whitespace-nowrap px-2 py-3 text-right font-semibold tabular-nums",
                        row.kind === "payment" &&
                          "text-emerald-700 dark:text-emerald-400",
                        row.kind === "cost" && "text-foreground",
                        row.kind === "cash" && "text-muted-foreground",
                      )}
                    >
                      {meta.sign}
                      {formatMoney(row.amount, row.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length > visible ? (
            <div className="flex justify-center border-t border-foreground/[0.07] pt-3">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE * 2)}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              >
                Show more ({filtered.length - visible} remaining)
              </button>
            </div>
          ) : null}
        </div>
      )}
    </OverviewSection>
  );
}
