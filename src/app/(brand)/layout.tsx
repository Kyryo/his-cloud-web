import type { ReactNode } from "react";

export default function BrandLayout({ children }: { children: ReactNode }) {
  return <div data-brand-page>{children}</div>;
}
