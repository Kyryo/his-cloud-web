# web-new Project Tracker

Living document for completed work, standards alignment, and follow-ups.  
**Last updated:** 2026-06-05

---

## Summary

`web-new` is the Next.js 16 (App Router) frontend replacing `web-old`. It currently ships:

- A production-oriented **BFF auth layer** (httpOnly cookies, no JWT in `localStorage`)
- **OTP sign-in / sign-up** flows with shared verification UI
- A **refined marketing home page** (hero, nav, social proof)
- **Customers (Clients) list, detail, and create** behind auth via BFF
- **Brand system** tokens, Bricolage typography, and updated subpages
- **Unit + E2E test scaffolding** (Vitest, Playwright)

The app builds and passes type-check/lint. Post-auth redirect lands on `/customers`. Detail tabs (billing, insurance, visits) and dedup precheck are not ported yet.

---

## Completed Work

### 1. Project foundation

| Item | Details |
|------|---------|
| Stack | Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui primitives |
| Structure | Feature-first under `src/features/` (`auth`, `brand`); thin routes in `src/app/` |
| Route groups | `(brand)` marketing, `(auth)` login/signup/onboarding |
| Deploy config | `output: "standalone"`, optional `NEXT_PUBLIC_ASSET_PREFIX` for gateway routing |
| Env | `HMIS_API_URL` (server-only), documented in `.env.example` |

**Key paths**

```text
src/app/                    # Routes, layouts, BFF route handlers
src/features/auth/          # Login, signup, OTP, onboarding, auth service
src/features/brand/         # Landing + marketing pages/components
src/components/           # Shared UI (verification-code, shadcn)
src/lib/server/             # HMIS API client, cookies, BFF helpers
src/lib/bff-client.ts       # Browser → same-origin /api/auth/*
src/constants/              # routes, brand, session, API paths
tests/                      # Vitest + Playwright
```

---

### 2. Authentication (BFF + httpOnly cookies)

**Problem solved:** Tokens no longer live in `localStorage`; the browser talks only to same-origin BFF routes.

| Layer | Implementation |
|-------|----------------|
| Browser | `bff-client.ts` → `/api/auth/*` with `credentials: "include"` |
| BFF | `src/app/api/auth/**/route.ts` handlers |
| Upstream | `lib/server/hmis-api.ts` → Django DRF at `HMIS_API_URL` |
| Session | httpOnly cookies `hmis_access`, `hmis_refresh` via `lib/server/auth-cookies.ts` |
| Client service | `features/auth/services/auth.service.ts` |

**BFF routes implemented**

- `POST /api/auth/signin/request-otp`
- `POST /api/auth/signin/verify`
- `POST /api/auth/signup/request-otp`
- `POST /api/auth/signup/verify`
- `GET /api/auth/session`
- `GET /api/auth/me`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

**Auth UX**

- Login: credentials → OTP step with anti-enumeration copy (*"If an account exists…"*)
- Sign-up: credentials → profile → OTP
- Shared `AuthOtpStep` + `VerificationCodeInput` (6-digit, shake on error, countdown/resend)
- `maskEmail()` utility for privacy-safe email display
- Login OTP step: no logo, no “verification code sent” banner, no sign-up cross-link (per product spec)
- Post-auth redirect → `/customers`

**Removed / replaced (vs early web-new)**

- Client-side `localStorage` token storage
- Direct browser → Django API calls for auth

---

### 3. Route protection

| Mechanism | Status |
|-----------|--------|
| `src/proxy.ts` | Server-side route redirects (Next.js 16 proxy / middleware) |
| `AuthGuard` | Client-side guard on `(app)` layout (customers area) |

Protected routes: `/customers`, `/customers/*`, `/onboarding`.

Post-auth destination: **`/customers`** (`ROUTES.postAuth`).

---

### 4. Customers feature (Clients)

MVP port from `web-old` using v1 API via BFF.

