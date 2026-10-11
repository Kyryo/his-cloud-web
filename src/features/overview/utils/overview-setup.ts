import { ROUTES } from "@/constants/routes";
import type { OnboardingProgress } from "@/features/auth/services/onboarding.service";
import { withOnboardingReturn } from "@/features/overview/utils/onboarding-return";

export const SETUP_READY_WINDOW_MS = 15 * 60 * 1000;

export type OverviewSetupMode = "hidden" | "checklist" | "ready" | "resume";

const VISIBLE_REQUIRED_STEPS = [
  "clinic",
  "modules",
  "departments",
  "catalog",
  "insurance",
] as const;

export function overviewSetupMode(
  progress: OnboardingProgress | null | undefined,
  now = Date.now(),
): OverviewSetupMode {
  if (!progress) {
    return "hidden";
  }
  if (progress.status === "completed") {
    const finishedAt = progress.completed_at
      ? new Date(progress.completed_at).getTime()
      : Number.NaN;
    if (Number.isNaN(finishedAt)) {
      return "hidden";
    }
    return now - finishedAt < SETUP_READY_WINDOW_MS ? "ready" : "hidden";
  }
  if (progress.dismissed_at) {
    return "resume";
  }
  return "checklist";
}

export function isSetupStepDone(
  steps: OnboardingProgress["completed_steps"],
  step: keyof OnboardingProgress["completed_steps"],
): boolean {
  return steps[step] === true;
}

export function setupProgressLabel(progress: OnboardingProgress): string {
  const steps = progress.completed_steps;
  const ready = VISIBLE_REQUIRED_STEPS.filter((step) =>
    isSetupStepDone(steps, step),
  ).length;
  return `${ready} of ${VISIBLE_REQUIRED_STEPS.length} ready`;
}

export function catalogSetupHref(): string {
  return withOnboardingReturn(`${ROUTES.inventoryProducts}?add=product`);
}

export function insuranceSetupHref(progress: OnboardingProgress): string {
  const path = isSetupStepDone(progress.completed_steps, "insurance_payer")
    ? `${ROUTES.settingsFinanceOperations}?tab=schemes&add=scheme`
    : `${ROUTES.settingsFinanceOperations}?tab=payers&add=payer`;
  return withOnboardingReturn(path);
}

export function moduleSetupHref(): string {
  return withOnboardingReturn(ROUTES.settingsModules);
}

export function departmentSetupHref(): string {
  return withOnboardingReturn(
    `${ROUTES.settingsOrganization}?tab=departments&add=department`,
  );
}
