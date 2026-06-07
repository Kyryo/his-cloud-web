import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white selection:bg-brand-tint selection:text-brand-navy">
      {children}
    </div>
  );
}
