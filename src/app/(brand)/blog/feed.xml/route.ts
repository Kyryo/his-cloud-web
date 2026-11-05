import { siteConfig } from "@/constants/site";
import {
  getPublicBlogSettings,
  listIndexablePublicBlogPosts,
} from "@/features/brand/blog/services/public-blog.server";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const [settings, posts] = await Promise.all([
    getPublicBlogSettings(),
    listIndexablePublicBlogPosts(),
  ]);
  const siteUrl = siteConfig.url.replace(/\/$/, "");
  const title = escapeXml(settings.title || "Sigma Health Blog");
  const description = escapeXml(
    settings.description ||
      "Product notes, guides, and clinic stories from Sigma Health.",
  );
  const items = posts
    .slice(0, 50)
    .map((post) => {
      const url = escapeXml(`${siteUrl}/blog/${post.slug}`);
      const summary = escapeXml(
        post.seo_description || post.excerpt || post.title,
      );
      const published = post.published_at
        ? new Date(post.published_at).toUTCString()
        : "";
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      ${published ? `<pubDate>${published}</pubDate>` : ""}
      <description>${summary}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${title}</title>
    <link>${escapeXml(`${siteUrl}/blog`)}</link>
    <description>${description}</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
