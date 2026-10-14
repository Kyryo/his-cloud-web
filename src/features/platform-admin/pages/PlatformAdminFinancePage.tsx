"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ListPageLayout } from "@/features/app-shell/components/page-layout";
import { FinanceEntrySheet } from "@/features/platform-admin/components/finance/FinanceEntrySheet";
import {
  FinanceErrorState,
  FinanceSkeleton,
} from "@/features/platform-admin/components/finance/FinanceStates";
import {
  FinancePageHeader,
  PlatformAdminFinanceView,
} from "@/features/platform-admin/components/finance/PlatformAdminFinanceView";
import {
  useCreateFinanceEntryMutation,
  usePlatformAdminFinanceRecordsQuery,
  usePlatformAdminFinanceTenantsQuery,
  type FinanceEntryPayload,
} from "@/features/platform-admin/hooks/use-platform-admin-finance";
import type { FinanceRecordKind } from "@/features/platform-admin/utils/finance-series";

const SUCCESS: Record<FinanceRecordKind, string> = {
  payment: "Tenant payment recorded.",
  cost: "Operating cost recorded.",
  cash: "Cash balance recorded.",
};

export function PlatformAdminFinancePage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [kind, setKind] = useState<FinanceRecordKind>("payment");
  const records = usePlatformAdminFinanceRecordsQuery();
  const tenants = usePlatformAdminFinanceTenantsQuery(sheetOpen);
  const mutation = useCreateFinanceEntryMutation();

  const openSheet = (next: FinanceRecordKind) => {
    setKind(next);
    setSheetOpen(true);
  };

  const handleSubmit = async (entry: FinanceEntryPayload) => {
    try {
      await mutation.mutateAsync(entry);
      toast.success(SUCCESS[entry.kind]);
      setSheetOpen(false);
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save record.",
      );
      return false;
    }
  };

  return (
    <ListPageLayout>
      {records.isPending ? (
        <FinanceSkeleton />
      ) : records.isError ? (
        <div className="mx-auto w-full max-w-[1280px] space-y-10">
          <FinancePageHeader onRecord={openSheet} />
          <FinanceErrorState
            message={records.error.message}
            onRetry={() => void records.refetch()}
          />
        </div>
      ) : (
        <PlatformAdminFinanceView records={records.data} onRecord={openSheet} />
      )}
      <FinanceEntrySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        kind={kind}
        onKindChange={setKind}
        tenants={tenants.data ?? []}
        tenantsLoading={tenants.isPending}
        isSubmitting={mutation.isPending}
        onSubmit={handleSubmit}
      />
    </ListPageLayout>
  );
}
