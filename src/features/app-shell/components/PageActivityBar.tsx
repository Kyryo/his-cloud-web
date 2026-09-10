"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useHasRegisteredPageActivity } from "@/features/app-shell/stores/page-activity.store";
import {
  getDocumentLocationKey,
  getSameDocumentNavigationHref,
} from "@/features/app-shell/utils/same-document-navigation";
import { cn } from "@/lib/utils";

export function PageActivityBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationKey = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [seenLocation, setSeenLocation] = useState(locationKey);
  const hasRegisteredActivity = useHasRegisteredPageActivity();

  if (seenLocation !== locationKey) {
    setSeenLocation(locationKey);
    setPendingHref(null);
  }

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const href = getSameDocumentNavigationHref(event.target);
      if (href && href !== getDocumentLocationKey()) {
        setPendingHref(href);
      }
    }

    function handlePopState() {
      setPendingHref("back-forward");
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const active = pendingHref !== null || hasRegisteredActivity;

  if (!active) {
    return null;
  }

  return (
    <div
      data-testid="page-activity-bar"
      role="progressbar"
      aria-label="Page loading"
      aria-valuetext="Loading"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-brand-primary/15",
      )}
    >
      <div className="h-full w-1/3 bg-brand-primary shadow-[0_0_8px] shadow-brand-primary animate-report-progress" />
    </div>
  );
}
