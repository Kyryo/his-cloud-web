"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { AddCustomerLegalGuardianDialog } from "@/features/customers/components/detail/AddCustomerLegalGuardianDialog";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerLegalGuardiansTable } from "@/features/customers/components/detail/CustomerLegalGuardiansTable";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { UpdateCustomerLegalGuardianDialog } from "@/features/customers/components/detail/UpdateCustomerLegalGuardianDialog";
import { ViewCustomerLegalGuardianDialog } from "@/features/customers/components/detail/ViewCustomerLegalGuardianDialog";
import { VoidCustomerLegalGuardianDialog } from "@/features/customers/components/detail/VoidCustomerLegalGuardianDialog";
import {
  fetchCustomerLegalGuardians,
  voidCustomerLegalGuardian,
} from "@/features/customers/services/customer-legal-guardians.service";
import type { CustomerLegalGuardian } from "@/features/customers/types/customer-legal-guardian.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

const GUARDIANS_PAGE_SIZE = 10;

type CustomerDetailLegalGuardiansTabProps = {
  customer: Customer;
  isActive: boolean;
};

export function CustomerDetailLegalGuardiansTab({
  customer,
  isActive,
}: CustomerDetailLegalGuardiansTabProps) {
  const { toast } = useToast();
  const [guardians, setGuardians] = useState<CustomerLegalGuardian[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] =
    useState<CustomerLegalGuardian | null>(null);
  const [viewingGuardian, setViewingGuardian] =
    useState<CustomerLegalGuardian | null>(null);
  const [voidingGuardian, setVoidingGuardian] =
    useState<CustomerLegalGuardian | null>(null);
  const [voidingUuid, setVoidingUuid] = useState<string | null>(null);

  const loadGuardians = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const response = await fetchCustomerLegalGuardians({
          customerId: customer.id,
          page: pageToLoad,
          pageSize: GUARDIANS_PAGE_SIZE,
          isActive: true,
        });

        setGuardians((current) =>
          append ? [...current, ...response.results] : response.results,
        );
        setPage(pageToLoad);
        setHasMore(Boolean(response.pagination?.next));
        setHasLoaded(true);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load legal guardians.",
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [customer.id],
  );

  const reloadGuardians = useCallback(() => {
    void loadGuardians(1, false);
  }, [loadGuardians]);

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetchCustomerLegalGuardians({
          customerId: customer.id,
          page: 1,
          pageSize: GUARDIANS_PAGE_SIZE,
          isActive: true,
        });

        if (cancelled) {
          return;
        }

        setGuardians(response.results);
        setPage(1);
        setHasMore(Boolean(response.pagination?.next));
        setHasLoaded(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load legal guardians.",
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
  }, [customer.id, hasLoaded, isActive]);

  async function handleVoidConfirm() {
    if (!voidingGuardian) {
      return;
    }

    setVoidingUuid(voidingGuardian.uuid);

    try {
      await voidCustomerLegalGuardian(voidingGuardian.uuid);
      setGuardians((current) =>
        current.filter((item) => item.uuid !== voidingGuardian.uuid),
      );
      setVoidingGuardian(null);
      toast({
        variant: "success",
        title: "Legal guardian voided",
        description: `${voidingGuardian.full_name} is no longer an active guardian.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not void legal guardian",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setVoidingUuid(null);
    }
  }

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton rows={4} />;
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
      label="Add legal guardian"
      onClick={() => setAddDialogOpen(true)}
      data-testid="add-customer-legal-guardian-button"
    />
  );

  const emptyStateAddButton = (
    <TabAddActionButton
      label="Add legal guardian"
      emptyState
      onClick={() => setAddDialogOpen(true)}
      data-testid="add-customer-legal-guardian-button"
    />
  );

  const dialogs = (
    <>
      <AddCustomerLegalGuardianDialog
        customer={customer}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={() => reloadGuardians()}
      />
      {editingGuardian ? (
        <UpdateCustomerLegalGuardianDialog
          guardian={editingGuardian}
          open={Boolean(editingGuardian)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingGuardian(null);
            }
          }}
          onUpdated={(updatedGuardian) => {
            setGuardians((current) =>
              current.map((item) =>
                item.uuid === updatedGuardian.uuid ? updatedGuardian : item,
              ),
            );
            setEditingGuardian(null);
          }}
        />
      ) : null}
      <ViewCustomerLegalGuardianDialog
        guardian={viewingGuardian}
        open={Boolean(viewingGuardian)}
        onOpenChange={(open) => {
          if (!open) {
            setViewingGuardian(null);
          }
        }}
      />
      <VoidCustomerLegalGuardianDialog
        guardian={voidingGuardian}
        open={Boolean(voidingGuardian)}
        isVoiding={voidingUuid === voidingGuardian?.uuid}
        onOpenChange={(open) => {
          if (!open && voidingUuid !== voidingGuardian?.uuid) {
            setVoidingGuardian(null);
          }
        }}
        onConfirm={() => void handleVoidConfirm()}
      />
    </>
  );

  if (guardians.length === 0) {
    return (
      <>
        <CustomerDetailTabEmptyState
          icon={Users}
          title="No legal guardians saved"
          description="Parents, spouses, and other legal guardians for this client will appear here."
          action={emptyStateAddButton}
          data-testid="customer-legal-guardians-empty-state"
        />
        {dialogs}
      </>
    );
  }

  return (
    <>
      <div className="space-y-4" data-testid="customer-detail-legal-guardians-tab">
        <div className="flex justify-end">{addButton}</div>
        <CustomerLegalGuardiansTable
          guardians={guardians}
          voidingUuid={voidingUuid}
          onEdit={setEditingGuardian}
          onView={setViewingGuardian}
          onVoid={setVoidingGuardian}
        />
        {loadError && hasLoaded ? (
          <p className="text-sm text-red-700">{loadError}</p>
        ) : null}
        {hasMore ? (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoadingMore}
              onClick={() => void loadGuardians(page + 1, true)}
              data-testid="customer-legal-guardians-load-more"
            >
              {isLoadingMore ? "Loading..." : "Load more guardians"}
            </Button>
          </div>
        ) : null}
      </div>
      {dialogs}
    </>
  );
}
