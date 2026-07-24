import type { Metadata } from "next";

import { siteConfig } from "@/constants/site";
import { BrandCompanyPage } from "@/features/brand/pages/BrandCompanyPage";

export const metadata: Metadata = {
  title: "Company | Sigma Health HMIS",
  description:
    "Learn why Sigma Health exists, our mission to simplify clinic operations, what we believe, and how we're building the future of healthcare software.",
  alternates: {
    canonical: `${siteConfig.url}/company`,
  },
  openGraph: {
    title: "Company | Sigma Health HMIS",
    description:
      "Learn why Sigma Health exists, our mission to simplify clinic operations, what we believe, and how we're building the future of healthcare software.",
    url: `${siteConfig.url}/company`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function Page() {
  return <BrandCompanyPage />;
}
