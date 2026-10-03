import { blogCmsError, withBlogCmsAuth } from "@/lib/server/blog-cms-bff";
import { bffSuccess } from "@/lib/server/bff-response";
import {
  deleteBlogAuthorAdmin,
  listBlogAuthorsAdmin,
  saveBlogAuthorAdmin,
} from "@/features/platform-admin/services/blog-cms.server";
import type { BlogAuthorInput } from "@/features/platform-admin/types/blog.types";

export async function GET() {
  const auth = await withBlogCmsAuth();
  if ("error" in auth) {
    return auth.error;
  }
  try {
    const results = await listBlogAuthorsAdmin(auth.accessToken);
    return bffSuccess({ results, count: results.length });
  } catch (error) {
    return blogCmsError(error);
  }
}

export async function POST(request: Request) {
  const auth = await withBlogCmsAuth();
  if ("error" in auth) {
    return auth.error;
  }
  try {
    const body = (await request.json()) as BlogAuthorInput & { id?: string };
    const { id, ...input } = body;
    const saved = await saveBlogAuthorAdmin(auth.accessToken, input, id);
    return bffSuccess(saved, id ? 200 : 201);
  } catch (error) {
    return blogCmsError(error);
  }
}

export async function DELETE(request: Request) {
  const auth = await withBlogCmsAuth();
  if ("error" in auth) {
    return auth.error;
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return bffSuccess({ message: "id is required." }, 400);
    }
    await deleteBlogAuthorAdmin(auth.accessToken, id);
    return bffSuccess({ ok: true });
  } catch (error) {
    return blogCmsError(error);
  }
}
