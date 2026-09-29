import { HMIS_API_URL } from "@/constants/api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { HmisApiError } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function ohComplianceExtractHandler(extractPath: string) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    if (!HMIS_API_URL) {
      throw new HmisApiError("HMIS_API_URL is not configured on the server.");
    }

    const response = await fetch(`${HMIS_API_URL}${extractPath}`, {
      method: "POST",
      headers: {
        accept: "text/csv, application/json",
        Authorization: `Bearer ${auth.accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      let message = "Compliance extract failed.";
      try {
        const json = (await response.json()) as { message?: string; detail?: string };
        message = json.message ?? json.detail ?? message;
      } catch {
        // ignore
      }
      throw new HmisApiError(message, response.status);
    }

    const csvText = await response.text();
    const disposition =
      response.headers.get("Content-Disposition") ??
      'attachment; filename="oh-compliance.csv"';

    return new Response(csvText, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": disposition,
      },
    });
  } catch (error) {
    return bffError(error);
  }
}

export async function ohComplianceDashboardHandler(dashboardPath: string) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { hmisApiRequest } = await import("@/lib/server/hmis-api");
    const data = await hmisApiRequest<Record<string, number>>(dashboardPath, {
      token: auth.accessToken,
    });
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function ohCampaignQueueHandler(queuePath: string) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { hmisApiRequest } = await import("@/lib/server/hmis-api");
    const data = await hmisApiRequest<unknown[]>(queuePath, {
      token: auth.accessToken,
    });
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function ohHrFitnessHandler(
  fitnessPath: string,
  request: Request,
) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const query = new URL(request.url).search;
    const { hmisApiRequest } = await import("@/lib/server/hmis-api");
    const data = await hmisApiRequest<unknown[]>(`${fitnessPath}${query}`, {
      token: auth.accessToken,
    });
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function ohStatutoryPackHandler(
  packPath: string,
) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { hmisApiRequest } = await import("@/lib/server/hmis-api");
    const data = await hmisApiRequest<Record<string, unknown>>(packPath, {
      token: auth.accessToken,
    });
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function ohProxyPostHandler(
  apiPath: string,
  request: Request,
  successStatus = 200,
) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { hmisApiRequest } = await import("@/lib/server/hmis-api");
    const data = await hmisApiRequest<unknown>(apiPath, {
      method: "POST",
      token: auth.accessToken,
      body,
    });
    return bffSuccess(data, successStatus);
  } catch (error) {
    return bffError(error);
  }
}
