# Next.js Engineering Standards & Reference

## 1. Product Mindset

### 1.1 Build Production Software, Not MVP Code

Unless explicitly instructed otherwise, assume all work is intended for a production-ready product.

Do not:

* Build throwaway implementations.
* Assume code will be replaced later.
* Skip architecture because "it's just an MVP."
* Introduce technical debt without approval.

Build every feature as if it will remain in production for years.

---

### 1.2 Definition of Done

A feature is complete only when it is:

* Functional
* Tested
* Typed
* Secure
* Maintainable
* Observable
* Reviewed
* Deployable

---

### 1.3 Quality First

Never trade maintainability for short-term speed.

Favor:

* Simplicity
* Readability
* Predictability
* Consistency

---

## 2. Core Engineering Principles

### 2.1 Readability Over Cleverness

Code should be understandable within minutes.

Avoid:

* Clever abstractions
* Unnecessary indirection
* Complex patterns

---

### 2.2 Consistency Over Preference

Team standards override individual preferences.

---

### 2.3 Composition Over Configuration

Prefer:

```tsx
<UserCard>
  <Avatar />
  <UserDetails />
</UserCard>
```

Over:

```tsx
<UserCard
  showAvatar
  showRole
  showActions
  variant="large"
/>
```

---

### 2.4 Explicit Over Magic

Favor code that clearly communicates intent.

Avoid hidden behavior.

---

## 3. Project Structure

### 3.1 High-Level Structure

```text
src/
├── app/
├── features/
├── components/
├── hooks/
├── services/
├── lib/
├── providers/
├── types/
├── constants/
├── utils/
└── middleware.ts
```

---

### 3.2 Keep Routes in app

The app directory contains routing concerns only.

Allowed:

```text
page.tsx
layout.tsx
loading.tsx
error.tsx
route.ts
```

Avoid placing business logic directly in routes.

---

### 3.3 Keep Business Logic in Features

```text
features/
├── patients/
├── billing/
├── appointments/
└── inventory/
```

Features own:

* Components
* Hooks
* Services
* Types
* Validation
* Tests

---

### 3.4 Feature First Organization

Group by business domain.

Prefer:

```text
features/patients
features/appointments
```

Avoid:

```text
components/
services/
hooks/
```

containing unrelated business code.

---

### 3.5 Authenticated App Shell (shadcn sidebar-07)

