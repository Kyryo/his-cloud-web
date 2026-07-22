"use client";

import { Loader2, Search, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ClientAvatar } from "@/components/client-avatar";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchCareProviderRecords } from "@/features/care-providers/services/care-providers.service";
import type { CareProviderRecord } from "@/features/care-providers/types/care-provider.types";
import {
  updateSalesOrder,
  updateSalesOrderLine,
} from "@/features/sales-orders/services/sales-orders.service";
import type {
  SalesOrder,
  SalesOrderProviderAssociation,
} from "@/features/sales-orders/types/sales-order.types";
import { getSalesOrderProviders } from "@/features/sales-orders/utils/sales-order-provider";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const PROVIDER_RESULT_LIMIT = 5;
const SEARCH_DEBOUNCE_MS = 250;
const AVATAR_STACK_LIMIT = 3;

const popoverSurfaceClassName = cn("w-80 p-3", appFont.className);

type SalesOrderProviderSelectorProps = {
  order: SalesOrder;
  canEdit: boolean;
  onOrderUpdated?: (order: SalesOrder) => void;
  className?: string;
};

function formatProviderSubtitle(provider: CareProviderRecord): string {
  if (provider.provider_has_user && provider.user_email) {
    return provider.user_email;
  }
  if (provider.provider_has_user) {
    return "Linked user account";
  }
  return "Standalone provider";
}

type ProviderSearchPanelProps = {
  title: string;
  description: string;
  excludedProviderIds: number[];
  onSelect: (provider: CareProviderRecord) => void;
};

