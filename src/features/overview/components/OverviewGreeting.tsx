"use client";

import { overviewGreeting } from "@/features/overview/utils/overview-greeting";

export const OVERVIEW_DAILY_LEAD = "Here's what you can get done today.";
export const OVERVIEW_SETUP_LEAD = "Here's what your clinic still needs.";

type OverviewGreetingProps = {
  name?: string;
  lead?: string | null;
};

export function OverviewGreeting({ name, lead = OVERVIEW_DAILY_LEAD }: OverviewGreetingProps) {
  const greeting = overviewGreeting(name, new Date());

  return (
    <header className="px-2 text-center">
      <h1
        className="text-[2rem] font-semibold leading-tight tracking-tight text-brand-navy sm:text-4xl"
        suppressHydrationWarning
      >
        {greeting}
      </h1>
      {lead ? (
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-6 text-dash-muted">
          {lead}
        </p>
      ) : null}
    </header>
  );
}
