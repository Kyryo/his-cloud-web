import { blogCmsError, withBlogCmsAuth } from "@/lib/server/blog-cms-bff";
import { bffSuccess } from "@/lib/server/bff-response";
import {
  getBlogSettingsAdmin,
  saveBlogSettingsAdmin,
} from "@/features/platform-admin/services/blog-cms.server";
import type { BlogSiteSettings } from "@/features/platform-admin/types/blog.types";

export async function GET() {
  const auth = await withBlogCmsAuth();
  if ("error" in auth) {
    return auth.error;
  }
  try {
    const settings = await getBlogSettingsAdmin(auth.accessToken);
    return bffSuccess(settings);
  } catch (error) {
    return blogCmsError(error);
  }
}

export async function PUT(request: Request) {
  const auth = await withBlogCmsAuth();
  if ("error" in auth) {
    return auth.error;
  }
  try {
    const body = (await request.json()) as BlogSiteSettings;
    const settings = await saveBlogSettingsAdmin(auth.accessToken, body);
    return bffSuccess(settings);
  } catch (error) {
    return blogCmsError(error);
  }
}
