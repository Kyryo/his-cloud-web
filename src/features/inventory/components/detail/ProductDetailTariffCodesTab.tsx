"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductTariffCodeDialog } from "@/features/inventory/components/detail/ProductTariffCodeDialog";
import {
  deleteProductTariffCode,
  fetchProductTariffCodes,
} from "@/features/inventory/services/inventory.service";
import type {
  InventoryProduct,
  ProductTariffCode,
} from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type ProductDetailTariffCodesTabProps = {
  product: InventoryProduct;
  isActive: boolean;
};

export function ProductDetailTariffCodesTab({
  product,
  isActive,
}: ProductDetailTariffCodesTabProps) {
  const { toast } = useToast();
  const [codes, setCodes] = useState<ProductTariffCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<ProductTariffCode | null>(null);
  const [deletingCode, setDeletingCode] = useState<ProductTariffCode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCodes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const records = await fetchProductTariffCodes(product.uuid);
      setCodes(records);
    } catch (err) {
      setCodes([]);
      setError(
        err instanceof Error ? err.message : "Failed to load tariff codes.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [product.uuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    void loadCodes();
  }, [isActive, loadCodes]);

  async function handleDelete() {
    if (!deletingCode) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProductTariffCode(product.uuid, deletingCode.scheme_uuid);
      toast({
        variant: "success",
        title: "Tariff code removed",
        description: `${deletingCode.scheme_name} is no longer linked to this product.`,
      });
      setDeletingCode(null);
      await loadCodes();
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not remove tariff code",
        description:
          err instanceof BffError
            ? formatBffErrorMessage(err.message, err.errors)
            : err instanceof Error
              ? err.message
              : "Something went wrong.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-6 py-16 text-sm text-brand-muted"
        data-testid="product-tariff-codes-tab"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading tariff codes...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        data-testid="product-tariff-codes-tab"
      >
        <p>{error}</p>
        <SecondaryButton
          type="button"
          className="mt-4"
          onClick={() => void loadCodes()}
        >
          Try again
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="product-tariff-codes-tab">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-navy">Insurance tariff codes</h3>
          <p className="mt-0.5 text-xs text-brand-muted">
            Scheme-specific billing codes used when this product is invoiced.
          </p>
        </div>
        <PrimaryButton
          type="button"
          className="rounded-full"
          onClick={() => {
            setEditingCode(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add tariff code
        </PrimaryButton>
      </div>

      {codes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
          <h3 className="text-lg font-semibold text-brand-navy">No tariff codes yet</h3>
          <p className="mt-2 text-sm text-brand-muted">
            Add insurance scheme tariff codes to support payer billing for this product.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-brand-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Insurance scheme</th>
                  <th className="px-4 py-3 font-medium">Tariff code</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {codes.map((entry) => (
                  <tr key={entry.scheme_uuid} className="text-brand-navy">
                    <td className="px-4 py-3 font-medium">{entry.scheme_name}</td>
                    <td className="px-4 py-3 font-mono text-brand-slate">
                      {entry.tariff_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <SecondaryButton
                          type="button"
                          size="sm"
                          className="rounded-full"
                          onClick={() => {
                            setEditingCode(entry);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                          Edit
                        </SecondaryButton>
                        <SecondaryButton
                          type="button"
                          size="sm"
                          className="rounded-full text-red-600 hover:text-red-700"
                          onClick={() => setDeletingCode(entry)}
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          Remove
                        </SecondaryButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProductTariffCodeDialog
        productId={product.uuid}
        open={dialogOpen}
        existingCodes={codes}
        editingCode={editingCode}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingCode(null);
          }
        }}
        onSaved={() => void loadCodes()}
      />

      <Dialog
        open={Boolean(deletingCode)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeletingCode(null);
          }
        }}
      >
        <DialogContent className={cn("sm:max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Remove tariff code?</DialogTitle>
            <DialogDescription>
              {deletingCode
                ? `Remove the ${deletingCode.scheme_name} tariff code (${deletingCode.tariff_code}) from this product.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isDeleting}
              onClick={() => setDeletingCode(null)}
            >
              Keep code
            </SecondaryButton>
            <DestructiveButton
              type="button"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Removing...
                </>
              ) : (
                "Remove tariff code"
              )}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
