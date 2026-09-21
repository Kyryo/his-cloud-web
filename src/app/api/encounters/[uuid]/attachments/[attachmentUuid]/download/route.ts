import { NextResponse } from "next/server";

import { VISITS_API_PATHS } from "@/constants/visits-api";
import { bffError } from "@/lib/server/bff-response";
import { hmisApiBinaryRequest } from "@/lib/server/hmis-api-binary";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string; attachmentUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid, attachmentUuid } = await context.params;
    const file = await hmisApiBinaryRequest(
      VISITS_API_PATHS.encounterAttachmentDownload(uuid, attachmentUuid),
      { token: auth.accessToken },
    );

    const filename =
      file.filename && file.filename !== "report.csv"
        ? file.filename
        : "attachment.pdf";

    return new NextResponse(file.body, {
      status: 200,
      headers: {
        "Content-Type": file.contentType || "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return bffError(error);
  }
}
