import { AppIcon } from "@/components/icons/app-icon";
import { cn } from "@/lib/utils";

type ModuleSettingsEmptyStateProps = {
  moduleLabel?: string;
  className?: string;
  "data-testid"?: string;
};

export function ModuleSettingsEmptyState({
  moduleLabel,
  className,
  "data-testid": testId = "module-settings-empty",
}: ModuleSettingsEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-6 py-14 text-center",
        className,
      )}
      data-testid={testId}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-brand-muted shadow-2xs ring-1 ring-slate-200/70">
        <AppIcon name="settings" size={22} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-brand-navy">
        No settings found
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-400">
        {moduleLabel
          ? `No settings found for ${moduleLabel}. Configuration for this module will appear here when available.`
          : "No settings found for this module. Configuration will appear here when available."}
      </p>
    </div>
  );
}
