import {
  EyeOff,
  FileWarning,
  Link2Off,
  type LucideIcon,
  Sheet,
} from "lucide-react";
import type { ReactNode } from "react";

import { LANDING_PROBLEM } from "@/features/brand/constants/landing-home-content";
import { cn } from "@/lib/utils";

/** Teal system for this section — deep headings, mid accents, cool neutrals. */
const T = {
  deep: "#0F4C4C",
  mid: "#0B6E6E",
  tint: "#E6F2F2",
  softHeader: "#EDF5F5",
  body: "#5B6B6B",
  muted: "#7A8C8C",
  border: "#D5DEDE",
  hairline: "#E4EDED",
} as const;

const CARD_ICONS: LucideIcon[] = [FileWarning, Link2Off, Sheet, EyeOff];

/** Flush inlay: divider + eyebrow only — no nested panel. */
function ArtifactFrame({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      className="mt-auto -mx-6 border-t px-6 pt-4 sm:-mx-7 sm:px-7"
      style={{ borderColor: T.border }}
      aria-hidden="true"
    >
      <p
        className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em]"
        style={{ color: T.muted }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function RejectedClaimArtifact() {
  return (
    <ArtifactFrame label="Claims · MASM remittance">
      <div className="pb-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="truncate font-mono text-[11px]"
              style={{ color: T.muted }}
            >
              CLM-10492
            </p>
            <p
              className="mt-0.5 truncate text-sm font-medium"
              style={{ color: T.deep }}
            >
              Chikondi Banda · Outpatient visit
            </p>
          </div>
          <span className="shrink-0 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
            Rejected
          </span>
        </div>
        <dl
          className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t pt-3 text-[11px]"
          style={{ borderColor: T.hairline }}
        >
          <dt style={{ color: T.muted }}>Billed</dt>
          <dd
            className="text-right font-medium tabular-nums"
            style={{ color: T.deep }}
          >
            MWK 48,500.00
          </dd>
          <dt style={{ color: T.muted }}>Reason</dt>
          <dd className="text-right font-medium" style={{ color: T.deep }}>
            CO-16 · Missing auth #
          </dd>
          <dt style={{ color: T.muted }}>Denied</dt>
          <dd
            className="text-right tabular-nums"
            style={{ color: T.body }}
          >
            12 Mar 2026
          </dd>
        </dl>
      </div>
    </ArtifactFrame>
  );
}

function PaymentMismatchArtifact() {
  return (
    <ArtifactFrame label="Bank feed · unmatched">
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr
            className="text-[10px] uppercase tracking-wide"
            style={{ backgroundColor: T.softHeader, color: T.muted }}
          >
            <th className="px-0 py-2 pr-3 font-medium">Ref</th>
            <th className="px-0 py-2 pr-3 font-medium">Amount</th>
            <th className="px-0 py-2 font-medium">Claim</th>
          </tr>
        </thead>
        <tbody style={{ color: T.body }}>
          <tr className="border-b" style={{ borderColor: T.hairline }}>
            <td className="py-2 pr-3 font-mono" style={{ color: T.deep }}>
              EFT-8821
            </td>
            <td className="py-2 pr-3 tabular-nums">MWK 126,000</td>
            <td className="py-2 font-medium text-red-700">No match</td>
          </tr>
          <tr className="border-b" style={{ borderColor: T.hairline }}>
            <td className="py-2 pr-3 font-mono" style={{ color: T.deep }}>
              EFT-8794
            </td>
            <td className="py-2 pr-3 tabular-nums">MWK 54,200</td>
            <td className="py-2" style={{ color: T.muted }}>
              CLM-10311?
            </td>
          </tr>
          <tr>
            <td className="py-2 pr-3 font-mono" style={{ color: T.deep }}>
              EFT-8702
            </td>
            <td className="py-2 pr-3 tabular-nums">MWK 91,750</td>
            <td className="py-2 font-medium text-red-700">Duplicate?</td>
          </tr>
        </tbody>
      </table>
    </ArtifactFrame>
  );
}

function SpreadsheetArtifact() {
  const rows = [
    ["Chikondi B.", "MASM", "48500", "?", "Follow up"],
    ["A. Phiri", "Liberty", "126000", "partial", ""],
    ["J. Mwale", "MASM", "31200", "", "resubmit"],
    ["Total", "", "205700", "", ""],
  ] as const;

  return (
    <ArtifactFrame label="AR_followup_Mar26.xlsx">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-left text-[10px] leading-none">
          <thead>
            <tr style={{ backgroundColor: T.tint, color: T.muted }}>
              {["A", "B", "C", "D", "E"].map((col) => (
                <th
                  key={col}
                  className="border-b border-r px-2 py-1.5 text-center font-medium last:border-r-0"
                  style={{ borderColor: T.hairline }}
                >
                  {col}
                </th>
              ))}
            </tr>
            <tr style={{ color: T.deep }}>
              {["Patient", "Scheme", "Billed", "Paid?", "Notes"].map((h) => (
                <th
                  key={h}
                  className="border-b border-r px-2 py-1.5 font-semibold last:border-r-0"
                  style={{
                    borderColor: T.hairline,
                    backgroundColor: T.softHeader,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono" style={{ color: T.body }}>
            {rows.map((row, i) => {
              const isTotal = i === rows.length - 1;
              return (
                <tr
                  key={row[0]}
                  style={
                    isTotal
                      ? { backgroundColor: T.tint, color: T.deep, fontWeight: 600 }
                      : undefined
                  }
                >
                  {row.map((cell, j) => (
                    <td
                      key={`${row[0]}-${j}`}
                      className={cn(
                        "border-b border-r px-2 py-1.5 last:border-r-0",
                        j === 3 && cell === "?" && "bg-red-50 text-red-700",
                        j === 3 &&
                          cell === "partial" &&
                          "bg-amber-50 text-amber-800",
                      )}
                      style={{ borderColor: T.hairline }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ArtifactFrame>
  );
}

function PendingBalancesArtifact() {
  return (
    <ArtifactFrame label="Insurer aging · incomplete">
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr
            className="text-[10px] uppercase tracking-wide"
            style={{ backgroundColor: T.softHeader, color: T.muted }}
          >
            <th className="py-2 pr-3 font-medium">Insurer</th>
            <th className="py-2 pr-3 text-right font-medium">0–30d</th>
            <th className="py-2 pr-3 text-right font-medium">31–60d</th>
            <th className="py-2 text-right font-medium">Total due</th>
          </tr>
        </thead>
        <tbody style={{ color: T.body }}>
          <tr className="border-b" style={{ borderColor: T.hairline }}>
            <td className="py-2 pr-3 font-medium" style={{ color: T.deep }}>
              MASM
            </td>
            <td className="py-2 pr-3 text-right tabular-nums">482,100</td>
            <td className="py-2 pr-3 text-right tabular-nums">191,400</td>
            <td
              className="py-2 text-right tabular-nums"
              style={{ color: T.muted }}
            >
              —
            </td>
          </tr>
          <tr className="border-b" style={{ borderColor: T.hairline }}>
            <td className="py-2 pr-3 font-medium" style={{ color: T.deep }}>
              Liberty
            </td>
            <td className="py-2 pr-3 text-right tabular-nums">95,000</td>
            <td
              className="py-2 pr-3 text-right tabular-nums"
              style={{ color: T.muted }}
            >
              ?
            </td>
            <td
              className="py-2 text-right tabular-nums"
              style={{ color: T.muted }}
            >
              —
            </td>
          </tr>
          <tr>
            <td className="py-2 pr-3 font-medium" style={{ color: T.deep }}>
              Medgulf
            </td>
            <td
              className="py-2 pr-3 text-right tabular-nums"
              style={{ color: T.muted }}
            >
              export failed
            </td>
            <td
              className="py-2 pr-3 text-right tabular-nums"
              style={{ color: T.muted }}
            >
              —
            </td>
            <td className="py-2 text-right font-medium text-red-700">Unknown</td>
          </tr>
        </tbody>
      </table>
    </ArtifactFrame>
  );
}

const ARTIFACTS = [
  RejectedClaimArtifact,
  PaymentMismatchArtifact,
  SpreadsheetArtifact,
  PendingBalancesArtifact,
] as const;

export function LandingProblemFeatureCards() {
  return (
    <ul className="mx-auto mt-16 grid max-w-5xl list-none gap-4 p-0 sm:mt-20 sm:grid-cols-2 sm:gap-5">
      {LANDING_PROBLEM.items.map((item, index) => {
        const Icon = CARD_ICONS[index] ?? FileWarning;
        const Artifact = ARTIFACTS[index] ?? RejectedClaimArtifact;

        return (
          <li
            key={item.title}
            className="flex h-full list-none flex-col rounded-[16px] border bg-white p-6 sm:p-7"
            style={{ borderColor: T.border }}
          >
            <div className="flex items-start gap-2.5">
              <Icon
                className="mt-0.5 size-4 shrink-0"
                style={{ color: T.mid }}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <h3
                className="text-base font-semibold tracking-tight sm:text-[1.05rem]"
                style={{ color: T.deep }}
              >
                {item.title}
              </h3>
            </div>
            <p
              className="mt-2.5 text-sm leading-relaxed"
              style={{ color: T.body }}
            >
              {item.description}
            </p>
            <div className="mt-6 flex min-h-0 flex-1 flex-col">
              <Artifact />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
