import { ROUTES } from "@/constants/routes";

export const BRAND_NAV_LINKS = [
  { name: "Home", href: ROUTES.home },
  { name: "Products", href: ROUTES.ourProducts },
  { name: "Company", href: ROUTES.company },
] as const;
