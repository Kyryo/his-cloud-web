"use client";

import { ExternalLink, ImageIcon, Link2 } from "lucide-react";
import { useMemo, useState } from "react";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { Button } from "@/components/ui/button";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { cn } from "@/lib/utils";

type ClaimDetailReferenceTabProps = {
  claim: ClaimDetail;
  isActive: boolean;
};

type ReferenceRow = {
  id: string;
  title: string;
  summary: string;
  href?: string | null;
  screenshotUrl?: string | null;
};

export function ClaimDetailReferenceTab({
  claim,
  isActive,
}: ClaimDetailReferenceTabProps) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const reference = claim.payer_reference;
  const rows = useMemo<ReferenceRow[]>(() => {
    if (!reference?.portal_url && !reference?.portal_claim_id) {
      return [];
    }
    const portalClaimId = reference.portal_claim_id;
    return [
      {
        id: "portal-claim",
        title: portalClaimId
          ? `${claim.payer_code} claim #${portalClaimId}`
          : `${claim.payer_code} portal claim`,
        summary: reference.portal_url
          ? "Open the payer portal claim. A portal screenshot is available when claims-engine provides it."
          : "Payer claim id is known, but the portal URL has not been provided yet.",
        href: reference.portal_url,
        screenshotUrl: reference.screenshot_url,
      },
    ];
  }, [claim.payer_code, reference]);

  if (!isActive) {
    return null;
  }

  if (rows.length === 0) {
    return (
      <DetailTabEmptyState
        icon={Link2}
        title="No payer reference yet"
        description="After the payer portal webhook is received, the portal claim link and screenshot will appear here."
        data-testid="claim-reference-empty-state"
      />
    );
  }

  return (
    <>
      <section
        className="rounded-xl border border-brand-border bg-white"
        data-testid="claim-reference-list"
      >
        <div className="border-b border-brand-border px-4 py-2.5">
          <h3 className="text-sm font-semibold text-brand-navy">Reference</h3>
          <p className="mt-0.5 text-xs text-brand-muted">
            Payer portal links and screenshots for this claim.
          </p>
        </div>

        <ol className="divide-y divide-brand-border">
          {rows.map((row) => (
            <li key={row.id} className="px-4 py-2.5">
              <div className="flex gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-brand-border bg-slate-50 text-brand-primary">
                  <Link2 className="size-3" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-tight text-brand-navy">
                      {row.title}
                    </p>
                    <p className="text-xs leading-snug text-brand-slate">
                      {row.summary}
                    </p>
                    {row.href ? (
                      <a
                        href={row.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-1 truncate font-mono text-[11px] text-brand-primary underline-offset-2 hover:underline"
                      >
                        <span className="truncate">{row.href}</span>
                        <ExternalLink
                          className="size-3 shrink-0"
                          aria-hidden="true"
                        />
                      </a>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {row.href ? (
                      <Button type="button" size="sm" variant="outline" asChild>
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          Open portal
                        </a>
                      </Button>
                    ) : null}
                    {row.screenshotUrl ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setScreenshotUrl(row.screenshotUrl || null)}
                      >
                        <ImageIcon className="size-3.5" aria-hidden="true" />
                        View screenshot
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {screenshotUrl ? (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Payer portal screenshot"
          onClick={() => setScreenshotUrl(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-brand-border px-4 py-2.5">
              <h3 className="text-sm font-semibold text-brand-navy">
                Portal screenshot
              </h3>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setScreenshotUrl(null)}
              >
                Close
              </Button>
            </div>
            <div className="min-h-48 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotUrl}
                alt="Payer portal claim screenshot"
                className="max-h-[80vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
