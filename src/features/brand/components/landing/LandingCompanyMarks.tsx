import type { ReactNode } from "react";

import { LANDING_CUSTOMERS } from "@/features/brand/constants/landing-tokens";

function MarkGlyph({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      {children}
    </svg>
  );
}

const MARKS: Record<(typeof LANDING_CUSTOMERS)[number]["id"], () => ReactNode> = {
  "masm-mediclinics": () => (
    <MarkGlyph>
      <path
        d="M4 19V5h3.2l4.8 10.4L16.8 5H20v14h-2.6V9.2L14.2 19h-2.4L8.6 9.2V19H4Z"
        fill="currentColor"
      />
    </MarkGlyph>
  ),
  liberty: () => (
    <MarkGlyph>
      <path
        d="M12 3.5 20 19h-2.8l-1.6-3.2H8.4L6.8 19H4L12 3.5Zm0 5.2L9.7 13.4h4.6L12 8.7Z"
        fill="currentColor"
      />
    </MarkGlyph>
  ),
  medgulf: () => (
    <MarkGlyph>
      <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </MarkGlyph>
  ),
  mwai: () => (
    <MarkGlyph>
      <path
        d="M5 18c4.2-7.5 9.8-7.5 14 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="8" r="2.4" fill="currentColor" />
    </MarkGlyph>
  ),
  amani: () => (
    <MarkGlyph>
      <path
        d="M12 4.5c3.2 2.6 5.8 5.4 5.8 8.6A5.8 5.8 0 0 1 12 19a5.8 5.8 0 0 1-5.8-5.9c0-3.2 2.6-6 5.8-8.6Z"
        fill="currentColor"
      />
    </MarkGlyph>
  ),
  lakeside: () => (
    <MarkGlyph>
      <path
        d="M4 14.5c2.2-1.4 3.6-1.4 5.8 0s3.6 1.4 5.8 0 3.6-1.4 4.4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 18c2.2-1.4 3.6-1.4 5.8 0s3.6 1.4 5.8 0 3.6-1.4 4.4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </MarkGlyph>
  ),
  nthanda: () => (
    <MarkGlyph>
      <path d="M12 3.8 14.6 9l5.6.6-4.2 3.8 1.2 5.5L12 16.4 6.8 18.9 8 13.4 3.8 9.6 9.4 9 12 3.8Z" fill="currentColor" />
    </MarkGlyph>
  ),
  harambee: () => (
    <MarkGlyph>
      <rect x="4.2" y="4.2" width="6.6" height="6.6" rx="1.2" fill="currentColor" />
      <rect x="13.2" y="4.2" width="6.6" height="6.6" rx="1.2" fill="currentColor" />
      <rect x="4.2" y="13.2" width="6.6" height="6.6" rx="1.2" fill="currentColor" />
      <rect x="13.2" y="13.2" width="6.6" height="6.6" rx="1.2" fill="currentColor" />
    </MarkGlyph>
  ),
};

export function LandingCompanyMarks() {
  return (
    <ul className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4 sm:gap-x-10 sm:gap-y-8">
      {LANDING_CUSTOMERS.map((company) => {
        const Mark = MARKS[company.id];

        return (
          <li
            key={company.id}
            className="flex items-center gap-2.5 text-[color:var(--landing-ink)]"
          >
            <Mark />
            <span className="landing-display text-[0.95rem] font-semibold tracking-[-0.03em] sm:text-base">
              {company.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
