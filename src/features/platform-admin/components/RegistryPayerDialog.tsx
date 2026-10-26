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
  fetchPlatformAdminPayerRegistry,
  fetchPlatformAdminPayerSchemes,
  mergePlatformAdminPayer,
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
  onMerged?: (result: { survivor: CountryPayer; retired: CountryPayer }) => void;
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
  onMerged,
}: RegistryPayerDialogProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<PayerDialogTab>("details");
  const [code, setCode] = useState("");
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
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeTargets, setMergeTargets] = useState<CountryPayer[]>([]);
  const [mergeTargetsLoading, setMergeTargetsLoading] = useState(false);
  const [mergeTargetUuid, setMergeTargetUuid] = useState("");
  const [mergeCode, setMergeCode] = useState("");
  const [mergeIntegrationCode, setMergeIntegrationCode] = useState("");
  const [isMerging, setIsMerging] = useState(false);
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
    setCode(payer.code);
    setDisplayName(payer.display_name);
    setOfficialName(payer.official_name);
    setIntegrationCode(payer.integration_code);
    setStatus(payer.status);
    setIsActive(payer.is_active);
    setAddSchemeOpen(false);
    setMergeOpen(false);
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

  useEffect(() => {
    if (!mergeOpen || !payer) {
      return;
    }
    let active = true;
    setMergeTargetsLoading(true);
    setMergeTargetUuid("");
    setMergeCode("");
    setMergeIntegrationCode("");
    void fetchPlatformAdminPayerRegistry({
      page: 1,
      pageSize: 100,
      countryCode: payer.country_code,
      status: "approved",
    })
      .then((response) => {
        if (!active) {
          return;
        }
        setMergeTargets(
          response.results.filter(
            (item) => item.uuid !== payer.uuid && item.is_active,
          ),
        );
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        setMergeTargets([]);
        toast({
          variant: "error",
          title: "Unable to load payers",
          description: error instanceof Error ? error.message : "Something went wrong.",
        });
      })
      .finally(() => {
        if (active) {
          setMergeTargetsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [mergeOpen, payer, toast]);

  async function handleSave() {
    if (!payer) {
      return;
    }
    if (!code.trim()) {
      toast({
        variant: "error",
        title: "Code is required",
        description: "Enter a registry code such as MASM.",
      });
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
        code: code.trim(),
        display_name: displayName.trim(),
        official_name: officialName.trim(),
        integration_code: integrationCode.trim(),
        status,
        is_active: isActive,
      });
      onUpdated(updated);
      setCode(updated.code);
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

  async function handleMerge() {
    if (!payer || !mergeTargetUuid) {
      toast({
        variant: "error",
        title: "Choose a payer to keep",
        description: "Select the registry payer that should remain after the merge.",
      });
      return;
    }
    setIsMerging(true);
    try {
      const result = await mergePlatformAdminPayer(payer.uuid, {
        target_uuid: mergeTargetUuid,
        code: mergeCode.trim() || undefined,
        integration_code: mergeIntegrationCode.trim(),
        review_note: `Merged ${payer.code} into survivor.`,
      });
      onMerged?.({ survivor: result.payer, retired: result.source });
      onUpdated(result.payer);
      setMergeOpen(false);
      onOpenChange(false);
      toast({
        variant: "success",
        title: "Payers merged",
        description: `${payer.code} was merged into ${result.payer.code}.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not merge payers",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsMerging(false);
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
          <div className="space-y-1.5">
            <p className="text-sm text-slate-400">Country</p>
            <p className="text-sm text-brand-navy">
              {payer ? `${countryLabel(payer.country_code)} (${payer.country_code})` : "—"}
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-400" htmlFor="registry-payer-code">
              Code
            </label>
            <Input
              id="registry-payer-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
              placeholder="MASM"
            />
            <p className="text-sm text-slate-400">
              Canonical registry code. Use MASM for Medical Aid Society of Malawi.
            </p>
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
              placeholder="MASM"
            />
            <p className="text-sm text-slate-400">
              Must match an automation adapter (MASM) for member search and claims.
            </p>
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
          <div className="border-t border-brand-border pt-4">
            <p className="text-sm font-medium text-brand-navy">Merge into another payer</p>
            <p className="mt-1 text-sm text-slate-400">
              Move clinic links and schemes onto a survivor, then retire this payer. Use this
              when duplicates like MA and MASM should become one registry entry.
            </p>
            <SecondaryButton
              type="button"
              className="mt-3"
              onClick={() => setMergeOpen(true)}
            >
              Merge into…
            </SecondaryButton>
          </div>
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
      open={mergeOpen}
      onOpenChange={setMergeOpen}
      title="Merge into another payer"
      description={
        payer
          ? `Retire ${payer.code} and keep one canonical payer (for example MASM).`
          : "Merge duplicate registry payers."
      }
      className="sm:max-w-lg"
      data-testid="registry-payer-merge-dialog"
      footer={
        <>
          <SecondaryButton type="button" onClick={() => setMergeOpen(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isMerging || !mergeTargetUuid || mergeTargetsLoading}
            onClick={() => void handleMerge()}
          >
            {isMerging ? "Merging..." : "Merge payers"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        {mergeTargetsLoading ? (
          <p className="text-sm text-slate-400">Loading payers…</p>
        ) : mergeTargets.length === 0 ? (
          <p className="text-sm text-slate-400">
            No other approved active payers exist for this country. Create or approve the
            survivor first, then merge.
          </p>
        ) : (
          <div className="space-y-1.5">
            <p className="text-sm text-slate-400">Keep this payer</p>
            <Select
              value={mergeTargetUuid}
              onValueChange={(next) => {
                setMergeTargetUuid(next);
                const selected = mergeTargets.find((item) => item.uuid === next);
                if (selected) {
                  setMergeCode(selected.code || "MASM");
                  setMergeIntegrationCode(
                    selected.integration_code || selected.code || "MASM",
                  );
                }
              }}
            >
              <SelectTrigger aria-label="Survivor payer">
                <SelectValue placeholder="Select payer" />
              </SelectTrigger>
              <SelectContent>
                {mergeTargets.map((item) => (
                  <SelectItem key={item.uuid} value={item.uuid}>
                    {item.display_name} ({item.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-sm text-slate-400" htmlFor="registry-merge-code">
            Survivor code
          </label>
          <Input
            id="registry-merge-code"
            value={mergeCode}
            onChange={(event) => setMergeCode(event.target.value)}
            autoComplete="off"
            placeholder="MASM"
          />
        </div>
        <div className="space-y-1.5">
          <label
            className="text-sm text-slate-400"
            htmlFor="registry-merge-integration-code"
          >
            Survivor integration code
          </label>
          <Input
            id="registry-merge-integration-code"
            value={mergeIntegrationCode}
            onChange={(event) => setMergeIntegrationCode(event.target.value)}
            autoComplete="off"
            placeholder="MASM"
          />
        </div>
      </div>
    </SectionedDialog>
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
