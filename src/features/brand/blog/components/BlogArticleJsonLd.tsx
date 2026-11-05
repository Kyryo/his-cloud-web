import type { PublicBlogPost } from "@/features/brand/blog/types";
import { siteConfig } from "@/constants/site";
import { ROUTES } from "@/constants/routes";

type BlogArticleJsonLdProps = {
  post: PublicBlogPost;
};

export function BlogArticleJsonLd({ post }: BlogArticleJsonLdProps) {
  const url = post.canonical_url || `${siteConfig.url}${ROUTES.blogPost(post.slug)}`;
  const image = post.social_image_url || post.main_image_url || undefined;
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo_description || post.excerpt || post.title,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || post.published_at || undefined,
    mainEntityOfPage: url,
    url,
    image: image ? [image] : undefined,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
