import type { ReactNode } from "react";
import Image from "next/image";

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
      {LANDING_CUSTOMERS.map((company) => (
        <CompanyMarkItem key={company.id} company={company} />
      ))}
    </ul>
  );
}

const HERO_LOGOS = [
  {
    id: "masm-mediclinics",
    src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=240&h=240&q=80",
  },
  {
    id: "liberty",
    src: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=240&h=240&q=80",
  },
  {
    id: "medgulf",
    src: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=240&h=240&q=80",
  },
] as const;

export function LandingHeroMarks() {
  return (
    <ul className="flex items-center -space-x-2.5" aria-hidden="true">
      {HERO_LOGOS.map((company) => (
        <li key={company.id} className="relative">
          <Image
            src={company.src}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-full object-cover ring-2 ring-white grayscale"
          />
        </li>
      ))}
    </ul>
  );
}

function CompanyMarkItem({
  company,
}: {
  company: (typeof LANDING_CUSTOMERS)[number];
}) {
  const Mark = MARKS[company.id];

  return (
    <li className="flex items-center gap-2.5 text-[color:var(--landing-ink)]">
      <Mark />
      <span className="landing-display text-[0.95rem] font-semibold tracking-[-0.03em] sm:text-base">
        {company.name}
      </span>
    </li>
  );
}
