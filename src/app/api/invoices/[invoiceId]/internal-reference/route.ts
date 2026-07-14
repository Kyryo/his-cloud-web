import { INVOICES_API_PATHS } from "@/constants/invoices-api";
import { updateInvoiceInternalReferenceSchema } from "@/features/invoices/schemas/internal-reference.schema";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ invoiceId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const parsed = await parseJsonBody(
      request,
      updateInvoiceInternalReferenceSchema,
    );
    if ("error" in parsed) {
      return parsed.error;
    }

    const { invoiceId } = await context.params;
    const invoice = await hmisApiRequest<Invoice>(
      INVOICES_API_PATHS.internalReference(invoiceId),
      {
        method: "PATCH",
        token: auth.accessToken,
        body: parsed.data,
      },
    );

    return bffSuccess(invoice);
  } catch (error) {
    return bffError(error);
  }
}
