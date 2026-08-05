"use client";

import { Info, Loader2, Plus } from "lucide-react";
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
};

function AddEncounterDiagnosisForm({
  visitUuid,
  encounterUuid,
  isPrimaryDefault,
  sourcePlatform,
  alsoSaveAsEncounter,
  onCancel,
  onSuccess,
}: AddEncounterDiagnosisFormProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DiagnosisCatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedDescription, setSelectedDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [alsoSaveToEncounter, setAlsoSaveToEncounter] = useState(
    Boolean(encounterUuid) && (alsoSaveAsEncounter?.defaultChecked ?? true),
  );

  const trimmedSearchTerm = searchTerm.trim();
  const selectedDisplayLabel = selectedCode
    ? `${selectedCode} — ${selectedDescription}`.trim()
    : "";
  const hasConfirmedSelection =
    selectedCode.length > 0 && trimmedSearchTerm === selectedDisplayLabel;
  const visibleSearchResults =
    !hasConfirmedSelection && trimmedSearchTerm.length >= 2 ? searchResults : [];
  const claimMode = Boolean(alsoSaveAsEncounter);
  const canSaveToEncounter = Boolean(visitUuid && encounterUuid);

  useEffect(() => {
    if (trimmedSearchTerm.length < 2) {
      return;
    }

    if (hasConfirmedSelection) {
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
  }, [hasConfirmedSelection, trimmedSearchTerm]);

  function handleSearchTermChange(value: string) {
    setSearchTerm(value);
    if (
      selectedCode &&
      value.trim() !== `${selectedCode} — ${selectedDescription}`.trim()
    ) {
      setSelectedCode("");
      setSelectedDescription("");
      setSearchResults([]);
    }
  }

  function selectCatalogItem(item: DiagnosisCatalogItem) {
    setSelectedCode(item.code);
    setSelectedDescription(item.description);
    setSearchTerm(`${item.code} — ${item.description}`);
    setSearchResults([]);
  }

  async function handleSave() {
    if (!selectedCode.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const payload: AddClaimDiagnosisPayload = {
        code: selectedCode.trim(),
        description: selectedDescription.trim(),
        standard: "ICD10",
      };

      if (claimMode && !alsoSaveToEncounter) {
        await alsoSaveAsEncounter!.onSaveClaimOnly(payload);
        toast({
          variant: "success",
          title: "Diagnosis added",
          description: `${selectedCode} was added to this claim.`,
        });
      } else {
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
            ? `${selectedCode} was recorded on the encounter and synced to this claim.`
            : `${selectedCode} was recorded for this encounter.`,
        });
      }
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
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        <div>
          <label className="text-sm font-medium text-brand-navy">
            Search ICD-10 <RequiredFieldMarker />
          </label>
          <Input
            value={searchTerm}
            onChange={(event) => handleSearchTermChange(event.target.value)}
            placeholder="Search by code or description"
            className="mt-1.5"
            autoComplete="off"
          />
          {isSearching ? (
            <p className="mt-1 text-xs text-brand-muted">Searching...</p>
          ) : null}
          {visibleSearchResults.length > 0 ? (
            <ul className="mt-2 max-h-40 overflow-y-auto rounded-md border border-brand-border bg-white">
              {visibleSearchResults.map((item) => (
                <li key={item.code}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50"
                    onClick={() => selectCatalogItem(item)}
                  >
                    <span className="font-mono font-medium">{item.code}</span>
                    <span className="ml-2 text-brand-muted">{item.description}</span>
                  </button>
                </li>
              ))}
            </ul>
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
                    disabled={!canSaveToEncounter}
                    onCheckedChange={setAlsoSaveToEncounter}
                    data-testid="claim-diagnosis-also-save-encounter"
                  />
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <DialogFooter className="mt-0 border-t border-brand-border px-6 py-5">
        <SecondaryButton type="button" onClick={onCancel} disabled={isSaving}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="button"
          disabled={isSaving || !selectedCode.trim()}
          onClick={() => void handleSave()}
        >
          {isSaving ? (
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
    </>
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
