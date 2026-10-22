"use client";

import { overviewGreeting } from "@/features/overview/utils/overview-greeting";

export const OVERVIEW_DAILY_LEAD = "Here's your workspace for today.";
export const OVERVIEW_SETUP_LEAD = "Here's what your clinic still needs.";

type OverviewGreetingProps = {
  name?: string;
  lead?: string | null;
};

export function OverviewGreeting({
  name,
  lead = OVERVIEW_DAILY_LEAD,
}: OverviewGreetingProps) {
  const greeting = overviewGreeting(name, new Date());

  return (
    <header className="max-w-xl">
      <h1
        className="text-[1.65rem] font-semibold tracking-tight text-brand-navy sm:text-[1.85rem]"
        suppressHydrationWarning
      >
        {greeting}
        {name?.trim() ? "." : ""}
      </h1>
      {lead ? (
        <p className="mt-1.5 text-[14px] leading-6 text-dash-muted">{lead}</p>
      ) : null}
    </header>
  );
}