| Layer | Implementation |
|-------|----------------|
| Routes | `/customers`, `/customers/[customerId]` under `(app)` route group |
| BFF | `GET`/`POST /api/customers`, `GET /api/customers/[uuid]` |
| Upstream | `GET`/`POST /api/v1/customers/` (list/create), `GET /api/v1/customers/{uuid}/` (detail) |
| Client service | `features/customers/services/customers.service.ts` (`fetchCustomers`, `fetchCustomer`, `createCustomer`) |
| UI | List with search, gender/sync filters, pagination, table; create dialog; basic detail profile cards |
| Shared UI | `components/ui/dialog.tsx`, `components/ui/app-buttons.tsx`, `providers/toast-provider.tsx` |

**Not yet ported:** stats cards, detail tabs (billing, insurance, visits, appointments), dedup precheck, insurance on create.

**Note:** Detail URLs use customer `uuid` (v1 lookup), not `patient_uuid`.

---

### 5. Landing page & brand

**Home (`/`)**

- Fixed frosted nav (64px): logo · Home / Products / Company · Sign In + Try Free
- Two-column hero: headline (42px, lh 1.08), subtext, CTAs, micro note with inline SVG check
- Primary CTA reveals *“for 30 Days”* on hover over the CTA block
- Hero image: `/landing/sigma-health-landing-other-img.jpg`
- Floating stat cards on image (desktop only): claims processed, error rate (two-line layout)
- Social proof bar: “Trusted by” partner text marks (`#A0AFC0`) · right-aligned *6 facilities · 3 health networks*
- Staggered `hero-fade-up` animations
- `min-h-[calc(100dvh-4rem)]` hero; page scroll allowed

**Brand system**

| Token | Value |
|-------|-------|
| Navy | `#1E2D40` |
| Primary Blue | `#1565D8` |
| Sky Blue | `#2196F3` |
| Blue Tint | `#E8F1FD` |
| Slate | `#3D5166` |
| Muted | `#6B7E93` |
| Border | `#DDE4ED` |
| Partner mark gray | `#A0AFC0` |

- Fonts: **Bricolage Grotesque** (400/500/600/800) project-wide via `app/layout.tsx`
- Tokens in `globals.css` `@theme` + `constants/brand.ts`
- Theme forced to light (`ThemeProvider forcedTheme="light"`)

**Logo**

- `BRAND_LOGO_SRC = "/second.jpg"` used in nav + login form  
  *(See open items — this may be the wrong asset.)*

**Marketing subpages** (still multi-section scroll pages, not 100vh-constrained)

- `/about`, `/contacts`, `/features`, `/services`, `/our-products`
- Sections updated to brand palette (no indigo gradients / beige backgrounds)
- `Footer`, `StatsSection`, `CaseStudySection`, etc. migrated to brand tokens

**Not on home page** (components exist but are unused on `/`)

- `StatsSection`, `CaseStudySection`, `Footer` — available for future home expansion or subpages

---

### 6. Shared components & utilities

| Component / util | Purpose |
|------------------|---------|
| `VerificationCodeInput` | 6-cell OTP input with focus/error/success states (brand colors) |
| `useOtpInput`, `useCountdown` | OTP input behavior + resend timer |
| `mask-email.ts` | Masks local + domain labels for display |
| `lib/route-matching.ts` | Prefix matching for route guards |
| `lib/security-headers.ts` | Security headers helper (used by proxy) |
| `lib/request-id.ts` | `X-Request-ID` for upstream calls |

---

### 7. Testing

**Unit tests (Vitest)** — `tests/`

| Area | Files |
|------|-------|
| Auth schemas | `login.schema.test.ts`, `signup.schema.test.ts` |
| Auth service | `auth.service.test.ts` |
| BFF / API | `bff-client.test.ts`, `hmis-api.test.ts` |
| OTP components | `use-otp-input.test.ts`, `use-countdown.test.ts`, `format-countdown.test.ts` |
| Utils | `mask-email.test.ts`, `route-matching.test.ts` |

**E2E (Playwright)** — `tests/e2e/auth-otp.spec.ts`

- Sign-in OTP → onboarding
- Sign-up OTP → onboarding
- Protected route redirect when unauthenticated
- Mocked BFF responses via `helpers/auth-mocks.ts`

**Commands**

```bash
npm run test          # Vitest
npm run test:e2e      # Playwright (run test:e2e:install first)
npm run type-check
npm run lint
npm run build
```

**Known gap:** Playwright requires system deps (`playwright install --with-deps chromium`). Previously failed in WSL without `libnspr4.so`.

