/** Django DRF v1 visit endpoints (relative to HMIS_API_URL, server-only). */
export const VISITS_API_PATHS = {
  list: "/visits/",
  detail: (uuid: string) => `/visits/${uuid}/`,
  visitDetails: (uuid: string) => `/visit-details/${uuid}/`,
  end: (uuid: string) => `/visits/${uuid}/end/`,
  customerVisits: (customerUuid: string, query?: { limit?: number }) => {
    const params = new URLSearchParams({
      customer_uuid: customerUuid,
    });

    if (query?.limit) {
      params.set("limit", String(query.limit));
    }

    return `/visits/customer-visits/?${params.toString()}`;
  },
} as const;
