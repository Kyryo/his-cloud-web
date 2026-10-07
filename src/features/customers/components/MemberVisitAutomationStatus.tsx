"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";
import {
  fetchMemberVisitAutomations,
  MEMBER_VISIT_AUTOMATION_REFRESH,
} from "@/features/customers/services/member-visit-automation.service";
import type { MemberVisitAutomationRun } from "@/features/customers/types/member-visit-automation.types";
import { BffError } from "@/lib/bff-client";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";

const POLL_MS = 30_000;

function isRunning(run: MemberVisitAutomationRun) {
  return run.status === "pending" || run.status === "running";
}

function progressLabel(run: MemberVisitAutomationRun) {
  const processed = Math.min(
    isRunning(run) ? run.completed + 1 : run.completed,
    run.total,
  );
  return `Processing ${processed} of ${run.total} clients.`;
}

function hasFrontDeskAccess(groups: string[] | undefined) {
  return Boolean(groups?.includes("Registration"));
}

export function MemberVisitAutomationStatus() {
  const { userData } = useUser();
  const [runs, setRuns] = useState<MemberVisitAutomationRun[]>([]);
  const [open, setOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  const refresh = useCallback(async () => {
    if (!hasFrontDeskAccess(userData?.groups)) {
      setDenied(Boolean(userData));
      setRuns([]);
      return;
    }
    try {
      const next = await fetchMemberVisitAutomations();
      setDenied(false);
      setRuns(next);
    } catch (error) {
      if (error instanceof BffError && error.status === 403) {
        setDenied(true);
        setRuns([]);
        return;
      }
      setRuns([]);
    }
  }, [userData]);

  useEffect(() => {
    void refresh();
    const onRefresh = () => {
      void refresh();
    };
    window.addEventListener(MEMBER_VISIT_AUTOMATION_REFRESH, onRefresh);
    return () => {
      window.removeEventListener(MEMBER_VISIT_AUTOMATION_REFRESH, onRefresh);
    };
  }, [refresh]);

  const active = runs.filter(isRunning);
  const running = active.length > 0;
  const featured = active[0] ?? runs[0] ?? null;

  useEffect(() => {
    if (!running) {
      return;
    }
    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh, running]);

  const label = running
    ? active.length > 1
      ? `${active.length} automations running`
      : `Automation running. ${featured ? progressLabel(featured) : ""}`.trim()
    : "Visit automation";

  return (
    <>
      <button
        type="button"
        data-testid="app-header-automation-trigger"
        aria-label={label}
        onClick={() => setOpen(true)}
        className={cn(
          "relative flex size-8 items-center justify-center rounded-lg transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25",
          running
            ? "text-brand-primary hover:bg-white"
            : "text-dash-muted hover:bg-white hover:text-brand-navy",
        )}
      >
        <AppIcon name="automation" size={18} />
        {running ? (
          <span
            data-testid="app-header-automation-live"
            className="absolute right-1 top-1 flex size-2"
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-primary" />
          </span>
        ) : null}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Visit automation</SheetTitle>
            <SheetDescription>
              {denied
                ? "Front Desk access is required to view visit automation."
                : running && featured
                  ? progressLabel(featured)
                  : featured
                    ? featured.failed > 0
                      ? `${featured.failed} of ${featured.total} clients could not be processed.`
                      : `All ${featured.total} clients were processed.`
                    : "No visit automation is running."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 min-h-0 flex-1 space-y-6 overflow-y-auto">
            {denied ? (
              <EmptyState
                icon={Lock}
                title="Visit automation is unavailable"
                description="You need Front Desk permission to review these runs. Ask an administrator if you need access."
                className="px-2 py-10"
                data-testid="member-visit-automation-denied"
              />
            ) : runs.length === 0 ? (
              <p className="text-sm text-dash-muted">
                Start one from the membership search on Clients.
              </p>
            ) : (
              (running ? active : runs.slice(0, 1)).map((run) => (
                <section key={run.uuid} className="space-y-3">
                  <p className="text-xs font-medium tracking-[0.08em] text-dash-muted uppercase">
                    {run.payer_code} · {run.completed} of {run.total} completed
                  </p>
                  <ul className="divide-y divide-dash-border/80">
                    {run.items.map((item) => (
                      <li key={item.uuid} className="py-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 text-sm font-medium text-brand-navy">
                            {item.customer_name || item.query}
                          </p>
                          {item.customer_uuid ? (
                            <Link
                              href={ROUTES.customerDetail(item.customer_uuid)}
                              onClick={() => setOpen(false)}
                              className="shrink-0 text-xs text-dash-muted hover:text-brand-navy"
                            >
                              View client
                            </Link>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-dash-muted">
                          {item.status_label}
                          {item.message && item.message !== item.status_label
                            ? ` · ${item.message}`
                            : ""}
                        </p>
                        {item.error_message ? (
                          <p className="mt-1 text-xs text-destructive">
                            {item.error_message}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
