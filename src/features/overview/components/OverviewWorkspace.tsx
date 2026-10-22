"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { OverviewActivityFeed } from "@/features/overview/components/OverviewActivityFeed";
import {
  OVERVIEW_DAILY_LEAD,
  OVERVIEW_SETUP_LEAD,
  OverviewGreeting,
} from "@/features/overview/components/OverviewGreeting";
import { OverviewQuickAccessCards } from "@/features/overview/components/OverviewQuickAccessCards";
import { OverviewSetupSection } from "@/features/overview/components/OverviewSetupSection";
import { OverviewWorkspaceSkeleton } from "@/features/overview/components/OverviewWorkspaceSkeleton";
import { fetchOverviewHome } from "@/features/overview/services/overview-home.service";
import type { OverviewSetupMode } from "@/features/overview/utils/overview-setup";
import { resolveQuickAccessCards } from "@/features/overview/utils/overview-start";
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

  const home = useQuery({
    queryKey: ["overview-home"],
    queryFn: fetchOverviewHome,
    enabled: showDailyOverview,
    retry: false,
  });

  const cards = resolveQuickAccessCards(
    home.data?.quick_access,
    userGroups,
    enabledModules,
  );

  return (
    <div className="relative mx-auto w-full max-w-3xl pb-12 pt-8 sm:pt-10">
      <div className="relative">
        <div
          className={cn(
            "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
            visible
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-1 opacity-0",
          )}
        >
          <OverviewGreeting name={userData?.name} lead={lead} />
          {shown === "pending" ? (
            <div className="mt-8">
              <OverviewWorkspaceSkeleton />
            </div>
          ) : null}
          <div className="mt-6">
            <OverviewSetupSection
              isAdmin={Boolean(userData?.is_admin)}
              present={shown === "checklist" || shown === "ready"}
              onMode={setSetupMode}
            />
          </div>
        </div>

        {showDailyOverview ? (
          <div
            className={cn(
              "mt-8 space-y-10 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
              visible
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-1 opacity-0",
            )}
          >
            {home.isPending ? (
              <OverviewWorkspaceSkeleton />
            ) : (
              <OverviewQuickAccessCards
                cards={cards}
                userGroups={userGroups}
                enabledModules={enabledModules}
              />
            )}
            <OverviewActivityFeed />
          </div>
        ) : null}
      </div>
    </div>
  );
}
