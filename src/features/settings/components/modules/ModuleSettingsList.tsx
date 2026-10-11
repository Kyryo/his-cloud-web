"use client";

import Link from "next/link";
import { useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { isPortalModuleName } from "@/features/app-shell/utils/module-entitlements";
import { SettingsSection } from "@/features/settings/components/SettingsPageLayout";
import {
  getModuleSettingsItems,
  type ModuleSettingsItem,
} from "@/features/settings/constants/module-settings-cards";
import { activateOrganizationModule } from "@/features/settings/services/settings.service";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

function ModuleRow({
  module,
  added,
  pending,
  onAdd,
}: {
  module: ModuleSettingsItem;
  added: boolean;
  pending: boolean;
  onAdd: (moduleId: string) => void;
}) {
  const body = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200/70">
        <AppIcon name={module.icon} size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brand-navy">{module.label}</p>
        <p className="mt-0.5 text-sm text-slate-400">{module.description}</p>
      </div>
    </>
  );

  return (
    <li className="flex items-center gap-3 py-3.5">
      {added ? (
        <Link
          href={module.href}
          className={cn(
            "group flex min-w-0 flex-1 items-center gap-3 rounded-lg transition-colors",
            "hover:bg-slate-50/80 focus-visible:bg-slate-50/80 focus-visible:outline-none",
          )}
          data-testid={`module-settings-link-${module.slug}`}
        >
          {body}
          <AppIcon
            name="chevronRight"
            size={16}
            className="shrink-0 text-slate-300 transition-colors group-hover:text-slate-400"
            aria-hidden="true"
          />
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
      {added ? (
        <span
          className="inline-flex h-8 shrink-0 items-center rounded-full bg-brand-tint px-3.5 text-[13px] font-medium text-brand-primary"
          data-testid={`module-added-${module.slug}`}
        >
          Added
        </span>
      ) : (
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center rounded-full bg-brand-primary px-3.5 text-[13px] font-medium text-white hover:bg-brand-primary-hover disabled:opacity-60"
          data-testid={`module-add-${module.slug}`}
          disabled={pending}
          onClick={() => onAdd(module.id)}
        >
          {pending ? "Adding…" : "Add"}
        </button>
      )}
    </li>
  );
}

export function ModuleSettingsList() {
  const { toast } = useToast();
  const { userData, refreshUser } = useUser();
  const enabled = new Set(userData?.enabled_modules ?? []);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const modules = getModuleSettingsItems().filter((module) =>
    isPortalModuleName(module.id),
  );

  async function addModule(moduleId: string) {
    setPendingId(moduleId);
    try {
      await activateOrganizationModule(moduleId);
      setAddedIds((current) =>
        current.includes(moduleId) ? current : [...current, moduleId],
      );
      await refreshUser();
      toast({
        variant: "success",
        title: "Module added",
        description: "It is available for this clinic.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add module",
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <SettingsSection
      title="Operational modules"
      description="Add a module here. Open one you have already added to change its settings."
      flush
    >
      <ul className="divide-y divide-brand-border">
        {modules.map((module) => (
          <ModuleRow
            key={module.id}
            module={module}
            added={enabled.has(module.id) || addedIds.includes(module.id)}
            pending={pendingId === module.id}
            onAdd={(moduleId) => {
              void addModule(moduleId);
            }}
          />
        ))}
      </ul>
    </SettingsSection>
  );
}
