"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppAlertBanner } from "@/components/ui/app-alert-banner";
import { ROUTES } from "@/constants/routes";
import { useOnboardingProgress } from "@/features/overview/hooks/use-onboarding-progress";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";

const MESSAGE = "Finish setting up your clinic";
const BANNER_MS = 200;

export function WorkspaceSetupBanner() {
  const router = useRouter();
  const { userData } = useUser();
  const { mode, setDismissed } = useOnboardingProgress(Boolean(userData?.is_admin));
  const open = mode === "resume";
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = window.requestAnimationFrame(() => setShown(true));
      return () => window.cancelAnimationFrame(frame);
    }

    setShown(false);
    const timer = window.setTimeout(() => setMounted(false), BANNER_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
        shown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <AppAlertBanner
          variant="warning"
          message={MESSAGE}
          testId="workspace-setup-banner"
          onClick={() => {
            void setDismissed(false).then(() => {
              router.push(ROUTES.overview);
            });
          }}
        />
      </div>
    </div>
  );
}
