"use client";

import { useEffect, useRef, useState } from "react";
import { Layers } from "lucide-react";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
  TabAddActionButton,
} from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  REGISTRY_CAPABILITIES,
  REGISTRY_PAYER_STATUSES,
} from "@/features/platform-admin/constants/registry-capabilities";
import {
  createPlatformAdminPayerScheme,
  deletePlatformAdminPayerScheme,
  fetchPlatformAdminPayerSchemes,
  updatePlatformAdminPayer,
} from "@/features/platform-admin/services/platform-admin.service";
import type {
  CountryPayer,
  RegistryPayerScheme,
} from "@/features/settings/types/settings.types";
import { useToast } from "@/providers/toast-provider";

type RegistryPayerDialogProps = {
  payer: CountryPayer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (payer: CountryPayer) => void;
};

type PayerDialogTab = "details" | "schemes" | "capabilities";

function countryLabel(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function RegistryPayerDialog({
  payer,
  open,
  onOpenChange,
  onUpdated,
}: RegistryPayerDialogProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<PayerDialogTab>("details");
  const [displayName, setDisplayName] = useState("");
  const [officialName, setOfficialName] = useState("");
  const [integrationCode, setIntegrationCode] = useState("");
  const [status, setStatus] = useState("approved");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [schemes, setSchemes] = useState<RegistryPayerScheme[]>([]);
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [addSchemeOpen, setAddSchemeOpen] = useState(false);
  const [schemeName, setSchemeName] = useState("");
  const [schemeCode, setSchemeCode] = useState("");
  const [schemeDescription, setSchemeDescription] = useState("");
  const [isAddingScheme, setIsAddingScheme] = useState(false);
  const [pendingRemoveUuid, setPendingRemoveUuid] = useState<string | null>(null);
  const [removingUuid, setRemovingUuid] = useState<string | null>(null);
  const [savingCapability, setSavingCapability] = useState<string | null>(null);
  const openedPayerId = useRef<string | null>(null);
  const payerId = payer?.uuid ?? null;

  useEffect(() => {
    if (!open || !payer) {
      openedPayerId.current = null;
      return;
    }
    if (openedPayerId.current === payer.uuid) {
      return;
    }
    openedPayerId.current = payer.uuid;
    setTab("details");
    setDisplayName(payer.display_name);
    setOfficialName(payer.official_name);
    setIntegrationCode(payer.integration_code);
    setStatus(payer.status);
    setIsActive(payer.is_active);
    setAddSchemeOpen(false);
    setPendingRemoveUuid(null);
  }, [open, payer]);

  useEffect(() => {
    if (!open || !payerId) {
      return;
    }
    let active = true;
    setSchemesLoading(true);
    void fetchPlatformAdminPayerSchemes(payerId)
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
          description: error instanceof Error ? error.message : "Something went wrong.",
        });
      })
      .finally(() => {
        if (active) {
          setSchemesLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [open, payerId, toast]);

  async function handleSave() {
    if (!payer) {
      return;
    }
    if (!displayName.trim() || !officialName.trim()) {
      toast({
        variant: "error",
        title: "Name is required",
        description: "Enter both a display name and an official name.",
      });
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updatePlatformAdminPayer(payer.uuid, {
        display_name: displayName.trim(),
        official_name: officialName.trim(),
        integration_code: integrationCode.trim(),
        status,
        is_active: isActive,
      });
      onUpdated(updated);
      toast({
        variant: "success",
        title: "Payer updated",
        description: `${updated.display_name} was saved.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update payer",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddScheme() {
    if (!payer) {
      return;
    }
    if (!schemeName.trim() || !schemeCode.trim()) {
      toast({
        variant: "error",
        title: "Scheme details are incomplete",
        description: "Enter a name and a code.",
      });
      return;
    }
    setIsAddingScheme(true);
    try {
      const created = await createPlatformAdminPayerScheme(payer.uuid, {
        name: schemeName.trim(),
        code: schemeCode.trim(),
        description: schemeDescription.trim(),
      });
      setSchemes((current) =>
        [...current, created].sort((left, right) => left.name.localeCompare(right.name)),
      );
      setSchemeName("");
      setSchemeCode("");
      setSchemeDescription("");
      setAddSchemeOpen(false);
      onUpdated(payer);
      toast({
        variant: "success",
        title: "Scheme added",
        description: `${created.name} was added to ${payer.display_name}.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add scheme",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsAddingScheme(false);
    }
  }

  async function handleRemoveScheme(scheme: RegistryPayerScheme) {
    if (!payer) {
      return;
    }
    setRemovingUuid(scheme.uuid);
    try {
      await deletePlatformAdminPayerScheme(payer.uuid, scheme.uuid);
      setSchemes((current) => current.filter((item) => item.uuid !== scheme.uuid));
      setPendingRemoveUuid(null);
      onUpdated(payer);
      toast({
        variant: "success",
        title: "Scheme removed",
        description: `${scheme.name} was removed from ${payer.display_name}.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not remove scheme",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setRemovingUuid(null);
    }
  }

  async function handleToggleCapability(capabilityId: string, enabled: boolean) {
    if (!payer || savingCapability) {
      return;
    }
    const current = payer.capabilities ?? [];
    const next = enabled
      ? [...current, capabilityId]
      : current.filter((item) => item !== capabilityId);
    setSavingCapability(capabilityId);
    try {
      const updated = await updatePlatformAdminPayer(payer.uuid, {
        capabilities: next,
      });
      onUpdated(updated);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update capabilities",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setSavingCapability(null);
    }
  }

  const enabledCapabilities = new Set(payer?.capabilities ?? []);

  useEffect(() => {
    if (!addSchemeOpen) {
      return;
    }
    setSchemeName("");
    setSchemeCode("");
    setSchemeDescription("");
  }, [addSchemeOpen]);

  return (
    <>
    <TabbedDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && addSchemeOpen) {
          return;
        }
        onOpenChange(next);
      }}
      title={payer?.display_name ?? "Payer"}
      description={
        payer
          ? `${countryLabel(payer.country_code)} · ${payer.code}`
          : "Registry payer"
      }
      tabs={[
        { id: "details", label: "Details" },
        { id: "schemes", label: "Schemes" },
        { id: "capabilities", label: "Capabilities" },
      ]}
      activeTab={tab}
      onTabChange={(next) => setTab(next as PayerDialogTab)}
      data-testid="registry-payer-dialog"
      footer={
        tab === "details" ? (
          <>
            <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isSaving || !payer}
              onClick={() => void handleSave()}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </PrimaryButton>
          </>
        ) : (
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Close
          </SecondaryButton>
        )
      }
    >
      {tab === "details" ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-sm text-slate-400">Country</p>
              <p className="text-sm text-brand-navy">
                {payer ? `${countryLabel(payer.country_code)} (${payer.country_code})` : "—"}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-slate-400">Code</p>
              <p className="text-sm text-brand-navy">{payer?.code ?? "—"}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-400" htmlFor="registry-payer-display-name">
              Display name
            </label>
            <Input
              id="registry-payer-display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-400" htmlFor="registry-payer-official-name">
              Official name
            </label>
            <Input
              id="registry-payer-official-name"
              value={officialName}
              onChange={(event) => setOfficialName(event.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-400" htmlFor="registry-payer-integration-code">
              Integration code
            </label>
            <Input
              id="registry-payer-integration-code"
              value={integrationCode}
              onChange={(event) => setIntegrationCode(event.target.value)}
              autoComplete="off"
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-slate-400">Status</p>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger aria-label="Payer status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGISTRY_PAYER_STATUSES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center justify-between gap-4 border-t border-brand-border pt-4">
            <span>
              <span className="block text-sm font-medium text-brand-navy">Active</span>
              <span className="mt-0.5 block text-sm text-slate-400">
                Inactive payers stay in the registry, and clinics cannot link to them.
              </span>
            </span>
            <Switch checked={isActive} onCheckedChange={setIsActive} aria-label="Payer is active" />
          </label>
        </div>
      ) : null}

      {tab === "schemes" ? (
        schemesLoading ? (
          <p className="text-sm text-slate-400">Loading schemes…</p>
        ) : schemes.length === 0 ? (
          <DetailTabEmptyState
            icon={Layers}
            title="No schemes yet"
            description="Add a plan when this payer offers a named scheme."
            data-testid="registry-payer-schemes-empty"
            action={
              <TabAddActionButton
                type="button"
                emptyState
                onClick={() => setAddSchemeOpen(true)}
              >
                Add scheme
              </TabAddActionButton>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <TabAddActionButton type="button" onClick={() => setAddSchemeOpen(true)}>
                Add scheme
              </TabAddActionButton>
            </div>
            <ul className="divide-y divide-brand-border">
              {schemes.map((scheme) => (
                <li
                  key={scheme.uuid}
                  className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">{scheme.name}</p>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {scheme.code}
                      {scheme.is_active ? "" : " · Inactive"}
                    </p>
                  </div>
                  {pendingRemoveUuid === scheme.uuid ? (
                    <div className="flex items-center gap-2">
                      <SecondaryButton
                        type="button"
                        size="sm"
                        onClick={() => setPendingRemoveUuid(null)}
                      >
                        Cancel
                      </SecondaryButton>
                      <DestructiveButton
                        type="button"
                        size="sm"
                        disabled={removingUuid === scheme.uuid}
                        onClick={() => void handleRemoveScheme(scheme)}
                      >
                        {removingUuid === scheme.uuid ? "Removing..." : "Remove"}
                      </DestructiveButton>
                    </div>
                  ) : (
                    <SecondaryButton
                      type="button"
                      size="sm"
                      onClick={() => setPendingRemoveUuid(scheme.uuid)}
                    >
                      Remove
                    </SecondaryButton>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      ) : null}

      {tab === "capabilities" ? (
        <div className="space-y-1">
          {enabledCapabilities.size === 0 ? (
            <p className="pb-3 text-sm text-slate-400">
              No capabilities are turned on. Clinics cannot use member lookup, benefits, or
              automatic claims until you enable one.
            </p>
          ) : null}
          <div className="divide-y divide-brand-border">
            {REGISTRY_CAPABILITIES.map((capability) => (
              <label
                key={capability.id}
                className="flex items-center justify-between gap-4 py-3.5"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-brand-navy">
                    {capability.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-400">
                    {capability.description}
                  </span>
                </span>
                <Switch
                  checked={enabledCapabilities.has(capability.id)}
                  disabled={savingCapability !== null}
                  onCheckedChange={(checked) =>
                    void handleToggleCapability(capability.id, checked)
                  }
                  aria-label={capability.label}
                />
              </label>
            ))}
          </div>
          <p className="border-t border-brand-border pt-4 text-sm text-slate-400">
            {payer?.has_claims_rules
              ? "Claim rules are available for this payer."
              : "No claim rules are attached to this payer."}
          </p>
        </div>
      ) : null}
    </TabbedDialog>
    <SectionedDialog
      open={addSchemeOpen}
      onOpenChange={setAddSchemeOpen}
      title="Add scheme"
      description={
        payer
          ? `Add a scheme for ${payer.display_name}.`
          : "Add a scheme for this payer."
      }
      className="sm:max-w-lg"
      data-testid="payer-dialog-add-scheme"
      footer={
        <>
          <SecondaryButton type="button" onClick={() => setAddSchemeOpen(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isAddingScheme || !payer}
            onClick={() => void handleAddScheme()}
          >
            {isAddingScheme ? "Adding..." : "Add scheme"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-slate-400" htmlFor="payer-dialog-scheme-name">
            Name
          </label>
          <Input
            id="payer-dialog-scheme-name"
            value={schemeName}
            onChange={(event) => setSchemeName(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-slate-400" htmlFor="payer-dialog-scheme-code">
            Code
          </label>
          <Input
            id="payer-dialog-scheme-code"
            value={schemeCode}
            onChange={(event) => setSchemeCode(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-slate-400" htmlFor="payer-dialog-scheme-description">
            Description
          </label>
          <Textarea
            id="payer-dialog-scheme-description"
            value={schemeDescription}
            onChange={(event) => setSchemeDescription(event.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>
    </SectionedDialog>
    </>
  );
}
