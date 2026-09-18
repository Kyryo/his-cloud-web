import { NextResponse } from "next/server";

import { LABORATORY_API_PATHS } from "@/constants/laboratory-api";
import { bffError } from "@/lib/server/bff-response";
import { hmisApiBinaryRequest } from "@/lib/server/hmis-api-binary";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const file = await hmisApiBinaryRequest(LABORATORY_API_PATHS.reportPdf(uuid), {
      token: auth.accessToken,
    });

    return new NextResponse(file.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          file.filename && file.filename !== "report.csv"
            ? `inline; filename="${file.filename}"`
            : `inline; filename="lab-report-${uuid}.pdf"`,
      },
    });
  } catch (error) {
    return bffError(error);
  }
}
