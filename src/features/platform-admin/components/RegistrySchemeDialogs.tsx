"use client";

import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createPlatformAdminPayerScheme,
  fetchPlatformAdminPayerRegistry,
  updatePlatformAdminPayerScheme,
} from "@/features/platform-admin/services/platform-admin.service";
import type {
  CountryPayer,
  RegistryPayerSchemeCatalogItem,
} from "@/features/settings/types/settings.types";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddRegistrySchemeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function AddRegistrySchemeDialog({
  open,
  onOpenChange,
  onCreated,
}: AddRegistrySchemeDialogProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [payers, setPayers] = useState<CountryPayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [payerUuid, setPayerUuid] = useState("");
  const [selectedPayer, setSelectedPayer] = useState<CountryPayer | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setQuery("");
    setPayerUuid("");
    setSelectedPayer(null);
    setName("");
    setCode("");
    setDescription("");
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    let active = true;
    const handle = window.setTimeout(() => {
      setIsLoading(true);
      void fetchPlatformAdminPayerRegistry({
        status: "approved",
        search: query.trim() || undefined,
        pageSize: query.trim() ? 20 : 8,
        ordering: "display_name",
      })
        .then((response) => {
          if (active) {
            setPayers(response.results);
          }
        })
        .catch((error: unknown) => {
          if (!active) {
            return;
          }
          setPayers([]);
          toast({
            variant: "error",
            title: "Unable to load payers",
            description: error instanceof Error ? error.message : "Something went wrong.",
          });
        })
        .finally(() => {
          if (active) {
            setIsLoading(false);
          }
        });
    }, query.trim() ? 200 : 0);

    return () => {
      active = false;
      window.clearTimeout(handle);
    };
  }, [open, query, toast]);

  async function handleCreate() {
    if (!selectedPayer || !name.trim() || !code.trim()) {
      toast({
        variant: "error",
        title: "Scheme details are incomplete",
        description: "Choose a payer, then enter a name and code.",
      });
      return;
    }
    setIsSaving(true);
    try {
      await createPlatformAdminPayerScheme(selectedPayer.uuid, {
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
      });
      toast({
        variant: "success",
        title: "Scheme added",
        description: `${name.trim()} was added to ${selectedPayer.display_name}.`,
      });
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add scheme",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add scheme"
      description="A scheme belongs to one approved payer. Search if the payer is not listed."
      className="sm:max-w-lg"
      data-testid="add-registry-scheme-dialog"
      headerExtra={
        <div className="pb-4 pt-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search payers"
            aria-label="Search payers"
            autoComplete="off"
          />
        </div>
      }
      footer={
        <>
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSaving || !selectedPayer}
            onClick={() => void handleCreate()}
          >
            {isSaving ? "Adding..." : "Add scheme"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-5">
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading payers…</p>
        ) : payers.length === 0 ? (
          <p className="text-sm text-slate-400">
            {query.trim()
              ? "No approved payers match that search."
              : "No approved payers yet. Approve a payer before adding a scheme."}
          </p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {payers.map((payer) => {
              const isSelected = payer.uuid === payerUuid;
              return (
                <li key={payer.uuid}>
                  <button
                    type="button"
                    onClick={() => {
                      setPayerUuid(payer.uuid);
                      setSelectedPayer(payer);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md px-2 py-3 text-left",
                      isSelected && "bg-slate-50",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-brand-navy">
                        {payer.display_name}
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-400">
                        {payer.country_code} · {payer.code}
                      </span>
                    </span>
                    <span className={cn("shrink-0 text-xs text-slate-400", isSelected && "text-brand-navy")}>
                      {isSelected ? "Selected" : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="space-y-3 border-t border-brand-border pt-5">
          <p className="text-sm text-slate-400">
            {selectedPayer
              ? `Adding a scheme for ${selectedPayer.display_name}.`
              : "Select a payer, then enter the scheme."}
          </p>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-400" htmlFor="registry-scheme-name">
              Name
            </label>
            <Input
              id="registry-scheme-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-400" htmlFor="registry-scheme-code">
              Code
            </label>
            <Input
              id="registry-scheme-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-400" htmlFor="registry-scheme-description">
              Description
            </label>
            <Textarea
              id="registry-scheme-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
      </div>
    </SectionedDialog>
  );
}

type EditRegistrySchemeDialogProps = {
  scheme: RegistryPayerSchemeCatalogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function EditRegistrySchemeDialog({
  scheme,
  open,
  onOpenChange,
  onSaved,
}: EditRegistrySchemeDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !scheme) {
      return;
    }
    setName(scheme.name);
    setCode(scheme.code);
    setDescription(scheme.description ?? "");
    setIsActive(scheme.is_active);
  }, [open, scheme]);

  async function handleSave() {
    if (!scheme) {
      return;
    }
    if (!name.trim() || !code.trim()) {
      toast({
        variant: "error",
        title: "Name and code are required",
        description: "Enter both a scheme name and a code.",
      });
      return;
    }
    setIsSaving(true);
    try {
      await updatePlatformAdminPayerScheme(scheme.payer_uuid, scheme.uuid, {
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        is_active: isActive,
      });
      toast({
        variant: "success",
        title: "Scheme updated",
        description: `${name.trim()} was saved.`,
      });
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update scheme",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit scheme"
      description={
        scheme ? `${scheme.payer_name} · ${scheme.country_code}` : "Registry scheme"
      }
      className="sm:max-w-lg"
      data-testid="edit-registry-scheme-dialog"
      footer={
        <>
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" disabled={isSaving || !scheme} onClick={() => void handleSave()}>
            {isSaving ? "Saving..." : "Save changes"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-slate-400" htmlFor="edit-registry-scheme-name">
            Name
          </label>
          <Input
            id="edit-registry-scheme-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-slate-400" htmlFor="edit-registry-scheme-code">
            Code
          </label>
          <Input
            id="edit-registry-scheme-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-slate-400" htmlFor="edit-registry-scheme-description">
            Description
          </label>
          <Textarea
            id="edit-registry-scheme-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <label className="flex items-center justify-between gap-4 border-t border-brand-border pt-4">
          <span>
            <span className="block text-sm font-medium text-brand-navy">Active</span>
            <span className="mt-0.5 block text-sm text-slate-400">
              Inactive schemes stay on the payer, and clinics cannot attach them.
            </span>
          </span>
          <Switch checked={isActive} onCheckedChange={setIsActive} aria-label="Scheme is active" />
        </label>
      </div>
    </SectionedDialog>
  );
}

type SchemeActivityDialogProps = {
  scheme: RegistryPayerSchemeCatalogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function RegistrySchemeActivityDialog({
  scheme,
  open,
  onOpenChange,
  onSaved,
}: SchemeActivityDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const activating = scheme ? !scheme.is_active : false;

  async function handleConfirm() {
    if (!scheme) {
      return;
    }
    setIsSaving(true);
    try {
      await updatePlatformAdminPayerScheme(scheme.payer_uuid, scheme.uuid, {
        is_active: !scheme.is_active,
      });
      toast({
        variant: "success",
        title: activating ? "Scheme activated" : "Scheme deactivated",
        description: scheme.name,
      });
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: activating ? "Could not activate scheme" : "Could not deactivate scheme",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={activating ? "Activate scheme" : "Deactivate scheme"}
      description={
        scheme
          ? activating
            ? `Clinics can attach ${scheme.name} again.`
            : `Clinics will no longer be able to attach ${scheme.name}. Existing links stay in place.`
          : undefined
      }
      className="sm:max-w-md"
      data-testid="registry-scheme-activity-dialog"
      footer={
        <>
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" disabled={isSaving || !scheme} onClick={() => void handleConfirm()}>
            {isSaving ? "Saving..." : activating ? "Activate" : "Deactivate"}
          </PrimaryButton>
        </>
      }
    >
      <p className="text-sm text-slate-400">
        {scheme
          ? `${scheme.payer_name} · ${scheme.code}`
          : "Choose a scheme to continue."}
      </p>
    </SectionedDialog>
  );
}
