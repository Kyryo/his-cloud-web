"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  fetchPlatformAdminTenantModules,
  updatePlatformAdminTenantModules,
} from "@/features/platform-admin/services/platform-admin.service";
import type { PlatformAdminTenantModule } from "@/features/platform-admin/types/platform-admin.types";

type PlatformAdminTenantModulesTabProps = {
  tenantUuid: string;
};

export function PlatformAdminTenantModulesTab({
  tenantUuid,
}: PlatformAdminTenantModulesTabProps) {
  const [modules, setModules] = useState<PlatformAdminTenantModule[]>([]);
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchPlatformAdminTenantModules(tenantUuid);
        if (cancelled) return;
        setModules(response.modules);
        setDraft(
          Object.fromEntries(
            response.modules.map((module) => [module.name, module.is_active]),
          ),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load modules.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [tenantUuid]);

  const isDirty = useMemo(() => {
    return modules.some((module) => draft[module.name] !== module.is_active);
  }, [draft, modules]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const response = await updatePlatformAdminTenantModules(tenantUuid, {
        modules: modules.map((module) => ({
          name: module.name,
          is_active: Boolean(draft[module.name]),
        })),
      });
      setModules(response.modules);
      setDraft(
        Object.fromEntries(
          response.modules.map((module) => [module.name, module.is_active]),
        ),
      );
      toast.success("Module entitlements saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save modules.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-brand-muted">Loading modules…</p>;
  }

  return (
    <Card className="rounded-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Module entitlements</CardTitle>
          <p className="mt-1 text-sm text-brand-muted">
            Turn portal modules on or off for this tenant. Disabled modules stay
            visible in navigation and show an upgrade state when opened.
          </p>
        </div>
        <Button
          type="button"
          disabled={!isDirty || isSaving}
          onClick={() => void handleSave()}
        >
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {error ? (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <ul className="divide-y divide-brand-border rounded-lg border border-brand-border">
          {modules.map((module) => (
            <li
              key={module.name}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-brand-navy">
                  {module.label}
                </p>
                <p className="text-xs text-brand-muted">{module.name}</p>
              </div>
              <Switch
                checked={Boolean(draft[module.name])}
                onCheckedChange={(checked) =>
                  setDraft((current) => ({
                    ...current,
                    [module.name]: checked,
                  }))
                }
                aria-label={`Toggle ${module.label}`}
                data-testid={`platform-admin-module-toggle-${module.name.toLowerCase()}`}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
