"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  PanelTestMembershipEditor,
  type PanelTestMembershipValue,
} from "@/features/laboratory/components/catalog/PanelTestMembershipEditor";
import {
  fetchLabTests,
  updateLabPanel,
} from "@/features/laboratory/services/laboratory-catalog.service";
import type {
  LabPanel,
  LabTestDefinition,
} from "@/features/laboratory/types/laboratory-catalog.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 250;

type ConfigureLabPanelTestsDialogProps = {
  panel: LabPanel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (panel: LabPanel) => void;
};

function membershipFromPanel(panel: LabPanel): PanelTestMembershipValue[] {
  return [...(panel.tests ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row, index) => ({
      test_uuid: row.test_uuid,
      sort_order: row.sort_order ?? index,
    }));
}

export function ConfigureLabPanelTestsDialog({
  panel,
  open,
  onOpenChange,
  onUpdated,
}: ConfigureLabPanelTestsDialogProps) {
  const { toast } = useToast();
  const [catalogTests, setCatalogTests] = useState<LabTestDefinition[]>([]);
  const [value, setValue] = useState<PanelTestMembershipValue[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValue(membershipFromPanel(panel));
    setSearchInput("");
    setDebouncedSearch("");
    setLoadError(null);
  }, [open, panel]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadOptions() {
      try {
        if (debouncedSearch) {
          setIsSearching(true);
        } else {
          setIsLoadingOptions(true);
        }
        const response = await fetchLabTests({
          pageSize: PAGE_SIZE,
          search: debouncedSearch || undefined,
        });
        if (cancelled) {
          return;
        }
        setCatalogTests(response.results);
        setLoadError(null);
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load tests.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOptions(false);
          setIsSearching(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, open]);

  const displayTests = useMemo(() => {
    const byUuid = new Map<
      string,
      Pick<LabTestDefinition, "uuid" | "code" | "name" | "category">
    >();
    for (const row of panel.tests ?? []) {
      byUuid.set(row.test_uuid, {
        uuid: row.test_uuid,
        code: row.test_code,
        name: row.test_name,
        category: "",
      });
    }
    for (const test of catalogTests) {
      byUuid.set(test.uuid, test);
    }

    const selectedFirst = value
      .map((row) => byUuid.get(row.test_uuid))
      .filter(
        (
          test,
        ): test is Pick<LabTestDefinition, "uuid" | "code" | "name" | "category"> =>
          Boolean(test),
      );
    const selectedIds = new Set(value.map((row) => row.test_uuid));
    const rest = catalogTests.filter((test) => !selectedIds.has(test.uuid));
    const merged = [...selectedFirst];
    for (const test of rest) {
      if (!merged.some((item) => item.uuid === test.uuid)) {
        merged.push(test);
      }
    }
    return merged;
  }, [catalogTests, panel.tests, value]);

  async function handleSave() {
    try {
      setIsSaving(true);
      const updated = await updateLabPanel(panel.uuid, {
        tests: value.map((row, index) => ({
          test_uuid: row.test_uuid,
          sort_order: row.sort_order ?? index,
        })),
      });
      toast({
        variant: "success",
        title: "Panel tests updated",
        description: `${updated.name} now includes ${updated.tests?.length ?? 0} test${(updated.tests?.length ?? 0) === 1 ? "" : "s"}.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update panel tests",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const busy = isSaving || isLoadingOptions;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configure tests"
      description={`Choose which laboratory tests belong to ${panel.name}.`}
      className={cn("sm:max-w-xl", appFont.className)}
      dismissible={!busy}
      data-testid="configure-lab-panel-tests-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={busy || Boolean(loadError)}
            onClick={() => {
              void handleSave();
            }}
            data-testid="configure-lab-panel-tests-save"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </PrimaryButton>
        </>
      }
    >
      {isLoadingOptions && catalogTests.length === 0 ? (
        <div className="flex items-center gap-2 py-6 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" />
          Loading tests…
        </div>
      ) : loadError ? (
        <p className="py-4 text-sm text-red-700">{loadError}</p>
      ) : (
        <PanelTestMembershipEditor
          tests={displayTests}
          value={value}
          onChange={setValue}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          isSearching={isSearching}
          disabled={busy}
        />
      )}
    </SectionedDialog>
  );
}