---

## AGENTS.md Standards Review

Legend: ✅ aligned · ⚠️ partial · ❌ gap

### Architecture & structure

| Standard | Status | Notes |
|----------|--------|-------|
| §3 Feature-first organization | ✅ | `features/auth`, `features/brand` own components, services, schemas |
| §3.2 Thin route files | ✅ | `page.tsx` delegates to feature pages |
| §3 Route groups | ✅ | `(auth)`, `(brand)` |
| §8.1 App Router only | ✅ | |
| §9.2 Centralized API layer | ✅ | `hmis-api.ts` (server), `bff-client.ts` (browser), `auth.service.ts` |
| §9.3 Standardized error handling | ✅ | `HmisApiError`, `BffError`, `bffError()` helpers |

### React & Next.js

| Standard | Status | Notes |
|----------|--------|-------|
| §7.2 Server Components default | ⚠️ | Marketing nav, auth forms, onboarding correctly client-side; more server composition possible on brand pages |
| §7.3 Minimize useEffect | ⚠️ | `AuthGuard`, onboarding `sessionStorage` check use `useEffect` — acceptable but middleware would be cleaner |
| §7.1 Small components (<200 lines) | ✅ | Most components within target; `LoginForm` / `SignUpForm` are larger |
| §8.4 page + loading + error per major route | ❌ | Only `(brand)` root, `/auth`, `/signup` have loading/error. Missing: `/onboarding`, brand subpages |

### TypeScript & forms

| Standard | Status | Notes |
|----------|--------|-------|
| §6 Strict mode, no `any` | ✅ | Strict TS enabled |
| §11 React Hook Form + Zod | ✅ | Login/signup schemas validated client-side |
| §11 Server-side validation | ⚠️ | BFF validates required fields; full rules enforced by Django |

### Styling

| Standard | Status | Notes |
|----------|--------|-------|
| §12 Tailwind + shadcn | ✅ | |
| §12 Design tokens | ✅ | `@theme` brand tokens |
| §12 Avoid inline styles | ⚠️ | Hero animation delays use inline `style={{ animationDelay }}` |
| §12 Avoid large custom CSS | ⚠️ | `globals.css` has keyframes + brand utilities — reasonable for now |

### Security

| Standard | Status | Notes |
|----------|--------|-------|
| §13 Server-only secrets | ✅ | `HMIS_API_URL` not exposed to browser |
| §13 httpOnly cookies | ✅ | |
| §13 Authorization on server | ⚠️ | BFF checks cookies for `/me`; route protection relies on client `AuthGuard` until middleware ships |
| §13 Never trust input | ⚠️ | Basic BFF validation; rely on Django for authoritative checks |

### Testing & quality

| Standard | Status | Notes |
|----------|--------|-------|
| §16 Unit + integration + E2E | ⚠️ | Unit + E2E exist; no dedicated integration test layer for BFF routes |
| §16 Test auth critical path | ✅ | OTP flows covered |
| §1.2 Definition of done (observable, deployable) | ⚠️ | No error tracking, structured logging, or CI pipeline for `web-new` yet |
| §19 Logging & observability | ❌ | No Sentry/Datadog/etc.; upstream uses `X-Request-ID` only |

### Git & PR

| Standard | Status | Notes |
|----------|--------|-------|
| §18 PR must pass build/tests/lint | ⚠️ | No `.github/workflows` for `web-new` (exists for `api/`, `web-old/`) |

### Dependencies

| Standard | Status | Notes |
|----------|--------|-------|
| §21 Avoid bloat | ⚠️ | `framer-motion` in `package.json` but **unused** in `src/` — candidate for removal |

---

## Open Items & Considerations

Prioritized follow-ups we may have missed or deferred.

### High priority

1. **Wire `middleware.ts`** — Export `proxy` from `src/middleware.ts` (or rename `proxy.ts`) so protected-route redirects happen server-side before paint, not only via client `AuthGuard`.
2. **Confirm logo asset** — `BRAND_LOGO_SRC` points to `/second.jpg` (appears to be a photo). Replace with actual Sigma Health logo PNG/SVG when available.
3. **CI for web-new** — Add GitHub Actions: `type-check`, `lint`, `test`, `build`, optionally Playwright in CI with browser install.
4. **Onboarding placeholder** — Uses `sessionStorage` flag and redirects home; replace with real clinic setup flow and server-persisted state.
5. **Dashboard / post-auth destination** — `ROUTES.postAuth` is `/onboarding` until dashboard ships; update routes when app shell exists.

