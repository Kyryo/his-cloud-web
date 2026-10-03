import { blogCmsError, withBlogCmsAuth } from "@/lib/server/blog-cms-bff";
import { bffSuccess } from "@/lib/server/bff-response";
import {
  getBlogPostAdmin,
  saveBlogPostAdmin,
  deleteBlogPostAdmin,
} from "@/features/platform-admin/services/blog-cms.server";
import type { BlogPostInput } from "@/features/platform-admin/types/blog.types";

type Params = { params: Promise<{ postId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await withBlogCmsAuth();
  if ("error" in auth) {
    return auth.error;
  }
  try {
    const { postId } = await params;
    if (postId === "new") {
      return bffSuccess(null);
    }
    const post = await getBlogPostAdmin(auth.accessToken, postId);
    return bffSuccess(post);
  } catch (error) {
    return blogCmsError(error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await withBlogCmsAuth();
  if ("error" in auth) {
    return auth.error;
  }
  try {
    const { postId } = await params;
    const body = (await request.json()) as BlogPostInput;
    const saved = await saveBlogPostAdmin(
      auth.accessToken,
      body,
      postId === "new" ? undefined : postId,
    );
    return bffSuccess(saved, postId === "new" ? 201 : 200);
  } catch (error) {
    return blogCmsError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await withBlogCmsAuth();
  if ("error" in auth) {
    return auth.error;
  }
  try {
    const { postId } = await params;
    await deleteBlogPostAdmin(auth.accessToken, postId);
    return bffSuccess({ ok: true });
  } catch (error) {
    return blogCmsError(error);
  }
}
