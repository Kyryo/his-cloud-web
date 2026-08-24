"use client";

import { ListPlus, MoreVertical, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddProductToAllPricelistsDialog } from "@/features/inventory/components/detail/AddProductToAllPricelistsDialog";
import { AddProductToPricelistDialog } from "@/features/inventory/components/detail/AddProductToPricelistDialog";
import { addProductToAllPricelists } from "@/features/inventory/services/inventory.service";
import type {
  AddProductToAllPricelistsPriceSource,
  InventoryProduct,
  InventoryProductPricelistItem,
} from "@/features/inventory/types/inventory.types";
import { fetchOrganizationPricelists } from "@/features/settings/services/settings.service";
import type { OrganizationPricelist } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type ProductPricelistActionsProps = {
  product: InventoryProduct;
  existingItems: InventoryProductPricelistItem[];
  onAdded: () => void;
  className?: string;
};

export function ProductPricelistActions({
  product,
  existingItems,
  onAdded,
  className,
}: ProductPricelistActionsProps) {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [addAllOpen, setAddAllOpen] = useState(false);
  const [isAddingToAll, setIsAddingToAll] = useState(false);
  const [addAllError, setAddAllError] = useState<string | null>(null);
  const [orgPricelists, setOrgPricelists] = useState<OrganizationPricelist[]>([]);
  const [isLoadingPricelists, setIsLoadingPricelists] = useState(true);
  const [pricelistsLoadFailed, setPricelistsLoadFailed] = useState(false);

  const usedPricelistUuids = useMemo(
    () =>
      new Set(
        existingItems
          .map((item) => item.pricelist_uuid)
          .filter((uuid): uuid is string => Boolean(uuid)),
      ),
    [existingItems],
  );

  const remainingCount = useMemo(() => {
    const active = orgPricelists.filter((entry) => entry.is_active);
    return active.filter((entry) => !usedPricelistUuids.has(entry.uuid)).length;
  }, [orgPricelists, usedPricelistUuids]);

  const hasNoActivePricelists =
    !pricelistsLoadFailed &&
    !isLoadingPricelists &&
    orgPricelists.filter((entry) => entry.is_active).length === 0;
  const canAddToAll =
    pricelistsLoadFailed || (!isLoadingPricelists && remainingCount > 0);
  const addToAllDisabledReason = isLoadingPricelists
    ? "Loading pricelists"
    : hasNoActivePricelists
      ? "No active pricelists"
      : remainingCount === 0
        ? "Already on every active pricelist"
        : undefined;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoadingPricelists(true);
      try {
        const response = await fetchOrganizationPricelists();
        if (!cancelled) {
          setOrgPricelists(response.results ?? []);
          setPricelistsLoadFailed(false);
        }
      } catch {
        if (!cancelled) {
          setOrgPricelists([]);
          setPricelistsLoadFailed(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPricelists(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAddToAll(priceSource: AddProductToAllPricelistsPriceSource) {
    setIsAddingToAll(true);
    setAddAllError(null);
    try {
      const result = await addProductToAllPricelists(product.uuid, {
        price_source: priceSource,
      });

      toast({
        variant: "success",
        title: result.approval_required
          ? "Price change submitted for approval"
          : "Product added to pricelists",
        description: result.approval_required
          ? "A second approver must confirm this pricelist change before it takes effect."
          : "The product is now available on every remaining active pricelist.",
      });

      onAdded();
      setAddAllOpen(false);
    } catch (error) {
      setAddAllError(
        error instanceof BffError
          ? formatBffErrorMessage(error.message, error.errors)
          : error instanceof Error
            ? error.message
            : "Something went wrong.",
      );
    } finally {
      setIsAddingToAll(false);
    }
  }

  return (
    <div
      className={cn("flex shrink-0 flex-wrap items-center gap-2", className)}
      data-testid="product-pricelist-actions"
      data-remaining-count={
        pricelistsLoadFailed || isLoadingPricelists ? "" : String(remainingCount)
      }
      data-add-to-all-disabled={canAddToAll ? "false" : "true"}
      data-add-to-all-disabled-reason={addToAllDisabledReason ?? ""}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            disabled={isAddingToAll}
            aria-label="Pricelist actions"
            data-testid="product-pricelist-actions-menu-button"
          >
            <MoreVertical className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={!canAddToAll || isAddingToAll}
            title={addToAllDisabledReason}
            onClick={() => {
              setAddAllError(null);
              setAddAllOpen(true);
            }}
            data-testid="product-pricelist-add-to-all-menu-item"
          >
            <ListPlus className="size-4" aria-hidden="true" />
            Add to all pricelists
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PrimaryButton
        type="button"
        className="rounded-full"
        data-testid="product-pricelist-add-button"
        onClick={() => setAddOpen(true)}
      >
        <Plus className="size-4" aria-hidden="true" />
        Add to pricelist
      </PrimaryButton>

      <AddProductToPricelistDialog
        product={product}
        existingItems={existingItems}
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={onAdded}
      />

      <AddProductToAllPricelistsDialog
        open={addAllOpen}
        listPrice={product.list_price}
        remainingCount={pricelistsLoadFailed ? null : remainingCount}
        isSaving={isAddingToAll}
        error={addAllError}
        onOpenChange={(open) => {
          if (!open && isAddingToAll) {
            return;
          }
          if (!open) {
            setAddAllError(null);
          }
          setAddAllOpen(open);
        }}
        onConfirm={handleAddToAll}
      />
    </div>
  );
}
