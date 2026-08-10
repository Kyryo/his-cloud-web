import { ROUTES } from "@/constants/routes";

export const LANDING_PROBLEM = {
  title: "Your clinic treated the patient.\nDid you collect what you earned?",
  description:
    "Every patient visit should end with revenue in your clinic's account. Instead, money gets stuck between billing, insurance claims, payment reconciliation, and manual follow-up. By the time someone notices, the opportunity to recover it is often gone.",
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
  title: "Follow everything from patient visit to payment.",
  description:
    "Sigma connects billing, insurance claims, and payments into one continuous workflow, so your team always knows what has been billed, what has been paid, and what still needs attention.",
  items: [
    {
      title: "Submit cleaner claims",
      description:
        "Built-in billing rules help your team avoid common mistakes before claims leave your clinic.",
    },
    {
      title: "Track every claim",
      description:
        "See exactly where each claim is—submitted, approved, rejected, paid, or waiting for action.",
    },
    {
      title: "Match every payment",
      description:
        "Every payment is linked back to the patient visit and claim it belongs to, making reconciliation simple.",
    },
  ],
} as const;

export const LANDING_COMPARISON = {
  title: "Stop chasing insurance payments",
  before: {
    label: "Before",
    items: [
      "Did we bill this patient?",
      "Did we submit the claim?",
      "Why was it rejected?",
      "Has the insurer paid?",
      "Which payments are still missing?",
    ],
  },
  after: {
    label: "After",
    items: [
      "Every patient has been billed.",
      "Every claim has a status.",
      "Every payment has a source.",
      "Every outstanding balance is visible.",
      "Everyone knows what needs attention next.",
    ],
  },
} as const;

export const LANDING_REVENUE = {
  title: "Know where your money stands at any moment.",
  description:
    "Stop waiting for someone to compile spreadsheets. See what you've billed, what insurers owe, what has been paid, and where revenue is getting stuck.",
  items: [
    "Revenue billed",
    "Claims awaiting payment",
    "Rejected claims",
    "Payments received",
    "Outstanding insurer balances",
    "Revenue collected",
  ],
} as const;

export const LANDING_WHY_SIGMA = {
  eyebrow: "Why Sigma",
  title: "Most clinic systems stop after creating the invoice.",
  paragraphs: [
    "They record the patient visit.",
    "They generate the bill.",
    "Then they leave your team to manage claims, insurer payments, and reconciliation using spreadsheets.",
    "Sigma follows the money all the way to payment, so every claim, every payment, and every outstanding balance stays connected.",
  ],
  closing:
    "Because treating the patient isn't enough, you need to get paid too.",
} as const;

export const LANDING_WHY = {
  title: "Collecting revenue shouldn't require an IT department.",
  description:
    "Most healthcare software assumes you have dedicated IT staff and months to implement a new system. Sigma is designed for growing clinics that need to get started quickly, train staff easily, and focus on patients—not infrastructure.",
  items: [
    {
      title: "No servers to maintain",
      description:
        "Access Sigma securely from any modern browser.",
    },
    {
      title: "No lengthy implementation",
      description:
        "Most clinics are ready within hours, not months.",
    },
    {
      title: "No disconnected spreadsheets",
      description:
        "Billing, claims, and payments stay connected automatically.",
    },
    {
      title: "No guessing where your money went",
      description:
        "Every claim and payment stays linked from beginning to end.",
    },
  ],
} as const;

/** @deprecated Kept for any remaining references during migration */
export const LANDING_TRUST = LANDING_WHY;

/** @deprecated Kept for any remaining references during migration */
export const LANDING_FEATURES = {
  title: LANDING_COMPARISON.title,
  description: LANDING_SOLUTION.description,
  closing: LANDING_WHY_SIGMA.closing,
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

export type LandingFaqItem = {
  question: string;
  answer?: string;
  answerTitle?: string;
  answerParagraphs?: readonly string[];
  answerBullets?: readonly string[];
};

export const LANDING_FAQ = {
  eyebrow: "Common questions",
  title: "Things clinics usually ask us",
  items: [
    {
      question: "Do we need an IT team?",
      answerTitle: "No.",
      answerParagraphs: [
        "Sigma is built for clinic staff, not technical specialists. Most teams become comfortable using it within a few hours, and most clinics are up and running in less than a day.",
      ],
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
    {
      question:
        "Our insurer already has a claims system. Why do we need Sigma?",
      answerTitle: "You still need a source of truth.",
      answerParagraphs: [
        "The insurer's claims portal is designed to receive claims. Sigma is the system that creates, tracks, and reconciles them.",
        "When Sigma submits a claim through its integration, the insurer sends back an electronic response confirming what happened. That response might tell you the claim was received or not. Sigma stores these responses alongside the original claim, creating a complete history.",
        "Imagine you submit a claim worth 500,000, but the insurer only pays 420,000. Or they tell you they never received the claim.",
        "If you submitted the claim manually through the insurer's portal, you may have little or no record of what was sent or how the insurer responded.",
        "This gives your finance team a clear audit trail and the evidence they need when following up with insurers. Instead of saying, \"We think we submitted this claim,\" they can confidently say, \"Here is the claim, here is the insurer's response, and here is the difference that still needs to be resolved.\"",
      ],
      answerBullets: [],
    },
  ] satisfies readonly LandingFaqItem[],
};

export const LANDING_FINAL_CTA = {
  title: "You've already earned the revenue.\nNow make sure you collect it.",
  description:
    "Start tracking every claim, payment, and outstanding balance with Sigma.",
  primaryCta: { label: "Start Free", href: ROUTES.signup },
  secondaryCta: { label: "Book a Demo", href: ROUTES.contacts },
} as const;
