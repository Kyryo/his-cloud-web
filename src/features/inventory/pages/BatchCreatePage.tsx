"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { ProductSearchCombobox } from "@/features/inventory/components/ProductSearchCombobox";
import { checkSession } from "@/features/auth/services/auth.service";
import { useToast } from "@/providers/toast-provider";

export function BatchCreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [productUuid, setProductUuid] = useState<string | null>(null);
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const session = await checkSession();
        const tenant =
          session.user?.tenant?.id ?? session.user?.primary_clinic?.tenant ?? null;
        setTenantId(tenant);
      } catch {
        setTenantId(null);
      }
    })();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!tenantId) {
      toast({ description: "Tenant context is required.", variant: "error" });
      return;
    }

    if (!productUuid) {
      toast({ description: "Product is required.", variant: "error" });
      return;
    }

    if (!batchNumber.trim()) {
      toast({ description: "Batch number is required.", variant: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      toast({
        description:
          "Batch creation still requires a legacy product ID. Catalog UUID support for batches is pending.",
        variant: "error",
      });
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "Could not create batch.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ListPageLayout data-testid="inventory-batch-create-page">
      <ListPageHeaderSection>
        <ListPageHeaderTitleBlock
          title="New batch"
          description="Create a batch record for lot and expiry tracking."
        />
      </ListPageHeaderSection>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="max-w-xl space-y-4 rounded-xl border border-brand-border bg-white p-6"
      >
        <ProductSearchCombobox
          value={productUuid}
          onSelect={(product) => setProductUuid(product.uuid)}
        />
        <div className="space-y-2">
          <Label htmlFor="new-batch-number">Batch number</Label>
          <Input
            id="new-batch-number"
            value={batchNumber}
            onChange={(event) => setBatchNumber(event.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="new-batch-expiry">Expiry date</Label>
            <Input
              id="new-batch-expiry"
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-batch-manufacture">Manufacture date</Label>
            <Input
              id="new-batch-manufacture"
              type="date"
              value={manufactureDate}
              onChange={(event) => setManufactureDate(event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-batch-supplier">Supplier</Label>
          <Input
            id="new-batch-supplier"
            value={supplier}
            onChange={(event) => setSupplier(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-batch-notes">Notes</Label>
          <textarea
            id="new-batch-notes"
            value={notes}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNotes(event.target.value)
            }
            rows={3}
            className="flex min-h-[5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create batch"
            )}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={() => router.push(ROUTES.inventoryBatches)}>
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </ListPageLayout>
  );
}