The authenticated `(app)` layout **must** use the exact [shadcn sidebar-07](https://ui.shadcn.com/blocks#sidebar-07) block structure. When unsure about shell layout, read this section first.

#### Canonical files

```text
src/features/app-shell/components/AppShell.tsx   # sidebar-07 page layout (do not customize)
src/components/app-sidebar.tsx                   # sidebar-07 AppSidebar composition
src/components/nav-main.tsx                      # sidebar-07 nav (HMIS routes via buildSidebarNavItems)
src/components/nav-user.tsx                      # sidebar-07 profile card (backend user + logout)
src/components/team-switcher.tsx                 # sidebar-07 header switcher (tenant + clinics)
src/components/nav-projects.tsx                  # sidebar-07 block file (unused until needed)
src/app/(app)/layout.tsx                         # AuthGuard → UserProvider → ToastProvider → AppShell
src/features/app-shell/components/page-layout/ # reusable list/detail page section layouts
```

Install reference: `npx shadcn add sidebar-07` → [sidebar-07 block](https://ui.shadcn.com/blocks#sidebar-07).

#### Page section layouts

Use `@/features/app-shell/components/page-layout` for authenticated page chrome **below** `AppShell` (not inside it). These are presentational shells only — feature pages supply domain content as children.

**Detail pages:** `DetailPageLayout`, `DetailPageHeaderSection`, `DetailPageTabsSection`, `DetailPageTabsNavSection`, `DetailPageTabNavItem`, `DetailPageMainAsideGrid`, `DetailPageMainSection`, `DetailPageAsidePanelSection`.

**List pages:** `ListPageLayout`, `ListPageHeaderSection` (+ `TopRow`, `TitleBlock`, `Actions`, `MobileSearch`), `ListPageStatsSection`, `ListPageToolbarSection` (+ `Search`, `Actions`, `Filters`), `ListPageDataSectionsStack`, `ListPageTableSection`.

Reference implementations: `features/customers/pages/CustomerDetailPage.tsx`, `features/customers/pages/CustomersListPage.tsx`.

#### Rules

* **`AppShell.tsx` matches sidebar-07 `page.tsx` exactly.** Import paths use `@/components/*` instead of `@/registry/...`. The only allowed change is replacing demo placeholder content with `{children}` inside the `min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min` content pane.
* **Do not** add custom header borders, background colors, padding, or dynamic breadcrumbs to `AppShell.tsx`.
* **Do not** recreate the shell layout elsewhere. All authenticated pages render inside `<AppShell>{children}</AppShell>`.
* **Customize `src/components/app-sidebar.tsx`, `nav-main.tsx`, `nav-user.tsx`, and `team-switcher.tsx`** for HMIS data — not the `AppShell` wrapper.
* Shared primitives live in `src/components/ui/` (`sidebar`, `breadcrumb`, `separator`, etc.).

#### Layout overlap fix

If main content sits under the sidebar, verify `sidebar.tsx` uses `w-[var(--sidebar-width)]` (Tailwind v4 requires `var()` — `w-[--sidebar-width]` resolves to 0px). Do not add margins to `AppShell`.

#### Client integrations

The local ERP no longer exposes `has_synced_to_odoo` on customers. Do not surface “Odoo”, “OpenMRS”, or “Clinical App” sync labels in user-facing UI.

Do not surface `has_synced_to_openmrs` in web-new client UI; that integration is not tracked in the new app.

---

## 4. File Grouping Rules

### 4.1 Co-locate Related Files

Files that change together should live together.

```text
patient-form.tsx
patient.schema.ts
patient.types.ts
patient-form.test.tsx
```

---

### 4.2 Shared Code Rule

Move code to shared only after it is used by multiple features.

Default location:

```text
features/<feature>
```

Not:

```text
components/shared
```

---

### 4.3 Ownership Rule

Every file must have a clear owner.

Ask:

> Which feature owns this file?

If the answer is unclear, relocate the file.

---

### 4.4 Avoid Deep Nesting

Maximum recommended depth:

```text
feature
 └── components
      └── file.tsx
```

Avoid nesting beyond 4 levels.

---

## 5. Naming Conventions

### Components

```text
PatientCard.tsx
AppointmentTable.tsx
```

PascalCase.

---

### Hooks

```text
usePatient.ts
useAppointment.ts
```

Must start with `use`.

---

### Utilities

```text
formatCurrency.ts
calculateAge.ts
```

camelCase filenames.

---

### Types

```text
patient.types.ts
appointment.types.ts
```

---

### Schemas

```text
patient.schema.ts
invoice.schema.ts
```

---

### Constants

```text
MAX_FILE_SIZE
DEFAULT_PAGE_SIZE
API_TIMEOUT
```

UPPER_SNAKE_CASE.

---

## 6. TypeScript Standards

### 6.1 Strict Mode Required

```json
{
  "strict": true
}
```

Never disable strict mode.

---

### 6.2 No Any

Forbidden:

```ts
any
```

Use:

```ts
unknown
```

or proper types.

---

### 6.3 Prefer Type Inference

Good:

```ts
const count = 5;
```

Avoid unnecessary annotations.

---

### 6.4 Shared Domain Types

Store reusable types centrally.

Avoid duplicate interfaces.

---

## 7. React Standards

### 7.1 Small Components

Target:

* Single responsibility
* Less than 200 lines

Split large components.

---

### 7.2 Prefer Server Components

Server Components are the default.

Use Client Components only when necessary.

---

### 7.3 Minimize useEffect

Avoid useEffect for:

* Data fetching
* Derived state

Prefer:

* Server Components
* Server Actions
* TanStack Query

---

### 7.4 No Business Logic in JSX

Bad:

```tsx
items.filter(...).map(...)
```

Compute outside render.

---

### 7.5 Avoid Prop Drilling

Prefer:

* Composition
* Context
* State stores

when appropriate.

---

## 8. Next.js Standards

### 8.1 App Router Only

New development uses App Router.

---

### 8.2 Route Files Stay Thin

Good:

```tsx
export default function Page() {
  return <PatientsPage />;
}
```

Move implementation into feature modules.

---

### 8.3 Use Route Groups

```text
(auth)
(dashboard)
(marketing)
```

for organization.

---

### 8.4 Every Major Route Needs

```text
page.tsx
loading.tsx
error.tsx
```

---

## 9. Data Fetching

### 9.1 Server First

Fetch data on the server whenever possible.

---

### 9.2 Centralized API Layer

Never scatter fetch calls throughout the application.

Use:

```text
services/
lib/api-client.ts
```

---

### 9.3 Standardized Error Handling

Every API call must:

* Handle failures
* Surface meaningful errors
* Log appropriately

---

## 10. State Management

### Preferred Order

1. Server State
2. URL State
3. Local State
4. Context
5. Zustand
6. Redux

---

### Rules

* Keep state close to where it is used.
* Do not create global state unnecessarily.
* Avoid duplicate state.

---

## 11. Forms

### Standard Stack

* React Hook Form
* Zod

---

### Validation

Validate:

* Client side
* Server side

Never trust client validation alone.

---

### Searchable fields

Use the shared searchable select pattern from `InventoryProductPicker` and `InventorySupplierPicker` (`@/features/inventory/components/`) for any field where the user searches or picks from a remote list. This is a Radix `Select` with an embedded search `Input` in `SelectContent` (same pattern as the product field on the **New batch** dialog and the client field on **Schedule appointment**).

Reference implementations:

* `InventoryProductPicker` — catalog search (products)
* `InventorySupplierPicker` — catalog search with custom entry (suppliers)
* `CustomerAppointmentPicker` — client search (appointments)

Do not use plain `<Input type="search">` dropdowns or bespoke search UIs unless the design explicitly calls for a different control.

When a match may not exist in the catalog (e.g. supplier names), offer a “Use …” option in the select list for the typed search value (see `InventorySupplierPicker`).

The legacy combobox from `@/components/ui/combobox` (`InlineProductCombobox`, `CareProviderCombobox`, etc.) remains for existing screens; prefer the searchable select pattern for new work.

---

### Required fields

Mark mandatory form labels with `<RequiredFieldMarker />` from `@/components/ui/required-field-marker` (red asterisk). Optional fields omit the marker.

Apply this consistently in dialogs, sheets, and full-page forms.

---

## 12. Styling

### Approved Stack

* Tailwind CSS
* shadcn/ui

---

### Styling Rules

* Utility-first approach.
* Avoid inline styles.
* Avoid large custom CSS files.
* Use design tokens consistently.

---

## 13. Security

### Never Trust Input

Validate all external input.

---

### Environment Variables

Server-only secrets:

```env
DATABASE_URL
JWT_SECRET
```

Client-safe:

```env
NEXT_PUBLIC_API_URL
```

---

### Authorization

Permissions must be enforced on the server.

Never rely solely on frontend checks.

---

## 14. Error Handling

### Never Swallow Errors

Forbidden:

```ts
catch {}
```

---

### Log Meaningful Context

Logs should help diagnose issues.

---

### User-Friendly Errors

Never expose internal system details.

---

## 15. Performance

### Optimize Images

Always use:

```tsx
<Image />
```

where applicable.

---

### Lazy Load Expensive Features

Use dynamic imports for:

* Large editors
* Charts
* Maps
* Admin tooling

---

### Measure Before Optimizing

Do not prematurely optimize.

Profile first.

---

## 16. Testing Standards

### Required Levels

* Unit Tests
* Integration Tests
* E2E Tests

---

### Approved Tooling

* Vitest
* React Testing Library
* Playwright

---

### Test Critical Paths

Always test:

* Authentication
* Permissions
* Payments
* Billing
* Data mutations

---

## 17. Git Standards

### Branch Naming

```text
feature/patient-search
fix/login-redirect
refactor/billing-service
```

---

### Commit Convention

```text
feat:
fix:
refactor:
test:
docs:
chore:
ci:
```

Examples:

```text
feat: add patient search

fix: resolve timezone issue

refactor: simplify billing service
```

---

## 18. Pull Requests

Every PR must:

* Build successfully
* Pass tests
* Pass linting
* Pass type checking
* Include screenshots for UI changes

---

### PR Size

Prefer:

* Small PRs
* Single concern per PR

Avoid large "mega PRs."

---

## 19. Logging & Observability

Every production system should support:

* Structured logging
* Error tracking
* Audit trails where required
* Performance monitoring

Never rely on console logs in production.

---

## 20. Documentation

Document:

* Complex business rules
* Architecture decisions
* Non-obvious behavior

Do not document obvious code.

---

## 21. Dependency Management

Before adding a dependency ask:

1. Can existing tools solve this?
2. Is the dependency maintained?
3. Is it widely adopted?
4. Is it actively supported?

Avoid dependency bloat.

---

## 22. Code Review Standards

Review for:

* Correctness
* Security
* Maintainability
* Performance
* Simplicity

Not personal style preferences.

---

## 23. Engineering Non-Negotiables

Always:

* Use TypeScript
* Use strict mode
* Use Server Components by default
* Validate inputs
* Handle errors
* Write tests
* Follow established patterns

Never:

* Use any
* Commit secrets
* Disable linting
* Disable type checking
* Ignore failing tests
* Mix business logic with routing
* Build throwaway MVP code

## Linting & Code Quality

- Before finishing any task that touches `.tsx`/`.ts` files, run `npm run lint` (or `pnpm lint`) 
  and fix all reported errors before considering the task complete.
- Never suppress lint errors with `// eslint-disable` comments unless explicitly asked to.

### React Hooks: no direct setState in effects
This project enforces `react-hooks/set-state-in-effect`. When writing `useEffect`:
- Do NOT call a state setter (or a function that calls one) synchronously in the effect body.
- If an effect needs to fetch data and set state, do so inside an async function where the 
  setState call happens after an `await` (i.e., not on the synchronous first pass).
- Prefer patterns like:
```tsx
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const data = await fetchThing();
      if (!cancelled) setThing(data); // OK: after await
    }
    void run();
    return () => { cancelled = true; };
  }, [deps]);
```
- If a lint error like `Avoid calling setState() directly within an effect` appears, restructure 
  the effect as above rather than disabling the rule.

---

# Golden Rule

Write code that another engineer can understand, modify, test, and deploy confidently six months from now without needing your help.
Before writing any code, answer these questions:

- [ ] Does this belong in a service, model, view, or utility?
- [ ] Is there existing code I can extend rather than duplicate?
- [ ] What are the edge cases? (empty, null, unauthorized, concurrent access)
- [ ] What exceptions can this raise and how are they handled?
- [ ] Will this cause N+1 queries?
- [ ] Does this need to be async / queued via Celery?
- [ ] What tests will cover this?
