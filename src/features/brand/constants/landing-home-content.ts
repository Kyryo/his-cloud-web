import { ROUTES } from "@/constants/routes";

export const LANDING_PROBLEM = {
  title: "Your clinic did the work. Did you get paid?",
  description:
    "Every patient visit creates revenue, but too often that revenue gets stuck between billing, insurance submissions, and payment reconciliation.",
  items: [
    {
      title: "Claims get rejected",
      description:
        "Claims are rejected because billing rules were missed.",
    },
    {
      title: "Payments lose their trail",
      description:
        "Payments arrive without a clear link to the original claim.",
    },
    {
      title: "Staff chase spreadsheets",
      description:
        "Staff spend hours checking spreadsheets to find what is outstanding.",
    },
    {
      title: "Managers fly blind",
      description:
        "Managers cannot easily see how much money is pending from insurers.",
    },
  ],
  closing:
    "Every rejected claim and missed payment is revenue your clinic already earned but cannot collect.",
} as const;

export const LANDING_SOLUTION = {
  title: "Know where every claim stands",
  description:
    "Sigma gives your team one place to manage the complete journey from patient billing to payment.",
  items: [
    {
      title: "Create accurate claims",
      description:
        "Billing rules and scheme requirements are built into your workflow, helping your team submit cleaner claims the first time.",
    },
    {
      title: "Track every claim",
      description:
        "Know which claims are submitted, approved, rejected, or waiting for action.",
    },
    {
      title: "Reconcile every payment",
      description:
        "Match insurer payments back to the exact patient visits and claims they belong to.",
    },
  ],
} as const;

export const LANDING_COMPARISON = {
  title: "Stop chasing insurance payments",
  before: {
    label: "Before Sigma",
    items: [
      "Did we submit this claim?",
      "Why was it rejected?",
      "Has the insurer paid?",
      "Which invoices are still outstanding?",
    ],
  },
  after: {
    label: "With Sigma",
    items: [
      "Every claim has a status",
      "Every payment has a source",
      "Every outstanding amount is visible",
      "Your team knows what needs attention",
    ],
  },
} as const;

export const LANDING_REVENUE = {
  title: "Your clinic's financial health, at a glance",
  description: "See the numbers that matter without waiting for a report.",
  items: [
    "Total billed revenue",
    "Claims submitted",
    "Claims awaiting payment",
    "Rejected claims requiring action",
    "Payments received",
    "Outstanding insurer balances",
  ],
  closing:
    "No more waiting for someone to compile reports. Sigma gives you the information you need, when you need it.",
} as const;

export const LANDING_WHY = {
  title: "Built for clinics, not IT departments",
  description:
    "Most clinic software is built for large hospitals with dedicated IT teams. Sigma is built for clinics that need to start quickly and run without infrastructure headaches.",
  items: [
    {
      title: "No servers to maintain",
      description: "Works from any browser. No clinic IT stack required.",
    },
    {
      title: "No complex setup",
      description: "Get running quickly without a lengthy implementation project.",
    },
    {
      title: "No spreadsheets to manage billing",
      description: "Claims, payments, and balances stay in one system.",
    },
    {
      title: "No guessing where your money went",
      description: "Every claim and payment stays linked and visible.",
    },
  ],
} as const;

/** @deprecated Kept for any remaining references during migration */
export const LANDING_TRUST = LANDING_WHY;

/** @deprecated Kept for any remaining references during migration */
export const LANDING_FEATURES = {
  title: LANDING_COMPARISON.title,
  description: LANDING_SOLUTION.description,
  closing: LANDING_REVENUE.closing,
  rows: [],
  items: [],
} as const;

/** @deprecated Kept for any remaining references during migration */
export const LANDING_HOW_IT_WORKS = {
  title: "How it works",
  steps: [],
} as const;

export const LANDING_PRICING = {
  eyebrow: "Pricing",
  title: "Priced so the clinics that need it most can actually afford it.",
  description:
    "We also offer subsidised access for public-sector facilities and NGO-run clinics.",
  plans: [
    {
      name: "Starter",
      price: "$29",
      period: "per month",
      features: [
        "Up to 3 staff accounts",
        "Patient records & visits",
        "Basic billing",
        "Email support",
      ],
      cta: "Start for free",
      href: ROUTES.signup,
      highlighted: false,
    },
    {
      name: "Clinic",
      price: "$79",
      period: "per month",
      badge: "Most popular",
      features: [
        "Unlimited staff accounts",
        "Full EMR + billing + pharmacy",
        "MOH & donor reporting",
        "Free onboarding call",
        "WhatsApp support",
      ],
      cta: "Start for free",
      href: ROUTES.signup,
      highlighted: true,
    },
    {
      name: "Network",
      price: "Custom",
      period: "multi-site pricing",
      features: [
        "Multiple clinic locations",
        "Centralised reporting",
        "API & DHIS2 integration",
        "Dedicated account manager",
      ],
      cta: "Book a demo",
      href: ROUTES.contacts,
      highlighted: false,
    },
  ],
} as const;

export const LANDING_FAQ = {
  eyebrow: "Common questions",
  title: "Things clinics usually ask us",
  items: [
    {
      question: "Do my staff need to be tech-savvy to use this?",
      answer:
        "No. Sigma is built for clinical staff, not IT staff. If your team uses a smartphone, they can use Sigma. The average staff member is comfortable navigating it within two hours.",
    },
    {
      question: "What if our internet goes down?",
      answer:
        "Sigma is cloud-based and works on any connection, including slow 3G. Most clinic workflows use very little data. We're also building offline capability, which will be available to all existing customers when it launches.",
    },
    {
      question: "We already have paper records going back years. What happens to them?",
      answer:
        "You don't need to digitise everything on day one. Most clinics start by entering new patients digitally, and gradually add historical records over time. We can also help with bulk import if you have existing spreadsheets.",
    },
    {
      question: "Is patient data secure?",
      answer:
        "Yes. Data is encrypted in transit and at rest, stored on servers in your region, and never shared or sold. We are compliant with national health data guidelines in our operating countries.",
    },
    {
      question: "What does the free trial include?",
      answer:
        "Full access to all Clinic plan features for 30 days. No credit card required. Your onboarding call is included. If you decide not to continue, we'll export all your data so you never lose anything.",
    },
  ],
} as const;

export const LANDING_FINAL_CTA = {
  title: "Stop losing money after delivering care",
  description: "Start tracking every claim and payment with Sigma.",
  primaryCta: { label: "Start for free", href: ROUTES.signup },
  secondaryCta: { label: "Book a demo", href: ROUTES.contacts },
} as const;
