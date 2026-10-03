import { blogCmsError, withBlogCmsAuth } from "@/lib/server/blog-cms-bff";
import { bffSuccess } from "@/lib/server/bff-response";
import { uploadBlogImageAdmin } from "@/features/platform-admin/services/blog-cms.server";

const FOLDERS = new Set(["covers", "authors", "inline", "settings", "social"]);

export async function POST(request: Request) {
  const auth = await withBlogCmsAuth();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const folderRaw = String(form.get("folder") || "inline");
    if (!(file instanceof File)) {
      return bffSuccess({ message: "file is required." }, 400);
    }
    if (!FOLDERS.has(folderRaw)) {
      return bffSuccess({ message: "Invalid upload folder." }, 400);
    }
    const uploaded = await uploadBlogImageAdmin(
      auth.accessToken,
      file,
      folderRaw as "covers" | "authors" | "inline" | "settings" | "social",
    );
    return bffSuccess(uploaded, 201);
  } catch (error) {
    return blogCmsError(error);
  }
}
