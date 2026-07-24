import type { Metadata } from "next";

import { siteConfig } from "@/constants/site";
import { BrandPrivacyPage } from "@/features/brand/pages/BrandPrivacyPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Sigma Health HMIS",
  description:
    "Learn how Sigma Health collects, uses, protects, and handles your clinical and organizational data in accordance with strict global healthcare security standards.",
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | Sigma Health HMIS",
    description:
      "Learn how Sigma Health collects, uses, protects, and handles your clinical and organizational data in accordance with strict global healthcare security standards.",
    url: `${siteConfig.url}/privacy`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function Page() {
  return <BrandPrivacyPage />;
}