### Medium priority

6. **Missing loading/error boundaries** — Add `loading.tsx` + `error.tsx` for `/onboarding` and brand subpages per AGENTS §8.4.
7. **Social proof partner marks** — `Regional Health` and `CareNet` are placeholder text; confirm real partner names or use actual logo assets.
8. **Hero image vs logo** — Hero uses `sigma-health-landing-other-img.jpg`; logo uses `second.jpg`. Document final asset map in `public/` README or constants.
9. **Brand subpage polish** — Home was refined; About/Features/Services/etc. still use older section layouts and may not match premium home aesthetic.
10. **E2E in CI / local setup** — Document WSL/Linux deps; add `test:e2e:install` to contributor onboarding.
11. **BFF route integration tests** — Test `/api/auth/*` handlers with mocked `hmisApiRequest` (currently only client service + lib unit tests).
12. **Remove unused `framer-motion`** — Reduces bundle/deps if not planned.

### Lower priority / future

13. **Structured logging & error tracking** — AGENTS §19; add production observability before go-live.
14. **Dark mode** — Forced light for brand; auth still passes `isDark` to `MedicalIllustrations` — decide single theme strategy.
15. **Accessibility audit** — Hero animations, OTP input, mobile nav; run axe/Lighthouse pass before launch.
16. **SEO & metadata** — Per-route `metadata` on brand pages (currently root metadata only).
17. **i18n** — Not started; country selector on signup is English-only.
18. **Rate limiting / CSRF** — BFF auth endpoints may need hardening for production (SameSite=lax helps; evaluate CSRF tokens for cookie auth).
19. **Token refresh UX** — `/api/auth/refresh` exists; confirm silent refresh strategy for long sessions.
20. **Home page sections** — `StatsSection`, `CaseStudySection`, `Footer` ready but not composed into `/`; decide IA before re-adding (scroll vs single-screen).
21. **Deploy gateway** — `WEB_NEW_ROUTE_PREFIXES` and `NEXT_PUBLIC_ASSET_PREFIX` documented; verify end-to-end with Django/gateway routing.
22. **Sign-up / auth visual parity** — Align auth pages fully with Bricolage + brand tokens (partially done via OTP step + login logo).

---

## Route Inventory

| Route | Page component | loading | error | Auth |
|-------|----------------|---------|-------|------|
| `/` | `BrandHomePage` | `(brand)` ✅ | `(brand)` ✅ | Public |
| `/auth` | `LoginPage` | ✅ | ✅ | Guest |
| `/signup` | `SignUpPage` | ✅ | ✅ | Guest |
| `/onboarding` | `OnboardingPage` | ❌ | ❌ | Protected (client guard) |
| `/about` | `BrandAboutPage` | ❌ | ❌ | Public |
| `/contacts` | `BrandContactsPage` | ❌ | ❌ | Public |
| `/features` | `BrandFeaturesPage` | ❌ | ❌ | Public |
| `/services` | `BrandServicesPage` | ❌ | ❌ | Public |
| `/our-products` | `BrandProductsPage` | ❌ | ❌ | Public |

---

## Changelog (recent)

| Date | Change |
|------|--------|
| 2026-06-05 | BFF auth, httpOnly cookies, OTP UI, Playwright E2E scaffolding |
| 2026-06-05 | Landing hero redesign, brand tokens, Bricolage typography |
| 2026-06-05 | Hero refinements: 42px headline, stat card layout, social proof bar, micro note |
| 2026-06-05 | Brand palette applied across marketing sections; auth layout updated |
| 2026-06-05 | This tracker created |

---

## How to update this doc

When completing work:

1. Add a row to **Completed Work** (or extend an existing section).
2. Move items from **Open Items** to **Completed** when done.
3. Update **AGENTS.md Standards Review** if gaps are closed.
4. Append to **Changelog** with date + one-line summary.