function ProviderSearchPanel({
  title,
  description,
  excludedProviderIds,
  onSelect,
}: ProviderSearchPanelProps) {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<CareProviderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const excluded = useMemo(
    () => new Set(excludedProviderIds),
    [excludedProviderIds],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        try {
          const response = await fetchCareProviderRecords({
            search: search.trim() || undefined,
            isActive: true,
          });
          setOptions(
            response.results
              .filter((provider) => !excluded.has(provider.id))
              .slice(0, PROVIDER_RESULT_LIMIT),
          );
        } catch {
          setOptions([]);
        } finally {
          setIsLoading(false);
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [excluded, search]);

  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search providers..."
          className="h-8 pl-8 text-sm"
          autoFocus
        />
      </div>

      <div className="max-h-[11.5rem] overflow-y-auto rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            Loading...
          </div>
        ) : options.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {search.trim()
              ? "No providers match your search."
              : "No active providers found."}
          </p>
        ) : (
          <ul className="p-0.5">
            {options.map((provider) => (
              <li key={provider.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-0 rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-accent"
                  onClick={() => onSelect(provider)}
                >
                  <span className="truncate text-sm font-medium leading-tight text-foreground">
                    {provider.display_name}
                  </span>
                  <span className="truncate text-xs leading-tight text-muted-foreground">
                    {formatProviderSubtitle(provider)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type LineAssignmentDialogProps = {
  open: boolean;
  order: SalesOrder;
  providers: SalesOrderProviderAssociation[];
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: (order: SalesOrder) => void;
};

function LineAssignmentDialog({
  open,
  order,
  providers,
  onOpenChange,
  onOrderUpdated,
}: LineAssignmentDialogProps) {
  const { toast } = useToast();
  const lines = order.lines ?? [];
  const [assignments, setAssignments] = useState<Record<number, number | "">>(
    {},
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const next: Record<number, number | ""> = {};
    for (const line of lines) {
      next[line.id] = line.provider_id ?? "";
    }
    setAssignments(next);
  }, [lines, open]);

  async function handleSave() {
    if (!onOrderUpdated) {
      onOpenChange(false);
      return;
    }
    setIsSaving(true);
    try {
      let updated = order;
      for (const line of lines) {
        const nextProviderId = assignments[line.id];
        const normalized =
          nextProviderId === "" || nextProviderId === undefined
            ? null
            : Number(nextProviderId);
        const current = line.provider_id ?? null;
        if (normalized === current) {
          continue;
        }
        updated = await updateSalesOrderLine(order.id, line.id, {
          provider_id: normalized,
        });
      }
      onOrderUpdated(updated);
      onOpenChange(false);
      toast({
        variant: "success",
        title: "Line providers updated",
        description: "Line item provider assignments were saved.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update line providers",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign providers to line items</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Optionally map each line to a provider on this order. Unassigned
            lines are allowed.
          </p>
        </DialogHeader>

        <div className="max-h-[24rem] overflow-auto rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Line item</th>
                <th className="px-3 py-2 font-medium">Provider</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    This order has no line items yet.
                  </td>
                </tr>
              ) : (
                lines.map((line) => (
                  <tr key={line.id} className="border-t">
                    <td className="px-3 py-2">
                      <p className="font-medium text-foreground">
                        {line.product_name || line.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty {String(line.quantity)}
                      </p>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        value={assignments[line.id] ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setAssignments((current) => ({
                            ...current,
                            [line.id]: value === "" ? "" : Number(value),
                          }));
                        }}
                      >
                        <option value="">Unassigned</option>
                        {providers.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                            {provider.is_primary ? " (primary)" : ""}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Skip
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !onOrderUpdated}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Save assignments
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AvatarStack({
  providers,
  overflowCount,
}: {
  providers: SalesOrderProviderAssociation[];
  overflowCount: number;
}) {
  return (
    <div className="flex items-center">
      {providers.map((provider, index) => (
        <ClientAvatar
          key={provider.id}
          name={provider.name}
          className={cn(
            "size-9 text-xs shadow-sm ring-2 ring-background",
            index > 0 && "-ml-2",
          )}
        />
      ))}
      {overflowCount > 0 ? (
        <span
          className={cn(
            "relative z-10 -ml-2 inline-flex size-9 items-center justify-center rounded-full",
            "bg-muted text-xs font-medium text-foreground ring-2 ring-background",
          )}
        >
          +{overflowCount}
        </span>
      ) : null}
    </div>
  );
}

function ProvidersPanelContent({
  providers,
  canEdit,
  isSaving,
  onAdd,
  onRemove,
  onAssignLines,
}: {
  providers: SalesOrderProviderAssociation[];
  canEdit: boolean;
  isSaving: boolean;
  onAdd: () => void;
  onRemove: (providerId: number) => void;
  onAssignLines: () => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">Providers</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {providers.length} associated with this order
        </p>
      </div>

      <ul className="max-h-56 space-y-1 overflow-y-auto">
        {providers.map((provider) => (
          <li
            key={provider.id}
            className="flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-accent"
          >
            <ClientAvatar
              name={provider.name}
              className="size-8 shrink-0 text-xs"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {provider.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {provider.is_primary ? "Primary" : "Additional"}
              </p>
            </div>
            {canEdit ? (
              <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:bg-background hover:text-destructive"
                disabled={isSaving}
                aria-label={`Remove ${provider.name}`}
                onClick={() => onRemove(provider.id)}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {canEdit ? (
        <div className="flex flex-col gap-2">
          <SecondaryButton
            type="button"
            size="sm"
            className="h-8 w-full"
            disabled={isSaving}
            onClick={onAdd}
          >
            <UserPlus className="size-3.5" aria-hidden="true" />
            Add provider
          </SecondaryButton>
          {providers.length >= 2 ? (
            <SecondaryButton
              type="button"
              size="sm"
              className="h-8 w-full"
              disabled={isSaving}
              onClick={onAssignLines}
            >
              Assign line items
            </SecondaryButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function SalesOrderProviderSelector({
  order,
  canEdit,
  onOrderUpdated,
  className,
}: SalesOrderProviderSelectorProps) {
  const { toast } = useToast();
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"list" | "add">("list");
  const [assignOpen, setAssignOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const providers = useMemo(() => getSalesOrderProviders(order), [order]);
  const visibleProviders = providers.slice(0, AVATAR_STACK_LIMIT);
  const overflowCount = Math.max(providers.length - AVATAR_STACK_LIMIT, 0);

  async function persistProviders(
    nextProviderIds: number[],
    options?: {
      openAssignment?: boolean;
      toastTitle?: string;
      toastDescription?: string;
    },
  ) {
    if (!onOrderUpdated) {
      return;
    }

    setIsSaving(true);
    try {
      const primaryId = order.provider_id;
      const payload =
        primaryId == null && nextProviderIds.length > 0
          ? {
              provider_id: nextProviderIds[0],
              provider_ids: nextProviderIds,
            }
          : { provider_ids: nextProviderIds };

      const updated = await updateSalesOrder(order.id, payload);
      onOrderUpdated(updated);
      setPanelMode("list");
      setPanelOpen(true);
      if (
        options?.openAssignment &&
        getSalesOrderProviders(updated).length >= 2
      ) {
        setAssignOpen(true);
      }
      toast({
        variant: "success",
        title: options?.toastTitle ?? "Providers updated",
        description:
          options?.toastDescription ??
          "Associated providers were saved for this order.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update providers",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function setPrimaryProvider(provider: CareProviderRecord | null) {
    if (!onOrderUpdated) {
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateSalesOrder(order.id, {
        provider_id: provider?.id ?? null,
      });
      onOrderUpdated(updated);
      setPanelOpen(false);
      toast({
        variant: "success",
        title: provider
          ? "Primary provider updated"
          : "Primary provider removed",
        description: provider
          ? `${provider.display_name} is the primary provider.`
          : "This order no longer has a primary provider.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update provider",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function addProvider(provider: CareProviderRecord) {
    const nextIds = [
      ...new Set([...providers.map((item) => item.id), provider.id]),
    ];
    await persistProviders(nextIds, {
      openAssignment: nextIds.length >= 2,
      toastTitle: "Provider added",
      toastDescription: `${provider.display_name} was added to this order.`,
    });
  }

  async function removeProvider(providerId: number) {
    if (order.provider_id === providerId) {
      await setPrimaryProvider(null);
      return;
    }
    const nextIds = providers
      .map((item) => item.id)
      .filter((id) => id !== providerId);
    await persistProviders(nextIds, {
      toastTitle: "Provider removed",
      toastDescription: "The provider was removed from this order.",
    });
  }

  if (!canEdit && providers.length === 0) {
    return null;
  }

  if (!canEdit) {
    return (
      <div className={cn("inline-flex items-center", className)}>
        <Popover open={panelOpen} onOpenChange={setPanelOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Providers (${providers.length})`}
            >
              <AvatarStack
                providers={visibleProviders}
                overflowCount={overflowCount}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className={popoverSurfaceClassName}>
            <ProvidersPanelContent
              providers={providers}
              canEdit={false}
              isSaving={false}
              onAdd={() => undefined}
              onRemove={() => undefined}
              onAssignLines={() => undefined}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <Popover open={panelOpen} onOpenChange={setPanelOpen}>
        <PopoverTrigger asChild>
          <SecondaryButton
            type="button"
            size="sm"
            disabled={isSaving || !onOrderUpdated}
            className={cn(
              "transition-all duration-300 ease-out animate-in fade-in zoom-in-95",
              className,
            )}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus className="size-4" aria-hidden="true" />
            )}
            Assign provider
          </SecondaryButton>
        </PopoverTrigger>
        <PopoverContent align="end" className={popoverSurfaceClassName}>
          <ProviderSearchPanel
            title="Assign provider"
            description="Select who provided care for this order."
            excludedProviderIds={[]}
            onSelect={(provider) => void setPrimaryProvider(provider)}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Popover
        open={panelOpen}
        onOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) {
            setPanelMode("list");
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Providers (${providers.length})`}
          >
            <AvatarStack
              providers={visibleProviders}
              overflowCount={overflowCount}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className={popoverSurfaceClassName}>
          {panelMode === "add" ? (
            <ProviderSearchPanel
              title="Add provider"
              description="Add another care provider to this order."
              excludedProviderIds={providers.map((provider) => provider.id)}
              onSelect={(provider) => void addProvider(provider)}
            />
          ) : (
            <ProvidersPanelContent
              providers={providers}
              canEdit
              isSaving={isSaving}
              onAdd={() => setPanelMode("add")}
              onRemove={(providerId) => void removeProvider(providerId)}
              onAssignLines={() => {
                setPanelOpen(false);
                setAssignOpen(true);
              }}
            />
          )}
        </PopoverContent>
      </Popover>

      <LineAssignmentDialog
        open={assignOpen}
        order={order}
        providers={providers}
        onOpenChange={setAssignOpen}
        onOrderUpdated={onOrderUpdated}
      />
    </div>
  );
}
