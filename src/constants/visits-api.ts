/** Django DRF v1 visit endpoints (relative to HMIS_API_URL, server-only). */
export const VISITS_API_PATHS = {
  list: "/visits/",
  detail: (uuid: string) => `/visits/${uuid}/`,
  end: (uuid: string) => `/visits/${uuid}/end/`,
  reopen: (uuid: string) => `/visits/${uuid}/reopen/`,
  modeOfPayment: (uuid: string) => `/visits/${uuid}/mode-of-payment/`,
  fromAppointment: (appointmentUuid: string) =>
    `/visits/from-appointment/${appointmentUuid}/`,
  encounters: (uuid: string) => `/visits/${uuid}/encounters/`,
  encounterStart: (visitUuid: string, encounterUuid: string) =>
    `/visits/${visitUuid}/encounters/${encounterUuid}/start/`,
  encounterComplete: (visitUuid: string, encounterUuid: string) =>
    `/visits/${visitUuid}/encounters/${encounterUuid}/complete/`,
  encounterCancel: (visitUuid: string, encounterUuid: string) =>
    `/visits/${visitUuid}/encounters/${encounterUuid}/cancel/`,
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
