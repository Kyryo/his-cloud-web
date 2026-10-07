"use client";

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
import { Input } from "@/components/ui/input";
import {
  createPlatformAdminPayerScheme,
  fetchPlatformAdminPayerSchemes,
} from "@/features/platform-admin/services/platform-admin.service";
import type {
  CountryPayer,
  RegistryPayerScheme,
} from "@/features/settings/types/settings.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type RegistryPayerSchemesDialogProps = {
  payer: CountryPayer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RegistryPayerSchemesDialog({
  payer,
  open,
  onOpenChange,
}: RegistryPayerSchemesDialogProps) {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<RegistryPayerScheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!open || !payer) {
      return;
    }

    let active = true;
    setName("");
    setCode("");
    setIsLoading(true);

    void fetchPlatformAdminPayerSchemes(payer.uuid)
      .then((response) => {
        if (active) {
          setSchemes(response.results);
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        setSchemes([]);
        toast({
          variant: "error",
          title: "Unable to load schemes",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, payer, toast]);

  async function handleAdd() {
    if (!payer) {
      return;
    }
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName || !trimmedCode) {
      toast({
        variant: "error",
        title: "Name and code are required",
        description: "Enter both a scheme name and a code.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const created = await createPlatformAdminPayerScheme(payer.uuid, {
        name: trimmedName,
        code: trimmedCode,
      });
      setSchemes((current) =>
        [...current, created].sort((left, right) =>
          left.name.localeCompare(right.name),
        ),
      );
      setName("");
      setCode("");
      toast({
        variant: "success",
        title: "Scheme added",
        description: `${created.name} was added to ${payer.display_name}.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add scheme",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          appFont.className,
        )}
        data-testid="registry-payer-schemes-dialog"
      >
        <DialogHeader className="shrink-0 border-b border-brand-border px-6 py-5">
          <DialogTitle>Registry schemes</DialogTitle>
          <DialogDescription>
            Schemes for {payer?.display_name ?? "this payer"}. A payer can have
            none, one, or several.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <p className="text-sm text-slate-400">Loading schemes…</p>
          ) : schemes.length === 0 ? (
            <p className="text-sm text-slate-400">No schemes yet.</p>
          ) : (
            <ul className="divide-y divide-brand-border rounded-lg border border-brand-border">
              {schemes.map((scheme) => (
                <li key={scheme.uuid} className="px-3 py-2.5">
                  <p className="text-sm font-medium text-brand-navy">
                    {scheme.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {scheme.code}
                    {scheme.is_active ? "" : " · Inactive"}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Scheme name"
              aria-label="Scheme name"
              autoComplete="off"
            />
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Code"
              aria-label="Scheme code"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter className="mt-0 shrink-0 border-t border-brand-border px-6 py-4 sm:justify-end">
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Close
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSaving || !payer}
            onClick={() => void handleAdd()}
          >
            {isSaving ? "Saving..." : "Add scheme"}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
