import { ROUTES } from "@/constants/routes";

export type BrandNavChild = {
  name: string;
  href: string;
  description?: string;
};

export type BrandNavSection = {
  title: string;
  items: readonly BrandNavChild[];
};

export type BrandNavItem =
  | {
      kind: "link";
      name: string;
      href: string;
    }
  | {
      kind: "menu";
      name: string;
      href: string;
      sections: readonly BrandNavSection[];
      featured?: BrandNavSection;
    };

export const BRAND_NAV_ITEMS = [
  {
    kind: "menu",
    name: "Solutions",
    href: ROUTES.solutions,
    sections: [
      {
        title: "For your clinic",
        items: [
          {
            name: "Billing",
            href: ROUTES.solutionsBilling,
            description: "Visit-linked invoices and patient balances",
          },
          {
            name: "Claims",
            href: ROUTES.solutionsClaims,
            description: "Prepare, submit, and follow every claim",
          },
          {
            name: "Payments",
            href: ROUTES.solutionsPayments,
            description: "Match remittances back to the visit",
          },
        ],
      },
    ],
    featured: {
      title: "Overview",
      items: [
        {
          name: "All solutions",
          href: ROUTES.solutions,
          description: "How billing, claims, and payments connect",
        },
        {
          name: "Talk to sales",
          href: ROUTES.pricing,
          description: "Pricing for your clinic",
        },
      ],
    },
  },
  {
    kind: "link",
    name: "Pricing",
    href: ROUTES.pricing,
  },
  {
    kind: "menu",
    name: "About",
    href: ROUTES.about,
    sections: [
      {
        title: "Company",
        items: [
          {
            name: "About Sigma",
            href: ROUTES.about,
            description: "Why we built Sigma for clinic revenue",
          },
          {
            name: "Company",
            href: ROUTES.company,
            description: "Our story and the clinics we serve",
          },
          {
            name: "Contact",
            href: ROUTES.contacts,
            description: "Reach the team for a walkthrough",
          },
        ],
      },
    ],
    featured: {
      title: "Legal",
      items: [
        {
          name: "Privacy",
          href: ROUTES.privacy,
          description: "How we handle clinic and patient data",
        },
        {
          name: "Terms of Service",
          href: ROUTES.terms,
          description: "The agreement for using Sigma",
        },
      ],
    },
  },
  {
    kind: "link",
    name: "Contact",
    href: ROUTES.contacts,
  },
] as const satisfies readonly BrandNavItem[];

export function getMenuChildLinks(
  item: Extract<BrandNavItem, { kind: "menu" }>,
) {
  const featured = item.featured?.items ?? [];
  return [...item.sections.flatMap((section) => section.items), ...featured];
}
