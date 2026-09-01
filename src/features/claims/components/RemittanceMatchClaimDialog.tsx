"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { fetchClaims } from "@/features/claims/services/claims.service";
import { matchRemittanceRow } from "@/features/claims/services/remittances.service";
import type { ClaimListItem } from "@/features/claims/types/claims.types";
import type { RemittanceRow } from "@/features/claims/types/remittances.types";
import { appFont } from "@/lib/fonts";

type RemittanceMatchClaimDialogProps = {
  batchId: number | string;
  row: RemittanceRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMatched: (row: RemittanceRow) => void;
};

export function RemittanceMatchClaimDialog({
  batchId,
  row,
  open,
  onOpenChange,
  onMatched,
}: RemittanceMatchClaimDialogProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ClaimListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && row) {
      const defaultSearch = row.member_number || row.invoice_number || "";
      setSearch(defaultSearch);
      setResults([]);
      setError(null);
      if (defaultSearch.trim()) {
        void runSearch(defaultSearch.trim());
      }
    }
  }, [open, row]);

  async function runSearch(term: string) {
    setIsSearching(true);
    setError(null);
    try {
      const response = await fetchClaims({ search: term, pageSize: 10 });
      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSearch() {
    const term = search.trim();
    if (!term) {
      return;
    }
    await runSearch(term);
  }

  async function handleMatch(claimId: number) {
    if (!row) {
      return;
    }
    setIsMatching(true);
    setError(null);
    try {
      const updated = await matchRemittanceRow(batchId, row.id, claimId);
      onMatched(updated);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Match failed.");
    } finally {
      setIsMatching(false);
    }
  }

  const busy = isSearching || isMatching;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && busy) {
          return;
        }
        onOpenChange(nextOpen);
      }}
      title="Match to claim"
      description="Search for the claim that corresponds to this remittance line, then select it."
      className={appFont.className}
      data-testid="remittance-match-claim-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
        </>
      }
    >
      <div className="space-y-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="space-y-2">
          <Label htmlFor="remittance-match-search">Search claims</Label>
          <div className="flex gap-2">
            <Input
              id="remittance-match-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Member #, invoice, or patient name"
              disabled={busy}
              data-testid="remittance-match-search-input"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSearch();
                }
              }}
            />
            <SecondaryButton
              type="button"
              disabled={busy || !search.trim()}
              onClick={() => void handleSearch()}
            >
              {isSearching ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                "Search"
              )}
            </SecondaryButton>
          </div>
        </div>

        <div className="space-y-2">
          {isSearching && results.length === 0 ? (
            <p className="text-sm text-brand-muted">Searching…</p>
          ) : null}
          {!isSearching && results.length === 0 ? (
            <p className="text-sm text-brand-muted">
              No claims found. Try member number, invoice name, or patient name.
            </p>
          ) : null}
          <ul className="space-y-2" data-testid="remittance-match-results">
            {results.map((claim) => (
              <li
                key={claim.id}
                className="rounded-xl border border-brand-border bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 text-sm">
                    <p className="font-medium text-brand-navy">
                      {claim.customer_name}
                    </p>
                    <p className="text-brand-muted">
                      {claim.invoice_name} · {claim.membership_number}
                    </p>
                    <p className="text-xs text-brand-muted">
                      Claim #{claim.id} · {claim.status}
                      {claim.claim_reference_number
                        ? ` · ref ${claim.claim_reference_number}`
                        : ""}
                    </p>
                  </div>
                  <PrimaryButton
                    type="button"
                    size="sm"
                    disabled={busy}
                    data-testid={`remittance-match-claim-${claim.id}`}
                    onClick={() => void handleMatch(claim.id)}
                  >
                    {isMatching ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      "Match"
                    )}
                  </PrimaryButton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionedDialog>
  );
}
