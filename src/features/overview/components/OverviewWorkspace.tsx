"use client";

import { useEffect, useState } from "react";

import { OverviewBlogSection } from "@/features/overview/components/OverviewBlogSection";
import {
  OVERVIEW_DAILY_LEAD,
  OVERVIEW_SETUP_LEAD,
  OverviewGreeting,
} from "@/features/overview/components/OverviewGreeting";
import { OverviewQuickLinks } from "@/features/overview/components/OverviewQuickLinks";
import { OverviewSetupSection } from "@/features/overview/components/OverviewSetupSection";
import { OverviewUsageSection } from "@/features/overview/components/OverviewUsageSection";
import { OverviewWorkspaceSkeleton } from "@/features/overview/components/OverviewWorkspaceSkeleton";
import type { OverviewSetupMode } from "@/features/overview/utils/overview-setup";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";

type SetupChrome = OverviewSetupMode | "pending";

const SWAP_MS = 180;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useSettledMode(mode: SetupChrome) {
  const [shown, setShown] = useState(mode);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (mode === shown) {
      return;
    }
    if (prefersReducedMotion()) {
      setShown(mode);
      setVisible(true);
      return;
    }

    setVisible(false);
    const timer = window.setTimeout(() => {
      setShown(mode);
      window.requestAnimationFrame(() => setVisible(true));
    }, SWAP_MS);

    return () => window.clearTimeout(timer);
  }, [mode, shown]);

  return { shown, visible };
}

export function OverviewWorkspace() {
  const { userData } = useUser();
  const userGroups = userData?.groups ?? [];
  const enabledModules = userData?.enabled_modules ?? [];
  const [setupMode, setSetupMode] = useState<SetupChrome>("pending");
  const { shown, visible } = useSettledMode(setupMode);
  const showDailyOverview = shown !== "checklist" && shown !== "pending";
  const lead =
    shown === "checklist"
      ? OVERVIEW_SETUP_LEAD
      : shown === "pending"
        ? null
        : OVERVIEW_DAILY_LEAD;

  return (
    <div className="relative mx-auto w-full max-w-3xl pb-10 pt-8 sm:pt-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-4 h-72 bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,var(--color-brand-tint)_0%,transparent_70%)]"
      />
      <div className="relative">
        <OverviewGreeting name={userData?.name} lead={null} />
        <div
          className={cn(
            "mt-3 space-y-3 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
            visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
          )}
        >
          {lead ? (
            <p className="mx-auto max-w-md text-center text-[15px] leading-6 text-dash-muted">
              {lead}
            </p>
          ) : null}
          {shown === "pending" ? <OverviewWorkspaceSkeleton /> : null}
          <OverviewSetupSection
            isAdmin={Boolean(userData?.is_admin)}
            present={shown === "checklist" || shown === "ready"}
            onMode={setSetupMode}
          />
        </div>
        {showDailyOverview ? (
          <div
            className={cn(
              "mt-12 space-y-12 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
              visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
            )}
          >
            <OverviewQuickLinks
              userGroups={userGroups}
              enabledModules={enabledModules}
            />
            <OverviewUsageSection
              userGroups={userGroups}
              enabledModules={enabledModules}
            />
            <OverviewBlogSection />
          </div>
        ) : null}
      </div>
    </div>
  );
}
