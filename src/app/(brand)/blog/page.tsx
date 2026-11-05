import type { Metadata } from "next";

import { siteConfig } from "@/constants/site";
import { BrandBlogListingPage } from "@/features/brand/blog/pages/BrandBlogListingPage";
import { getPublicBlogSettings } from "@/features/brand/blog/services/public-blog.server";

type PageProps = {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicBlogSettings();
  const title = settings.title
    ? `${settings.title} | Sigma Health`
    : "Blog | Sigma Health";
  const description =
    settings.description ||
    "Product notes, guides, and clinic stories from Sigma Health.";
  const url = `${siteConfig.url}/blog`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": `${siteConfig.url}/blog/feed.xml`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: settings.open_graph_image_url
        ? [{ url: settings.open_graph_image_url }]
        : undefined,
    },
  };
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  return <BrandBlogListingPage searchParams={params} />;
}
