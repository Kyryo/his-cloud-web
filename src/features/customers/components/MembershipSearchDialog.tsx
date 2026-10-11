"use client";

import { useEffect, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useMasmIntegrationEnabled } from "@/features/claims/hooks/use-masm-integration-enabled";
import { MemberVisitAutomationDialog } from "@/features/customers/components/MemberVisitAutomationDialog";
import {
  notifyMemberVisitAutomationRefresh,
  startMemberVisitAutomation,
} from "@/features/customers/services/member-visit-automation.service";
import { searchPayerMember } from "@/features/customers/services/payer-member-search.service";
import type { MemberVisitAutomationSetup } from "@/features/customers/types/member-visit-automation.types";
import type { PayerMember } from "@/features/customers/types/payer-member.types";
import type { MembershipSearchPayer } from "@/features/customers/utils/membership-search-payers";
import { useToast } from "@/providers/toast-provider";

const MIN_MEMBERSHIP_LENGTH = 2;

function automationStorageKey(clinicId: number | null) {
  return `hmis.memberVisitAutomation.setup.${clinicId ?? "none"}`;
}

function readAutomationSetup(clinicId: number | null): MemberVisitAutomationSetup {
  if (typeof window === "undefined") {
    return { enabled: false, department: "", consultationService: "" };
  }
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(automationStorageKey(clinicId)) || "",
    ) as Partial<MemberVisitAutomationSetup>;
    return {
      enabled: Boolean(parsed.enabled),
      department: typeof parsed.department === "string" ? parsed.department : "",
      consultationService:
        typeof parsed.consultationService === "string"
          ? parsed.consultationService
          : "",
    };
  } catch {
    return { enabled: false, department: "", consultationService: "" };
  }
}

function writeAutomationSetup(
  clinicId: number | null,
  setup: MemberVisitAutomationSetup,
) {
  window.sessionStorage.setItem(
    automationStorageKey(clinicId),
    JSON.stringify(setup),
  );
}
const PAYER_AUTH_UPDATE_MESSAGE =
  "Update the payer authentication before trying again.";

function searchFailureMessage(message: string) {
  if (
    /claims-engine auth failed|login failed|email\/password credentials/i.test(
      message,
    )
  ) {
    return PAYER_AUTH_UPDATE_MESSAGE;
  }
  return message;
}

function isMemberNotFound(message: string) {
  return /no such member|no member was found|membership number could not be found|no member with membership number|was not found on this policy/i.test(
    message,
  );
}

type MembershipSearchDialogProps = {
  open: boolean;
  payers: MembershipSearchPayer[];
  clinicId: number | null;
  onOpenChange: (open: boolean) => void;
  onSelectMember: (member: PayerMember, payerCode: string) => Promise<void> | void;
};

