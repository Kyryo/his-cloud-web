import type { Metadata } from "next";

import { siteConfig } from "@/constants/site";
import { BrandCompanyPage } from "@/features/brand/pages/BrandCompanyPage";

export const metadata: Metadata = {
  title: "Company | Sigma Health",
  description:
    "Healthcare software shouldn't create more work. Learn why Sigma exists and how we help clinics close the gaps between care and payment.",
  alternates: {
    canonical: `${siteConfig.url}/company`,
  },
  openGraph: {
    title: "Company | Sigma Health",
    description:
      "Healthcare software shouldn't create more work. Learn why Sigma exists and how we help clinics close the gaps between care and payment.",
    url: `${siteConfig.url}/company`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function Page() {
  return <BrandCompanyPage />;
}
