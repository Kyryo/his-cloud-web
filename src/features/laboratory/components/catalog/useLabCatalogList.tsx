"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  ListPageBlankState,
  ListPageLayout,
  ListPagePagination,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { LabCatalogAccessDenied } from "@/features/laboratory/components/catalog/LabCatalogAccessDenied";
import { LabCatalogEmptyState } from "@/features/laboratory/components/catalog/LabCatalogEmptyState";
import { LabCatalogTableSkeleton } from "@/features/laboratory/components/catalog/LabCatalogTableSkeleton";
import { ConfirmLabActionDialog } from "@/features/laboratory/components/detail/ConfirmLabActionDialog";
import type { LabCatalogListResponse } from "@/features/laboratory/types/laboratory-catalog.types";
import { isLabCatalogAccessDeniedMessage } from "@/features/laboratory/utils/catalog-form-utils";
import { useToast } from "@/providers/toast-provider";

const DEFAULT_PAGE_SIZE = 20;

type UseLabCatalogListOptions<T extends { uuid: string }> = {
  fetchList: (args: {
    page: number;
    pageSize: number;
  }) => Promise<LabCatalogListResponse<T>>;
  deactivate: (uuid: string) => Promise<void>;
  entityLabel: string;
  pageSize?: number;
};

export function useLabCatalogList<T extends { uuid: string }>({
  fetchList,
  deactivate,
  entityLabel,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseLabCatalogListOptions<T>) {
  const { toast } = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [deactivatingUuid, setDeactivatingUuid] = useState<string | null>(null);
  const [pendingDeactivate, setPendingDeactivate] = useState<T | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(null);
      setIsUnauthorized(false);
      try {
        const response = await fetchList({ page, pageSize });
        if (cancelled) return;
        setItems(response.results);
        const pagination = response.pagination;
        setTotalCount(pagination?.count ?? response.results.length);
        setHasNext(Boolean(pagination?.next));
        setHasPrevious(Boolean(pagination?.previous));
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : `Failed to load ${entityLabel}.`;
        if (isLabCatalogAccessDeniedMessage(message)) {
          setIsUnauthorized(true);
        } else {
          setError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entityLabel, fetchList, page, pageSize, reloadToken]);

  function handleCreated(item: T) {
    setItems((current) => [item, ...current]);
    setTotalCount((count) => count + 1);
    reload();
  }

  function handleUpdated(item: T) {
    setItems((current) =>
      current.map((row) => (row.uuid === item.uuid ? item : row)),
    );
  }

  function requestDeactivate(item: T) {
    setPendingDeactivate(item);
  }

  async function confirmDeactivate() {
    if (!pendingDeactivate) return;
    const item = pendingDeactivate;
    setDeactivatingUuid(item.uuid);
    try {
      await deactivate(item.uuid);
      setItems((current) => current.filter((row) => row.uuid !== item.uuid));
      setTotalCount((count) => Math.max(0, count - 1));
      setPendingDeactivate(null);
      toast({
        variant: "success",
        title: `${entityLabel} deactivated`,
        description: "The catalog entry was deactivated.",
      });
    } catch (err) {
      toast({
        variant: "error",
        title: `Could not deactivate ${entityLabel.toLowerCase()}`,
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setDeactivatingUuid(null);
    }
  }

  return {
    items,
    page,
    pageSize,
    totalCount,
    hasNext,
    hasPrevious,
    setPage,
    isLoading,
    error,
    isUnauthorized,
    deactivatingUuid,
    pendingDeactivate,
    setPendingDeactivate,
    addOpen,
    setAddOpen,
    editing,
    setEditing,
    reload,
    handleCreated,
    handleUpdated,
    requestDeactivate,
    confirmDeactivate,
  };
}

type LabCatalogListShellProps = {
  dataTestId: string;
  isUnauthorized: boolean;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  onRetry: () => void;
  onAdd: () => void;
  addLabel: string;
  header: ReactNode;
  children: ReactNode;
  page: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  pendingDeactivateLabel?: string | null;
  deactivateOpen: boolean;
  onDeactivateOpenChange: (open: boolean) => void;
  onConfirmDeactivate: () => void;
  isDeactivating: boolean;
};

export function LabCatalogListShell({
  dataTestId,
  isUnauthorized,
  isLoading,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  onRetry,
  onAdd,
  addLabel,
  header,
  children,
  page,
  pageSize,
  totalCount,
  hasPrevious,
  hasNext,
  onPageChange,
  pendingDeactivateLabel,
  deactivateOpen,
  onDeactivateOpenChange,
  onConfirmDeactivate,
  isDeactivating,
}: LabCatalogListShellProps) {
  if (isUnauthorized) {
    return <LabCatalogAccessDenied data-testid={`${dataTestId}-access-denied`} />;
  }

  return (
    <ListPageLayout data-testid={dataTestId}>
      {header}
      <ListPageTableSection>
        {isLoading ? (
          <LabCatalogTableSkeleton />
        ) : error ? (
          <ListPageBlankState
            compact
            tone="error"
            icon="file"
            title="Could not load catalog"
            description={error}
            action={
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-lg text-[13px]"
                onClick={onRetry}
              >
                Try again
              </Button>
            }
          />
        ) : isEmpty ? (
          <LabCatalogEmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={
              <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                {addLabel}
              </Button>
            }
          />
        ) : (
          <>
            {children}
            <ListPagePagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPageChange={onPageChange}
              isLoading={isLoading}
            />
          </>
        )}
      </ListPageTableSection>

      <ConfirmLabActionDialog
        open={deactivateOpen}
        onOpenChange={onDeactivateOpenChange}
        title="Deactivate catalog entry"
        description={
          pendingDeactivateLabel
            ? `Deactivate “${pendingDeactivateLabel}”? It will be removed from active catalog lists.`
            : "Deactivate this catalog entry? It will be removed from active lists."
        }
        confirmLabel="Deactivate"
        tone="danger"
        isSubmitting={isDeactivating}
        onConfirm={() => {
          void onConfirmDeactivate();
        }}
      >
        <p className="text-sm text-brand-slate">
          Soft-deleted entries are hidden from day-to-day catalog pickers.
        </p>
      </ConfirmLabActionDialog>
    </ListPageLayout>
  );
}
