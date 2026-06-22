import { ROUTES } from "@/constants/routes";

export const LANDING_PROBLEM = {
  eyebrow: "The problem",
  title: "Paper records are costing you more than you think",
  description:
    "If any of these sound like your clinic, you're losing revenue, time, and sometimes patient outcomes — every single day.",
  items: [
    {
      title: "Patient records that disappear",
      description:
        "Notebooks get lost, damaged, or filled up. When a patient returns, you're starting from scratch.",
    },
    {
      title: "An HMIS you can't actually use",
      description:
        "You bought software once. It crashed, needed constant IT support, or your staff quietly went back to paper.",
    },
    {
      title: "Billing errors you catch too late",
      description:
        "Manual invoicing means missed charges, duplicate entries, and patients disputing bills at the door.",
    },
    {
      title: "Stock-outs nobody saw coming",
      description:
        "Your pharmacy runs out of essentials because no one knows what's actually on the shelf in real time.",
    },
    {
      title: "Donor reports that eat a full week",
      description:
        "Pulling together data for MOH submissions or donor reports means days of manual spreadsheet work.",
    },
    {
      title: "No visibility into what's really happening",
      description:
        "You can't see which services are profitable, which staff are overloaded, or how many patients returned.",
    },
  ],
} as const;

export const LANDING_FEATURES = {
  eyebrow: "What you get",
  title: "Everything your clinic needs. Nothing it doesn't.",
  description:
    "Sigma replaces your registers, billing book, pharmacy logbook, and reporting spreadsheets — in one place, accessible from any browser.",
  items: [
    {
      title: "Patient records & visit history",
      description:
        "Every patient gets a permanent digital file — diagnoses, prescriptions, lab results, visit notes. Searchable in seconds, accessible from any device in your clinic.",
    },
    {
      title: "Billing & payments",
      description:
        "Auto-generate invoices at discharge. Track cash, mobile money, and insurance payments. See outstanding balances at a glance. No more end-of-day reconciliation surprises.",
    },
    {
      title: "Pharmacy & inventory",
      description:
        "Know exactly what's in stock. Get low-stock alerts before you run out. Track dispensing linked directly to patient visits so nothing falls through the cracks.",
    },
    {
      title: "Appointments & queuing",
      description:
        "Replace the paper waiting list with a digital queue. Patients check in, staff see who's next, and no one waits three hours wondering where they are.",
    },
    {
      title: "Reports & MOH submissions",
      description:
        "Generate your DHIS2, MOH, or donor reports in one click. The data is already there — Sigma just formats it the way each form requires.",
    },
    {
      title: "Role-based access & audit logs",
      description:
        "Receptionists see what they need. Doctors see what they need. Administrators see everything. Every action is logged, so accountability isn't just a policy — it's built in.",
    },
  ],
} as const;

export const LANDING_HOW_IT_WORKS = {
  eyebrow: "How it works",
  title: "From signup to first patient: under one day",
  description:
    "We've removed every step that typically makes software rollouts fail in under-resourced settings.",
  steps: [
    {
      title: "Sign up and configure your clinic",
      description:
        "Tell us your clinic's name, departments, and services. No forms to fax. No sales calls. Takes about 20 minutes from any browser.",
    },
    {
      title: "We set it up with you — for free",
      description:
        "A Sigma onboarding specialist joins a call with your team, walks through the setup, and answers every question. Included in every plan, in your local language where available.",
    },
    {
      title: "Your staff trains in under two hours",
      description:
        "We designed Sigma for staff who aren't tech-savvy. If they can use WhatsApp, they can use Sigma. Your nurses and receptionists self-train using short in-app guides.",
    },
    {
      title: "See your first results in week one",
      description:
        "Most clinics report fewer billing disputes, shorter patient wait times, and better stock visibility within the first seven days of going live.",
    },
  ],
} as const;

export const LANDING_TESTIMONIALS = {
  eyebrow: "From the field",
  title: "Clinics that made the switch",
  description:
    "These aren't cherry-picked enterprise hospitals. These are clinics like yours.",
  items: [
    {
      quote:
        "We went from three paper registers and constant billing arguments to a clean digital system in one afternoon. My nurses trained themselves. I didn't have to do a thing.",
      initials: "AK",
      name: "Amara K.",
      role: "Clinic administrator, Kampala, Uganda",
    },
    {
      quote:
        "The previous system we tried needed a technician every two weeks. Sigma just works. Our internet isn't great and it still loads fine. We haven't called support once.",
      initials: "RP",
      name: "Dr. R. Patel",
      role: "Medical director, Lusaka, Zambia",
    },
    {
      quote:
        "Donor reporting used to take my team five days every quarter. Now I export it in about ten minutes. That time goes back to seeing patients.",
      initials: "MN",
      name: "Marie N.",
      role: "Executive director, Lusaka, Zambia",
    },
    {
      quote:
        "We are a small clinic with 4 staff. I was afraid it would be too complicated. But everything is simple and we got help in Swahili during setup. Very happy.",
      initials: "JM",
      name: "Jane M.",
      role: "Clinic owner, Mombasa, Kenya",
    },
  ],
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
      cta: "Get started",
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
      cta: "Start free trial",
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
      cta: "Talk to us",
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
        "Sigma is cloud-based and works on any connection — including slow 3G. Most clinic workflows use very little data. We're also building offline capability, which will be available to all existing customers when it launches.",
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
  title: "Your clinic deserves software that actually works here",
  description:
    "Join 200+ clinics across Africa, Asia, and the Americas who replaced paper chaos with a system built for their reality — not someone else's.",
  primaryCta: { label: "Start your free 30-day trial", href: ROUTES.signup },
  secondaryCta: { label: "Book a demo call", href: ROUTES.contacts },
} as const;
