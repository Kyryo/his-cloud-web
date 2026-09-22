"use client";

import { Info, Loader2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { Switch } from "@/components/ui/switch";
import {
  createEncounterDiagnosis,
  searchDiagnosisCatalog,
} from "@/features/clinical/services/clinical-diagnosis.service";
import type {
  DiagnosisCatalogItem,
  EncounterDiagnosisSourcePlatform,
} from "@/features/clinical/types/clinical-diagnosis.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

export type AddClaimDiagnosisPayload = {
  code: string;
  description: string;
  standard: "ICD10";
};

type AddEncounterDiagnosisDialogProps = {
  visitUuid: string;
  encounterUuid: string | null;
  isPrimaryDefault?: boolean;
  sourcePlatform?: EncounterDiagnosisSourcePlatform;
  /** When set, shows encounter-save alert + switch and claim-only save path. */
  alsoSaveAsEncounter?: {
    defaultChecked?: boolean;
    onSaveClaimOnly: (payload: AddClaimDiagnosisPayload) => Promise<void>;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

type AddEncounterDiagnosisFormProps = {
  visitUuid: string;
  encounterUuid: string | null;
  isPrimaryDefault: boolean;
  sourcePlatform: EncounterDiagnosisSourcePlatform;
  alsoSaveAsEncounter?: AddEncounterDiagnosisDialogProps["alsoSaveAsEncounter"];
  onCancel: () => void;
  onSuccess?: () => void | Promise<void>;
  layout?: "dialog" | "inline";
};

function AddEncounterDiagnosisForm({
  visitUuid,
  encounterUuid,
  isPrimaryDefault,
  sourcePlatform,
  alsoSaveAsEncounter,
  onCancel,
  onSuccess,
  layout = "dialog",
}: AddEncounterDiagnosisFormProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DiagnosisCatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedDescription, setSelectedDescription] = useState("");
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [alsoSaveToEncounter, setAlsoSaveToEncounter] = useState(
    Boolean(encounterUuid) && (alsoSaveAsEncounter?.defaultChecked ?? true),
  );

  const trimmedSearchTerm = searchTerm.trim();
  const isInline = layout === "inline";
  const isBusy = Boolean(busyCode);
  const hasDialogSelection = !isInline && selectedCode.length > 0;
  const visibleSearchResults =
    !hasDialogSelection && trimmedSearchTerm.length >= 2 ? searchResults : [];
  const claimMode = Boolean(alsoSaveAsEncounter);
  const canSaveToEncounter = Boolean(visitUuid && encounterUuid);

  useEffect(() => {
    if (trimmedSearchTerm.length < 2 || hasDialogSelection) {
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      void (async () => {
        if (!cancelled) {
          setIsSearching(true);
        }

        try {
          const response = await searchDiagnosisCatalog(trimmedSearchTerm);
          if (!cancelled) {
            setSearchResults(response.results ?? []);
          }
        } catch {
          if (!cancelled) {
            setSearchResults([]);
          }
        } finally {
          if (!cancelled) {
            setIsSearching(false);
          }
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [hasDialogSelection, trimmedSearchTerm]);

  function handleSearchTermChange(value: string) {
    setSearchTerm(value);
    if (selectedCode) {
      setSelectedCode("");
      setSelectedDescription("");
      setSearchResults([]);
    }
  }

  async function persistDiagnosis(payload: AddClaimDiagnosisPayload) {
    if (claimMode && !alsoSaveToEncounter) {
      await alsoSaveAsEncounter!.onSaveClaimOnly(payload);
      toast({
        variant: "success",
        title: "Diagnosis added",
        description: `${payload.code} was added to this claim.`,
      });
      return;
    }

    if (!encounterUuid) {
      throw new Error(
        "An encounter is required to save this as an encounter diagnosis.",
      );
    }

    await createEncounterDiagnosis(visitUuid, encounterUuid, {
      code: payload.code,
      description: payload.description,
      standard: "ICD10",
      is_primary: isPrimaryDefault,
      // Always send an explicit value — JSON.stringify drops `undefined`, and the
      // API defaults missing source_platform to CLINICAL (which enforces visit status).
      source_platform: sourcePlatform === "INVOICE" ? "INVOICE" : "CLINICAL",
    });
    toast({
      variant: "success",
      title: "Diagnosis added",
      description: claimMode
        ? `${payload.code} was recorded on the encounter and synced to this claim.`
        : `${payload.code} was recorded for this encounter.`,
    });
  }

  async function addDiagnosis(payload: AddClaimDiagnosisPayload) {
    if (isBusy) {
      return;
    }

    setBusyCode(payload.code);
    try {
      await persistDiagnosis(payload);
      await onSuccess?.();
      onCancel();
    } catch (error) {
      const message =
        error instanceof BffError
          ? formatBffErrorMessage(error.message, error.errors)
          : error instanceof Error
            ? error.message
            : "Something went wrong.";
      toast({
        variant: "error",
        title: "Could not add diagnosis",
        description: message,
      });
    } finally {
      setBusyCode(null);
    }
  }

  function selectCatalogItem(item: DiagnosisCatalogItem) {
    if (isInline) {
      void addDiagnosis({
        code: item.code.trim(),
        description: item.description.trim(),
        standard: "ICD10",
      });
      return;
    }

    setSelectedCode(item.code);
    setSelectedDescription(item.description);
    setSearchTerm(`${item.code} — ${item.description}`);
    setSearchResults([]);
  }

  return (
    <>
      <div
        className={
          isInline
            ? "space-y-3"
            : "flex-1 space-y-4 overflow-y-auto px-6 py-6"
        }
      >
        <div className="space-y-3">
          {!isInline ? (
            <label className="text-sm font-medium text-brand-navy">
              Search ICD-10 <RequiredFieldMarker />
            </label>
          ) : null}

          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-dash-muted"
              aria-hidden="true"
            />
            <Input
              value={searchTerm}
              onChange={(event) => handleSearchTermChange(event.target.value)}
              placeholder="Search ICD-10…"
              className={cn(
                "pl-8",
                isInline &&
                  "h-9 border-dash-border/70 bg-dash-canvas/60 text-sm shadow-none focus-visible:bg-white",
                !isInline && "mt-1.5",
              )}
              autoComplete="off"
              disabled={isBusy}
              aria-label="Search ICD-10"
              data-testid="diagnosis-catalog-search"
            />
          </div>

          {isSearching ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-dash-muted">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Searching…
            </div>
          ) : trimmedSearchTerm.length >= 2 &&
            visibleSearchResults.length === 0 &&
            !hasDialogSelection ? (
            <p className="px-1 py-6 text-center text-sm text-dash-muted">
              No matching diagnoses.
            </p>
          ) : visibleSearchResults.length > 0 ? (
            <ul
              className="max-h-64 space-y-0.5 overflow-y-auto"
              data-testid="diagnosis-catalog-results"
            >
              {visibleSearchResults.map((item) => {
                const isRowBusy = busyCode === item.code;
                return (
                  <li key={item.code}>
                    <button
                      type="button"
                      disabled={isBusy}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors",
                        "hover:bg-dash-canvas/80 disabled:cursor-wait",
                        isBusy && !isRowBusy && "opacity-60",
                      )}
                      onClick={() => selectCatalogItem(item)}
                      data-testid={`diagnosis-catalog-result-${item.code}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brand-navy">
                          {item.description}
                        </p>
                        <p className="truncate font-mono text-[11px] text-dash-muted">
                          {item.code}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-brand-primary transition-opacity",
                          isRowBusy
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {isRowBusy ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : isInline ? (
                          "Add"
                        ) : (
                          "Select"
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : isInline ? (
            <p className="px-1 py-4 text-center text-sm text-dash-muted">
              Type at least 2 characters to search.
            </p>
          ) : null}
        </div>

        {claimMode ? (
          <Alert variant="warning">
            <Info className="size-4" aria-hidden="true" />
            <AlertTitle>Encounter diagnosis</AlertTitle>
            <AlertDescription>
              <div className="flex items-start justify-between gap-3">
                <p>
                  {alsoSaveToEncounter
                    ? "This diagnosis will also be saved as an encounter diagnosis on the visit."
                    : "This diagnosis will be saved on the claim only. It will not be added to the clinical encounter."}
                </p>
                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                  <label
                    htmlFor="also-save-encounter-diagnosis"
                    className={cn(
                      "text-xs font-medium",
                      canSaveToEncounter ? "text-amber-950" : "text-amber-800/60",
                    )}
                  >
                    Also save
                  </label>
                  <Switch
                    id="also-save-encounter-diagnosis"
                    checked={alsoSaveToEncounter && canSaveToEncounter}
                    disabled={!canSaveToEncounter || isBusy}
                    onCheckedChange={setAlsoSaveToEncounter}
                    data-testid="claim-diagnosis-also-save-encounter"
                  />
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      {isInline ? null : (
        <div className="mt-0 border-t border-brand-border px-6 py-5">
          <DialogFooter className="w-full sm:justify-end">
            <SecondaryButton type="button" onClick={onCancel} disabled={isBusy}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isBusy || !selectedCode.trim()}
              onClick={() =>
                void addDiagnosis({
                  code: selectedCode.trim(),
                  description: selectedDescription.trim(),
                  standard: "ICD10",
                })
              }
            >
              {isBusy ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="size-4" aria-hidden="true" />
                  Add diagnosis
                </>
              )}
            </PrimaryButton>
          </DialogFooter>
        </div>
      )}
    </>
  );
}

export function AddEncounterDiagnosisInlineForm({
  visitUuid,
  encounterUuid,
  isPrimaryDefault = false,
  sourcePlatform = "CLINICAL",
  onSuccess,
}: Pick<
  AddEncounterDiagnosisDialogProps,
  "visitUuid" | "encounterUuid" | "isPrimaryDefault" | "sourcePlatform" | "onSuccess"
>) {
  const [formKey, setFormKey] = useState(0);

  return (
    <AddEncounterDiagnosisForm
      key={`${formKey}-${visitUuid}-${encounterUuid ?? "none"}`}
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
      isPrimaryDefault={isPrimaryDefault}
      sourcePlatform={sourcePlatform}
      layout="inline"
      onCancel={() => setFormKey((current) => current + 1)}
      onSuccess={onSuccess}
    />
  );
}

export function AddEncounterDiagnosisDialog({
  visitUuid,
  encounterUuid,
  isPrimaryDefault = false,
  sourcePlatform = "CLINICAL",
  alsoSaveAsEncounter,
  open,
  onOpenChange,
  onSuccess,
}: AddEncounterDiagnosisDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          appFont.className,
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="border-b border-brand-border px-6 py-5">
            <DialogTitle>Add diagnosis</DialogTitle>
            <DialogDescription>
              {alsoSaveAsEncounter
                ? "Search the ICD-10 catalog and add a diagnosis to this claim."
                : "Search the ICD-10 catalog and record a diagnosis for this encounter."}
            </DialogDescription>
          </DialogHeader>

          {open ? (
            <AddEncounterDiagnosisForm
              key={`${visitUuid}-${encounterUuid ?? "none"}-${isPrimaryDefault}-${sourcePlatform}-${alsoSaveAsEncounter ? "claim" : "encounter"}`}
              visitUuid={visitUuid}
              encounterUuid={encounterUuid}
              isPrimaryDefault={isPrimaryDefault}
              sourcePlatform={sourcePlatform}
              alsoSaveAsEncounter={alsoSaveAsEncounter}
              onCancel={() => onOpenChange(false)}
              onSuccess={onSuccess}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
