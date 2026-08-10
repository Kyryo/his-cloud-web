import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";

type ModuleEmptyStateVariant = "upgrade" | "coming_soon";

type ModuleEmptyStateProps = {
  featureName: string;
  description?: string;
  variant?: ModuleEmptyStateVariant;
  icon?: LucideIcon;
  "data-testid"?: string;
};

const VARIANT_COPY: Record<
  ModuleEmptyStateVariant,
  { title: (name: string) => string; body: (name: string) => string }
> = {
  upgrade: {
    title: (name) => `Upgrade your Sigma plan to access ${name}`,
    body: (name) =>
      `This workspace is available on a higher Sigma plan. Contact your administrator to unlock ${name.toLowerCase()}.`,
  },
  coming_soon: {
    title: (name) => `${name} is coming soon`,
    body: (name) =>
      `${name} is not available in this workspace yet. Check back as we expand claims operations.`,
  },
};

export function ModuleEmptyState({
  featureName,
  variant = "upgrade",
  icon: Icon = Sparkles,
  "data-testid": dataTestId,
}: ModuleEmptyStateProps) {
  const copy = VARIANT_COPY[variant];
  return (
    <div
      className="flex min-h-[min(420px,calc(100vh-16rem))] flex-col items-center justify-center px-6 py-16 text-center"
      data-testid={dataTestId}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
        <Icon className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">
        {copy.title(featureName)}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        {copy.body(featureName)}
      </p>
    </div>
  );
}

type ModuleEmptyStatePageProps = ModuleEmptyStateProps & {
  pageDescription: string;
};

export function ModuleEmptyStatePage({
  featureName,
  pageDescription,
  variant = "upgrade",
  icon,
  "data-testid": dataTestId,
}: ModuleEmptyStatePageProps) {
  return (
    <ListPageLayout>
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title={featureName}
            description={pageDescription}
          />
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>
      <ModuleEmptyState
        featureName={featureName}
        variant={variant}
        icon={icon}
        data-testid={dataTestId}
      />
    </ListPageLayout>
  );
}
