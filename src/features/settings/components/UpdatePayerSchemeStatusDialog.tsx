"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateOrganizationPayerScheme } from "@/features/settings/services/settings.service";
import type {
  OrganizationPayer,
  OrganizationPayerScheme,
  RegistryPayerScheme,
} from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdatePayerSchemeStatusDialogProps = {
  scheme: OrganizationPayerScheme | null;
  payers: OrganizationPayer[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (scheme: OrganizationPayerScheme) => void;
};

function registrySchemeChoices(
  scheme: OrganizationPayerScheme | null,
  payers: OrganizationPayer[],
): { linked: boolean; schemes: RegistryPayerScheme[] } {
  const payer = payers.find((item) => item.id === scheme?.insurance_company);
  const schemes = [...(payer?.registry_payer_detail?.schemes ?? [])];
  if (
    scheme?.registry_scheme != null &&
    !schemes.some((item) => item.id === scheme.registry_scheme)
  ) {
    schemes.unshift({
      id: scheme.registry_scheme,
      uuid: `current-${scheme.registry_scheme}`,
      code: "",
      name: scheme.registry_scheme_name ?? "Linked scheme",
      description: "",
      is_active: true,
    });
  }
  return {
    linked: Boolean(payer?.registry_payer),
    schemes,
  };
}

export function UpdatePayerSchemeStatusDialog({
  scheme,
  payers,
  open,
  onOpenChange,
  onUpdated,
}: UpdatePayerSchemeStatusDialogProps) {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [registrySchemeId, setRegistrySchemeId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { linked, schemes: registrySchemes } = registrySchemeChoices(
    scheme,
    payers,
  );

  useEffect(() => {
    if (open && scheme) {
      setIsActive(scheme.is_active);
      setRegistrySchemeId(
        scheme.registry_scheme != null ? String(scheme.registry_scheme) : "",
      );
    }
  }, [open, scheme]);

  async function handleSave() {
    if (!scheme) {
      return;
    }

    const currentRegistryId =
      scheme.registry_scheme != null ? String(scheme.registry_scheme) : "";
    if (isActive === scheme.is_active && registrySchemeId === currentRegistryId) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateOrganizationPayerScheme(scheme.uuid, {
        is_active: isActive,
        registry_scheme: registrySchemeId ? Number(registrySchemeId) : null,
      });
      toast({
        variant: "success",
        title: "Scheme updated",
        description: `${updated.name} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update scheme",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong while updating this scheme.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-md", appFont.className)}
        data-testid="update-payer-scheme-status-dialog"
      >
        <DialogHeader>
          <DialogTitle>Update scheme</DialogTitle>
          <DialogDescription>
            Turn {scheme?.name ?? "this scheme"} on or off, and optionally
            attach a scheme from the payer registry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-brand-border bg-slate-50/40 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Scheme
            </p>
            <p className="mt-1 text-sm font-medium text-brand-navy">
              {scheme?.name ?? "—"}
            </p>
            {scheme?.insurance_company_name ? (
              <p className="mt-0.5 text-xs text-brand-muted">
                {scheme.insurance_company_name}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-brand-border px-4 py-3">
            <div className="min-w-0">
              <Label htmlFor="payer-scheme-active" className="text-sm text-brand-navy">
                Scheme is {isActive ? "on" : "off"}
              </Label>
              <p className="mt-1 text-xs text-brand-muted">
                {isActive
                  ? "Active schemes can be selected for visits and memberships."
                  : "Inactive schemes are hidden from new visit and membership flows."}
              </p>
            </div>
            <Switch
              id="payer-scheme-active"
              checked={isActive}
              disabled={isSaving || !scheme}
              onCheckedChange={setIsActive}
              data-testid="payer-scheme-active-switch"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payer-scheme-registry">Registry scheme</Label>
            <Select
              value={registrySchemeId || "__none__"}
              onValueChange={(next) => {
                setRegistrySchemeId(next === "__none__" ? "" : next);
              }}
              disabled={isSaving || !linked || registrySchemes.length === 0}
            >
              <SelectTrigger id="payer-scheme-registry">
                <SelectValue
                  placeholder={
                    linked
                      ? "Optional — link to a registry scheme"
                      : "Link the payer to the registry first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Not linked</SelectItem>
                {registrySchemes.map((item) => (
                  <SelectItem key={item.uuid} value={String(item.id)}>
                    {item.code ? `${item.name} (${item.code})` : item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-brand-muted">
              {linked
                ? registrySchemes.length > 0
                  ? "Attaches this plan to a scheme on the payer's registry entry. The scheme name and code stay as they are."
                  : "This registry payer has no schemes yet."
                : "Link this payer to a registry payer before attaching a registry scheme."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <SecondaryButton
            type="button"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSaving || !scheme}
            onClick={() => void handleSave()}
            data-testid="payer-scheme-status-save"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
