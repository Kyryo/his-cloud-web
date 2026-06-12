import type { ReactNode } from "react";

import { StripSensitiveAuthQueryParams } from "@/features/auth/components/StripSensitiveAuthQueryParams";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white selection:bg-brand-tint selection:text-brand-navy">
      <StripSensitiveAuthQueryParams />
      {children}
    </div>
  );
}
