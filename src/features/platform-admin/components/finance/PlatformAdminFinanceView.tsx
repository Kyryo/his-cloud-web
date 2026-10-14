"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMemo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { FinanceRecordsTable } from "@/features/platform-admin/components/finance/FinanceRecordsTable";
import { FinanceTrendChart } from "@/features/platform-admin/components/finance/FinanceTrendChart";
import { OverviewStatStrip } from "@/features/platform-admin/components/overview/OverviewStatStrip";
import {
  buildFinanceMonthlySeries,
  buildFinanceRecordRows,
  summarizeFinance,
  type FinanceRecordKind,
  type FinanceRecords,
} from "@/features/platform-admin/utils/finance-series";
import { buildFinanceStats } from "@/features/platform-admin/utils/finance-stats";

function Reveal({ index, children }: { index: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.06 + index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function FinancePageHeader({
  onRecord,
}: {
  onRecord?: (kind: FinanceRecordKind) => void;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-foreground">
          Finance
        </h1>
        <p className="text-sm text-muted-foreground">
          Tenant payments, operating costs and cash: the inputs behind revenue,
          burn and runway.
        </p>
      </div>
      {onRecord ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onRecord("cost")}>
            Add cost
          </Button>
          <Button size="sm" onClick={() => onRecord("payment")}>
            <Plus className="mr-1 size-4" aria-hidden />
            Record entry
          </Button>
        </div>
      ) : null}
    </header>
  );
}

type Props = {
  records: FinanceRecords;
  onRecord: (kind: FinanceRecordKind) => void;
};

/** Presentational finance dashboard; data and actions are passed in. */
export function PlatformAdminFinanceView({ records, onRecord }: Props) {
  const summary = useMemo(() => summarizeFinance(records), [records]);
  const stats = useMemo(() => buildFinanceStats(summary), [summary]);
  const series = useMemo(
    () => buildFinanceMonthlySeries(records, summary.currency),
    [records, summary.currency],
  );
  const rows = useMemo(() => buildFinanceRecordRows(records), [records]);

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-14 pb-16 text-foreground">
      <Reveal index={0}>
        <FinancePageHeader onRecord={onRecord} />
      </Reveal>
      <div className="space-y-3">
        <OverviewStatStrip stats={stats} />
        {summary.excludedRecordCount > 0 ? (
          <p className="text-xs text-muted-foreground">
            {summary.excludedRecordCount} record(s) in other currencies are
            listed in history but excluded from totals ({summary.currency}{" "}
            shown).
          </p>
        ) : null}
      </div>
      <Reveal index={1}>
        <FinanceTrendChart series={series} currency={summary.currency} />
      </Reveal>
      <Reveal index={2}>
        <div className="border-t border-foreground/[0.07] pt-12">
          <FinanceRecordsTable rows={rows} />
        </div>
      </Reveal>
    </div>
  );
}
