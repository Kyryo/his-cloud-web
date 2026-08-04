import type { ReactNode } from "react";

import { StripSensitiveAuthQueryParams } from "@/features/auth/components/StripSensitiveAuthQueryParams";
import { ToastProvider } from "@/providers/toast-provider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f6f9] selection:bg-brand-tint selection:text-brand-navy">
      <StripSensitiveAuthQueryParams />
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}
