"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Shield } from "lucide-react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { ListPagePagination } from "@/features/app-shell/components/page-layout";
import { AddCustomerInsuranceDialog } from "@/features/customers/components/detail/AddCustomerInsuranceDialog";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerInsuranceTable } from "@/features/customers/components/detail/CustomerInsuranceTable";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { UpdateCustomerInsuranceDialog } from "@/features/customers/components/detail/UpdateCustomerInsuranceDialog";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { paginateItems } from "@/features/customers/utils/paginate-items";

const INSURANCE_PAGE_SIZE = 20;

type CustomerDetailInsuranceTabProps = {
  customer: Customer;
  isActive: boolean;
};

export function CustomerDetailInsuranceTab({
  customer,
  isActive,
}: CustomerDetailInsuranceTabProps) {
  const [insurance, setInsurance] = useState<CustomerInsurance[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] =
    useState<CustomerInsurance | null>(null);

  const loadInsurance = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const records = await fetchCustomerInsurance(customer.uuid);
      setInsurance(records);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load insurance.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [customer.uuid]);

  const reloadInsurance = useCallback(() => {
    setPage(1);
    void loadInsurance();
  }, [loadInsurance]);

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const records = await fetchCustomerInsurance(customer.uuid);

        if (cancelled) {
          return;
        }

        setInsurance(records);
        setHasLoaded(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Failed to load insurance.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [customer.uuid, hasLoaded, isActive]);

  const paged = useMemo(
    () => paginateItems(insurance, page, INSURANCE_PAGE_SIZE),
    [insurance, page],
  );

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton rows={5} />;
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  const addButton = (
    <TabAddActionButton
      label="Add insurance"
      onClick={() => setAddDialogOpen(true)}
      data-testid="add-customer-insurance-button"
    />
  );

  const emptyStateAddButton = (
    <TabAddActionButton
      label="Add insurance"
      emptyState
      onClick={() => setAddDialogOpen(true)}
      data-testid="add-customer-insurance-button"
    />
  );

  const dialogs = (
    <>
      <AddCustomerInsuranceDialog
        customer={customer}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={() => reloadInsurance()}
      />
      {editingInsurance ? (
        <UpdateCustomerInsuranceDialog
          customer={customer}
          insurance={editingInsurance}
          open={Boolean(editingInsurance)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingInsurance(null);
            }
          }}
          onUpdated={() => reloadInsurance()}
        />
      ) : null}
    </>
  );

  if (insurance.length === 0) {
    return (
      <>
        <CustomerDetailTabEmptyState
          icon={Shield}
          title="No insurance on file"
          description="Insurance memberships linked to this client will appear here."
          action={emptyStateAddButton}
          data-testid="customer-insurance-empty-state"
        />
        {dialogs}
      </>
    );
  }

  return (
    <>
      <div className="space-y-4" data-testid="customer-detail-insurance-tab">
        <div className="flex justify-end">{addButton}</div>
        <CustomerInsuranceTable
          insurance={paged.items}
          onUpdate={setEditingInsurance}
        />
        <ListPagePagination
          page={paged.page}
          pageSize={INSURANCE_PAGE_SIZE}
          totalCount={paged.totalCount}
          hasNext={paged.hasNext}
          hasPrevious={paged.hasPrevious}
          onPageChange={setPage}
        />
      </div>
      {dialogs}
    </>
  );
}
