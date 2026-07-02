"use client";

import { Loader2, Plus } from "lucide-react";
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
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  createEncounterDiagnosis,
  searchDiagnosisCatalog,
} from "@/features/clinical/services/clinical-diagnosis.service";
import type { DiagnosisCatalogItem } from "@/features/clinical/types/clinical-diagnosis.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddEncounterDiagnosisDialogProps = {
  visitUuid: string;
  encounterUuid: string;
  isPrimaryDefault?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

type AddEncounterDiagnosisFormProps = {
  visitUuid: string;
  encounterUuid: string;
  isPrimaryDefault: boolean;
  onCancel: () => void;
  onSuccess?: () => void | Promise<void>;
};

function AddEncounterDiagnosisForm({
  visitUuid,
  encounterUuid,
  isPrimaryDefault,
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

  const trimmedSearchTerm = searchTerm.trim();
  const visibleSearchResults =
    trimmedSearchTerm.length >= 2 ? searchResults : [];

  useEffect(() => {
    if (trimmedSearchTerm.length < 2) {
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
  }, [trimmedSearchTerm]);

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
      await createEncounterDiagnosis(visitUuid, encounterUuid, {
        code: selectedCode.trim(),
        description: selectedDescription.trim(),
        standard: "ICD10",
        is_primary: isPrimaryDefault,
      });
      toast({
        variant: "success",
        title: "Diagnosis added",
        description: `${selectedCode} was recorded for this encounter.`,
      });
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
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-brand-navy">
            Search ICD-10 <RequiredFieldMarker />
          </label>
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
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
      </div>

      <DialogFooter>
        <SecondaryButton type="button" onClick={onCancel}>
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
  open,
  onOpenChange,
  onSuccess,
}: AddEncounterDiagnosisDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-lg", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Add diagnosis</DialogTitle>
          <DialogDescription>
            Search the ICD-10 catalog and record a diagnosis for this encounter.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <AddEncounterDiagnosisForm
            key={`${visitUuid}-${encounterUuid}-${isPrimaryDefault}`}
            visitUuid={visitUuid}
            encounterUuid={encounterUuid}
            isPrimaryDefault={isPrimaryDefault}
            onCancel={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
