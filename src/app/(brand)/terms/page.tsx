import type { Metadata } from "next";

import { siteConfig } from "@/constants/site";
import { BrandTermsPage } from "@/features/brand/pages/BrandTermsPage";

export const metadata: Metadata = {
  title: "Terms of Service | Sigma Health HMIS",
  description:
    "Read the terms and conditions governing the use of Sigma Health HMIS software, user accounts, service availability, subscription billing, and customer data ownership.",
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
  openGraph: {
    title: "Terms of Service | Sigma Health HMIS",
    description:
      "Read the terms and conditions governing the use of Sigma Health HMIS software, user accounts, service availability, subscription billing, and customer data ownership.",
    url: `${siteConfig.url}/terms`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function Page() {
  return <BrandTermsPage />;
}
