export const ROUTES = {
  home: "/",
  auth: "/auth",
  signup: "/signup",
  onboarding: "/onboarding",
  customers: "/customers",
  /** Default destination after successful sign-in / sign-up. */
  postAuth: "/customers",
  contacts: "/contacts",
  ourProducts: "/our-products",
  about: "/about",
  features: "/features",
  services: "/services",
  customerDetail: (customerId: string) => `/customers/${customerId}`,
  settings: "/settings",
  settingsAccount: "/settings/account",
  settingsOrganization: "/settings/organization",
} as const;

/** Paths served by web-new through the deploy gateway. */
export const WEB_NEW_ROUTE_PREFIXES = [
  ROUTES.home,
  ROUTES.auth,
  ROUTES.signup,
  ROUTES.onboarding,
  ROUTES.customers,
  ROUTES.settings,
  ROUTES.contacts,
  ROUTES.ourProducts,
  ROUTES.about,
  ROUTES.features,
  ROUTES.services,
] as const;

export const PUBLIC_ROUTES = [
  ROUTES.home,
  ROUTES.auth,
  ROUTES.signup,
  ROUTES.contacts,
  ROUTES.ourProducts,
  ROUTES.about,
  ROUTES.features,
  ROUTES.services,
] as const;

export const AUTH_ROUTES = [ROUTES.auth, ROUTES.signup] as const;

export const PROTECTED_ROUTES = [
  ROUTES.onboarding,
  ROUTES.customers,
  ROUTES.settings,
] as const;
