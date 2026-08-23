import type { ReactNode } from "react";

import { StripSensitiveAuthQueryParams } from "@/features/auth/components/StripSensitiveAuthQueryParams";
import { landingBody, landingDisplay } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/providers/toast-provider";

/** Sign-in and onboarding. Served on the app host when host routing is on. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        landingDisplay.variable,
        landingBody.variable,
        landingBody.className,
        "min-h-screen bg-white selection:bg-brand-tint selection:text-brand-navy",
      )}
    >
      <StripSensitiveAuthQueryParams />
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}
