/** Server-only Django DRF base URL. Never expose to the browser. */
export const HMIS_API_URL = process.env.HMIS_API_URL;

/** Browser-facing BFF auth routes (same origin). */
export const BFF_AUTH_ROUTES = {
  session: "/api/auth/session",
  signinRequestOtp: "/api/auth/signin/request-otp",
  signinVerify: "/api/auth/signin/verify",
  signupRequestOtp: "/api/auth/signup/request-otp",
  signupVerify: "/api/auth/signup/verify",
  refresh: "/api/auth/refresh",
  logout: "/api/auth/logout",
  me: "/api/auth/me",
} as const;

/** Browser-facing BFF customer routes (same origin). */
export const BFF_CUSTOMERS_ROUTES = {
  list: "/api/customers",
  detail: (uuid: string) => `/api/customers/${uuid}`,
  insurance: (uuid: string) => `/api/customers/${uuid}/insurance`,
  insuranceDetail: (customerUuid: string, insuranceUuid: string) =>
    `/api/customers/${customerUuid}/insurance/${insuranceUuid}`,
  billing: (uuid: string) => `/api/customers/${uuid}/billing`,
  visits: (uuid: string) => `/api/customers/${uuid}/visits`,
} as const;

/** Browser-facing BFF insurance catalog routes (same origin). */
export const BFF_INSURANCE_ROUTES = {
  schemes: "/api/insurance-schemes",
} as const;

/** Browser-facing BFF customer address routes (same origin). */
export const BFF_CUSTOMER_ADDRESSES_ROUTES = {
  list: "/api/customer-addresses",
  detail: (uuid: string) => `/api/customer-addresses/${uuid}`,
} as const;

/** Browser-facing BFF customer note routes (same origin). */
export const BFF_CUSTOMER_NOTES_ROUTES = {
  list: "/api/customer-notes",
  detail: (uuid: string) => `/api/customer-notes/${uuid}`,
} as const;

/** Browser-facing BFF customer encounter routes (same origin). */
export const BFF_CUSTOMER_ENCOUNTERS_ROUTES = {
  list: "/api/customer-encounters",
} as const;

/** Browser-facing BFF settings routes (same origin). */
export const BFF_SETTINGS_ROUTES = {
  updateProfile: "/api/auth/me",
  organization: "/api/tenants/current",
  clinics: "/api/clinics",
  locations: "/api/locations",
  visitTypes: "/api/visit-types",
  insuranceCompanies: "/api/insurance-companies",
  insuranceSchemes: "/api/insurance-schemes",
} as const;