function memberLabel(member: PayerMember) {
  const named = [member.first_name, member.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  return named || member.name?.trim() || "Member";
}

function MembershipSearchSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="membership-search-loading"
      className="px-1 py-1"
    >
      <span className="sr-only">Searching for a member</span>
      <div className="overflow-hidden p-1">
        <p className="px-2.5 pt-3 pb-1.5 text-[11px] font-medium tracking-[0.08em] text-dash-muted uppercase">
          Member
        </p>
        {[
          { title: "h-3.5 w-[52%]", subtitle: "h-2.5 w-[28%]" },
          { title: "h-3.5 w-[40%]", subtitle: "h-2.5 w-[22%]" },
        ].map((row) => (
          <div
            key={row.title}
            className="flex items-center gap-3 rounded-lg px-2 py-2"
          >
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className={row.title} />
              <Skeleton className={row.subtitle} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <CommandEmpty>
      <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-2xl bg-dash-canvas text-dash-muted">
        <AppIcon name="search" size={18} />
      </span>
      <span className="block text-sm font-medium text-brand-navy">{title}</span>
      <span className="mt-1 block text-xs text-dash-muted">{description}</span>
    </CommandEmpty>
  );
}

export function MembershipSearchDialog({
  open,
  payers,
  clinicId,
  onOpenChange,
  onSelectMember,
}: MembershipSearchDialogProps) {
  const { toast } = useToast();
  const masmEnabled = useMasmIntegrationEnabled(clinicId);
  const [query, setQuery] = useState("");
  const [selectedPayer, setSelectedPayer] = useState<MembershipSearchPayer | null>(
    null,
  );
  const [member, setMember] = useState<PayerMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [submittedNumber, setSubmittedNumber] = useState<string | null>(null);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [trackedOpen, setTrackedOpen] = useState(open);
  const [automation, setAutomation] = useState<MemberVisitAutomationSetup>({
    enabled: false,
    department: "",
    consultationService: "",
  });
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupMode, setSetupMode] = useState<"enable" | "edit">("enable");
  const [settingsNoticeOpen, setSettingsNoticeOpen] = useState(false);

  if (open !== trackedOpen) {
    setTrackedOpen(open);
    setQuery("");
    setMember(null);
    setError(null);
    setIsSearching(false);
    setIsOpening(false);
    setSubmittedNumber(null);
    setSearchAttempt(0);
    setSelectedPayer(open && payers.length === 1 ? payers[0] : null);
  }

  useEffect(() => {
    setAutomation(readAutomationSetup(clinicId));
  }, [clinicId]);

  const choosingPayer = payers.length > 1 && selectedPayer === null;
  const membershipNumber = query.trim();

  const canSearch =
    Boolean(clinicId) &&
    Boolean(selectedPayer) &&
    membershipNumber.length >= MIN_MEMBERSHIP_LENGTH;

  async function startAutomation(entries: string, setup: MemberVisitAutomationSetup) {
    if (!clinicId || !selectedPayer) {
      toast({
        variant: "error",
        title: "Choose a payer",
        description: "Select a payer before starting automation.",
      });
      return;
    }
    try {
      await startMemberVisitAutomation({
        payer: selectedPayer.payerCode,
        clinicId,
        entries,
        department: setup.department,
        consultationService: setup.consultationService,
      });
      notifyMemberVisitAutomationRefresh();
      onOpenChange(false);
    } catch (startError) {
      toast({
        variant: "error",
        title: "Could not start automation",
        description:
          startError instanceof Error
            ? startError.message
            : "Something went wrong.",
      });
    }
  }

  function submitSearch() {
    if (!canSearch || isSearching) {
      return;
    }
    if (automation.enabled) {
      if (!automation.department) {
        setSetupOpen(true);
        return;
      }
      void startAutomation(membershipNumber, automation);
      return;
    }
    setMember(null);
    setError(null);
    setSubmittedNumber(membershipNumber);
    setSearchAttempt((attempt) => attempt + 1);
  }

  function toggleAutomation() {
    if (automation.enabled) {
      const next = { ...automation, enabled: false };
      setAutomation(next);
      writeAutomationSetup(clinicId, next);
      toast({ variant: "info", title: "Automation is off." });
      return;
    }
    if (!automation.department) {
      setSetupMode("enable");
      setSetupOpen(true);
      return;
    }
    const next = { ...automation, enabled: true };
    setAutomation(next);
    writeAutomationSetup(clinicId, next);
    toast({ variant: "success", title: "Automation is on." });
  }

  useEffect(() => {
    if (!open || choosingPayer || !selectedPayer || !submittedNumber) {
      return;
    }
    if (!clinicId || submittedNumber.length < MIN_MEMBERSHIP_LENGTH) {
      setMember(null);
      setError(null);
      setIsSearching(false);
      return;
    }

    let active = true;
    setIsSearching(true);
    setError(null);
    void searchPayerMember({
      payer: selectedPayer.payerCode,
      clinicId,
      membershipNumber: submittedNumber,
    })
      .then((result) => {
        if (!active) {
          return;
        }
        setMember(result);
      })
      .catch((searchError: unknown) => {
        if (!active) {
          return;
        }
        setMember(null);
        const message = searchError instanceof Error ? searchError.message : "";
        if (message && isMemberNotFound(message)) {
          setError(null);
          return;
        }
        setError(
          message ? searchFailureMessage(message) : "Something went wrong.",
        );
      })
      .finally(() => {
        if (active) {
          setIsSearching(false);
        }
      });

    return () => {
      active = false;
      setIsSearching(false);
    };
  }, [choosingPayer, clinicId, open, searchAttempt, selectedPayer, submittedNumber]);

  const payerMatches = payers.filter((payer) => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return true;
    }
    return (
      payer.name.toLowerCase().includes(term) ||
      payer.payerCode.toLowerCase().includes(term)
    );
  });

  return (
    <>
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={false}
    >
      <CommandInput
        placeholder={
          choosingPayer
            ? "Choose a payer"
            : automation.enabled
              ? "Membership numbers or client names, separated by commas"
              : "Membership number"
        }
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          if (value.trim() === submittedNumber) {
            return;
          }
          setMember(null);
          setError(null);
          setSubmittedNumber(null);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || choosingPayer || (!automation.enabled && member)) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          submitSearch();
        }}
        isLoading={isSearching}
        aria-label={choosingPayer ? "Choose a payer" : "Membership number"}
        trailing={
          choosingPayer ? null : (
            <span className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="h-8 shrink-0 rounded-full px-3.5"
                disabled={!canSearch || isSearching}
                onClick={submitSearch}
                data-testid="membership-search-submit"
              >
                Search
              </Button>
              {masmEnabled ? (
                <>
                  <Button
                    type="button"
                    variant={automation.enabled ? "primary" : "outline"}
                    size="icon"
                    className="size-8 shrink-0 rounded-full"
                    aria-pressed={automation.enabled}
                    aria-label={
                      automation.enabled
                        ? "Turn automation off"
                        : "Turn automation on"
                    }
                    onClick={toggleAutomation}
                    data-testid="membership-automation-toggle"
                  >
                    <AppIcon name="automation" size={15} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={
                      automation.enabled
                        ? "size-8 shrink-0 rounded-full"
                        : "size-8 shrink-0 rounded-full text-dash-muted"
                    }
                    aria-label="Automation settings"
                    onClick={() => {
                      if (!automation.enabled) {
                        setSettingsNoticeOpen(true);
                        return;
                      }
                      setSetupMode("edit");
                      setSetupOpen(true);
                    }}
                    data-testid="membership-automation-settings"
                  >
                    <AppIcon name="settings" size={15} />
                  </Button>
                </>
              ) : null}
            </span>
          )
        }
      />
      {selectedPayer && payers.length > 1 ? (
        <div className="flex items-center justify-between gap-3 px-4 pb-3">
          <p className="truncate text-xs text-dash-muted">{selectedPayer.name}</p>
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-brand-navy hover:text-brand-primary"
            onClick={() => {
              setSelectedPayer(null);
              setQuery("");
              setMember(null);
              setError(null);
              setSubmittedNumber(null);
            }}
          >
            Change payer
          </button>
        </div>
      ) : null}
      <div className="mx-4 h-px bg-dash-border/80" />
      <CommandList data-testid="membership-search-results">
        {choosingPayer ? (
          payerMatches.length === 0 ? (
            <SearchEmpty
              title="No matching payers."
              description="Try another name or code."
            />
          ) : (
            <CommandGroup heading="Payers">
              {payerMatches.map((payer) => (
                <CommandItem
                  key={payer.id}
                  value={payer.id}
                  onSelect={() => {
                    setSelectedPayer(payer);
                    setQuery("");
                    setMember(null);
                    setError(null);
                    setSubmittedNumber(null);
                  }}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-dash-canvas text-dash-muted group-data-[selected=true]:bg-white group-data-[selected=true]:text-brand-primary">
                    <AppIcon name="search" size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{payer.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-dash-muted">
                      {payer.payerCode}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )
        ) : !clinicId ? (
          <SearchEmpty
            title="No clinic selected."
            description="Choose a clinic, then search for a member."
          />
        ) : automation.enabled ? (
          <SearchEmpty
            title="Automatic visit creation."
            description="Membership numbers or client names, separated by commas."
          />
        ) : membershipNumber.length < MIN_MEMBERSHIP_LENGTH ||
          submittedNumber !== membershipNumber ? (
          <SearchEmpty
            title="Search by membership number."
            description={
              selectedPayer
                ? `Look up a ${selectedPayer.name} member.`
                : "Enter a membership number."
            }
          />
        ) : isSearching ? (
          <MembershipSearchSkeleton />
        ) : error ? (
          <SearchEmpty title="Unable to search." description={error} />
        ) : member ? (
          <CommandGroup heading="Member">
            <CommandItem
              value={member.membership_number || membershipNumber}
              disabled={isOpening}
              onSelect={() => {
                if (isOpening) {
                  return;
                }
                setIsOpening(true);
                void Promise.resolve(
                  onSelectMember(
                    {
                      ...member,
                      membership_number:
                        member.membership_number || membershipNumber,
                    },
                    selectedPayer?.payerCode ?? "",
                  ),
                ).finally(() => {
                  setIsOpening(false);
                });
              }}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-dash-canvas text-dash-muted group-data-[selected=true]:bg-white group-data-[selected=true]:text-brand-primary">
                <AppIcon name="patient" size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{memberLabel(member)}</span>
                <span className="mt-0.5 block truncate text-xs text-dash-muted">
                  {member.membership_number || membershipNumber}
                </span>
              </span>
            </CommandItem>
          </CommandGroup>
        ) : (
          <SearchEmpty
            title="No matching member."
            description="Check the membership number and try again."
          />
        )}
      </CommandList>
    </CommandDialog>
    <MemberVisitAutomationDialog
      open={setupOpen}
      clinicId={clinicId}
      department={automation.department}
      consultationService={automation.consultationService}
      title={setupMode === "edit" ? "Automation settings" : undefined}
      description={
        setupMode === "edit"
          ? "Visits started by automation use the department and service below."
          : undefined
      }
      confirmLabel={setupMode === "edit" ? "Save" : undefined}
      onOpenChange={setSetupOpen}
      onConfirm={(setup) => {
        const next = { ...setup, enabled: true };
        setAutomation(next);
        writeAutomationSetup(clinicId, next);
        setSetupOpen(false);
        if (setupMode === "edit") {
          toast({ variant: "success", title: "Automation settings saved." });
          return;
        }
        toast({ variant: "success", title: "Automation is on." });
        if (membershipNumber.length >= MIN_MEMBERSHIP_LENGTH) {
          void startAutomation(membershipNumber, next);
        }
      }}
    />
    <SectionedDialog
      open={settingsNoticeOpen}
      onOpenChange={setSettingsNoticeOpen}
      title="Automation settings"
      description="Turn automation on before changing the department and service."
      data-testid="membership-automation-settings-notice"
      contentClassName="hidden"
      footer={
        <div className="flex justify-end">
          <SecondaryButton type="button" onClick={() => setSettingsNoticeOpen(false)}>
            Close
          </SecondaryButton>
        </div>
      }
    >
      {null}
    </SectionedDialog>
    </>
  );
}
