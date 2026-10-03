import { blogCmsError, withBlogCmsAuth } from "@/lib/server/blog-cms-bff";
import { bffSuccess } from "@/lib/server/bff-response";
import {
  getBlogCmsStats,
  listBlogPostsAdmin,
} from "@/features/platform-admin/services/blog-cms.server";

export async function GET(request: Request) {
  const auth = await withBlogCmsAuth();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("stats") === "1") {
      const stats = await getBlogCmsStats(auth.accessToken);
      return bffSuccess(stats);
    }
    const posts = await listBlogPostsAdmin(auth.accessToken, {
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    });
    return bffSuccess({ results: posts, count: posts.length });
  } catch (error) {
    return blogCmsError(error);
  }
}
