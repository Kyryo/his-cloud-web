"use client";

import { Loader2, Pencil, Search, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ClientAvatar } from "@/components/client-avatar";
import { SecondaryButton } from "@/components/ui/app-buttons";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchCareProviderRecords } from "@/features/care-providers/services/care-providers.service";
import type { CareProviderRecord } from "@/features/care-providers/types/care-provider.types";
import { updateSalesOrder } from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { toSalesOrderProviderRecord } from "@/features/sales-orders/utils/sales-order-provider";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const PROVIDER_RESULT_LIMIT = 5;
const SEARCH_DEBOUNCE_MS = 250;

const popoverSurfaceClassName = cn("w-72 p-3", appFont.className);

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
  selectedProviderId: number | null;
  onSelect: (provider: CareProviderRecord) => void;
};

function ProviderSearchPanel({
  title,
  description,
  selectedProviderId,
  onSelect,
}: ProviderSearchPanelProps) {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<CareProviderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        try {
          const response = await fetchCareProviderRecords({
            search: search.trim() || undefined,
            isActive: true,
          });
          setOptions(response.results.slice(0, PROVIDER_RESULT_LIMIT));
        } catch {
          setOptions([]);
        } finally {
          setIsLoading(false);
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [search]);

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
            {options.map((provider) => {
              const isSelected = provider.id === selectedProviderId;

              return (
                <li key={provider.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col gap-0 rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-accent",
                      isSelected && "bg-accent",
                    )}
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
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing up to {PROVIDER_RESULT_LIMIT} results. Refine your search to
        narrow the list.
      </p>
    </div>
  );
}

type ProviderHoverCardProps = {
  provider: CareProviderRecord;
  canEdit: boolean;
  isSaving: boolean;
  onChange: () => void;
  onRemove: () => void;
};

function ProviderHoverCard({
  provider,
  canEdit,
  isSaving,
  onChange,
  onRemove,
}: ProviderHoverCardProps) {
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            "rounded-full outline-none transition-all duration-300 ease-out",
            "animate-in fade-in zoom-in-95",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            canEdit && "hover:scale-105",
          )}
          aria-label={`Assigned provider: ${provider.display_name}`}
        >
          <ClientAvatar
            name={provider.display_name}
            className="size-9 text-xs shadow-sm ring-1 ring-border"
          />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="end"
        sideOffset={8}
        className={cn("w-64 p-3", appFont.className)}
      >
        <div className="flex items-start gap-2.5">
          <ClientAvatar
            name={provider.display_name}
            className="size-9 shrink-0 text-xs"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {provider.display_name}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {formatProviderSubtitle(provider)}
            </p>
          </div>
        </div>

        {canEdit ? (
          <div className="mt-3 flex gap-2">
            <SecondaryButton
              type="button"
              size="sm"
              className="h-8 flex-1"
              disabled={isSaving}
              onClick={onChange}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Change
            </SecondaryButton>
            <SecondaryButton
              type="button"
              size="sm"
              className="h-8 flex-1 text-destructive hover:text-destructive"
              disabled={isSaving}
              onClick={onRemove}
            >
              <X className="size-3.5" aria-hidden="true" />
              Remove
            </SecondaryButton>
          </div>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}

export function SalesOrderProviderSelector({
  order,
  canEdit,
  onOrderUpdated,
  className,
}: SalesOrderProviderSelectorProps) {
  const { toast } = useToast();
  const [assignOpen, setAssignOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const selectedProvider = useMemo(
    () => toSalesOrderProviderRecord(order),
    [order],
  );

  async function persistProvider(provider: CareProviderRecord | null) {
    if (!onOrderUpdated) {
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateSalesOrder(order.id, {
        provider_id: provider?.id ?? null,
      });
      onOrderUpdated(updated);
      setAssignOpen(false);
      toast({
        variant: "success",
        title: provider ? "Provider updated" : "Provider removed",
        description: provider
          ? `${provider.display_name} is linked to this order.`
          : "This order no longer has an assigned provider.",
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

  if (!canEdit) {
    if (!selectedProvider) {
      return null;
    }

    return (
      <ProviderHoverCard
        provider={selectedProvider}
        canEdit={false}
        isSaving={false}
        onChange={() => undefined}
        onRemove={() => undefined}
      />
    );
  }

  if (!selectedProvider) {
    return (
      <Popover open={assignOpen} onOpenChange={setAssignOpen}>
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
            selectedProviderId={null}
            onSelect={(provider) => void persistProvider(provider)}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={assignOpen} onOpenChange={setAssignOpen}>
      <PopoverAnchor asChild>
        <div className={cn("inline-flex", className)}>
          <ProviderHoverCard
            provider={selectedProvider}
            canEdit
            isSaving={isSaving}
            onChange={() => setAssignOpen(true)}
            onRemove={() => void persistProvider(null)}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent align="end" className={popoverSurfaceClassName}>
        <ProviderSearchPanel
          title="Change provider"
          description="Pick a different care provider for this order."
          selectedProviderId={selectedProvider.id}
          onSelect={(provider) => void persistProvider(provider)}
        />
      </PopoverContent>
    </Popover>
  );
}
