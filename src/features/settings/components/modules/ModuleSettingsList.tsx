"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { isPortalModuleName } from "@/features/app-shell/utils/module-entitlements";
import { SettingsSection } from "@/features/settings/components/SettingsPageLayout";
import {
  getModuleSettingsItems,
  type ModuleSettingsItem,
} from "@/features/settings/constants/module-settings-cards";
import {
  activateOrganizationModule,
  syncOrganizationModules,
} from "@/features/settings/services/settings.service";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

function ModuleIdentity({ module }: { module: ModuleSettingsItem }) {
  return (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200/70 transition-colors group-hover:bg-white group-hover:text-brand-primary">
        <AppIcon name={module.icon} size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brand-navy">{module.label}</p>
        <p className="mt-0.5 text-sm text-slate-400">{module.description}</p>
      </div>
    </>
  );
}

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
  if (added) {
    return (
      <li>
        <Link
          href={module.href}
          className={cn(
            "group flex items-center gap-3 rounded-lg py-3.5 transition-colors",
            "hover:bg-slate-50/80 focus-visible:bg-slate-50/80 focus-visible:outline-none",
          )}
          data-testid={`module-settings-link-${module.slug}`}
        >
          <ModuleIdentity module={module} />
          <AppIcon
            name="chevronRight"
            size={16}
            className="shrink-0 text-slate-300 transition-colors group-hover:text-slate-400"
            aria-hidden="true"
          />
        </Link>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 py-3.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ModuleIdentity module={module} />
      </div>
      <button
        type="button"
        className="inline-flex h-8 shrink-0 items-center rounded-full bg-brand-primary px-3.5 text-[13px] font-medium text-white hover:bg-brand-primary-hover disabled:opacity-60"
        data-testid={`module-add-${module.slug}`}
        disabled={pending}
        onClick={() => onAdd(module.id)}
      >
        {pending ? "Adding…" : "Add"}
      </button>
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

  useEffect(() => {
    let active = true;

    async function syncRoles() {
      try {
        await syncOrganizationModules();
        if (active) {
          await refreshUser();
        }
      } catch {
        // The list still reflects the last session. Add remains available.
      }
    }

    void syncRoles();
    return () => {
      active = false;
    };
  }, [refreshUser]);

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
        description: "It is available in the menu for this clinic.",
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
