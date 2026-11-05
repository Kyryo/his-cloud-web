import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/constants/site";
import { BrandBlogArticlePage } from "@/features/brand/blog/pages/BrandBlogArticlePage";
import {
  getPublicBlogPost,
  getPublicBlogSettings,
} from "@/features/brand/blog/services/public-blog.server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getPublicBlogPost(slug),
    getPublicBlogSettings(),
  ]);

  if (!post) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }

  const title = post.seo_title || post.title;
  const description =
    post.seo_description ||
    post.excerpt ||
    settings.description ||
    post.title;
  const canonical = post.canonical_url || `${siteConfig.url}${ROUTES.blogPost(post.slug)}`;
  const image =
    post.social_image_url ||
    post.main_image_url ||
    settings.open_graph_image_url ||
    undefined;

  return {
    title: `${title} | Sigma Health`,
    description,
    robots: post.noindex ? { index: false, follow: false } : undefined,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || post.published_at || undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublicBlogPost(slug);
  if (!post) {
    notFound();
  }
  if (post.redirect_to && post.redirect_to !== slug) {
    permanentRedirect(ROUTES.blogPost(post.redirect_to));
  }
  return <BrandBlogArticlePage slug={slug} />;
}
