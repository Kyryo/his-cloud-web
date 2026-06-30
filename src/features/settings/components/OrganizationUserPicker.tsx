"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchOrganizationUsers } from "@/features/settings/services/user-management.service";
import type { OrganizationUser } from "@/features/settings/types/settings.types";

type OrganizationUserPickerProps = {
  user: OrganizationUser | null;
  onUserChange: (user: OrganizationUser | null) => void;
  excludeUserIds?: number[];
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
};

function formatUserSearchLabel(user: OrganizationUser): string {
  return `${user.name} · ${user.email}`;
}

export function OrganizationUserPicker({
  user,
  onUserChange,
  excludeUserIds = [],
  disabled = false,
  label = "User",
  description = "Search by name or email.",
  id = "organization-user-select",
}: OrganizationUserPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<OrganizationUser[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const excludedIds = useMemo(() => new Set(excludeUserIds), [excludeUserIds]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }

    if (search.trim().length < 2) {
      setOptions(user ? [user] : []);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const response = await fetchOrganizationUsers({
            search: search.trim(),
            pageSize: 8,
          });
          const filtered = response.results.filter(
            (option) => option.is_active && !excludedIds.has(option.id),
          );
          setOptions(filtered);
        } catch {
          setOptions(user ? [user] : []);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [excludedIds, open, search, user]);

  const handleValueChange = (value: string) => {
    const match =
      options.find((option) => String(option.id) === value) ??
      (user && String(user.id) === value ? user : null);

    if (match) {
      onUserChange(match);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor={id}>{label}</Label>
        {description ? (
          <p className="mt-1 text-xs text-brand-muted">{description}</p>
        ) : null}
      </div>

      <Select
        value={user ? String(user.id) : undefined}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select a user">
            {user ? formatUserSearchLabel(user) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="border-b border-brand-border p-2">
            <Input
              ref={searchInputRef}
              value={search}
              placeholder="Search users..."
              className="h-9"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>

          {isLoadingResults ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-brand-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Searching...
            </div>
          ) : search.trim().length < 2 ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              Type at least 2 characters to search.
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              No users found.
            </div>
          ) : (
            options.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                <div className="flex flex-col items-start">
                  <span>{option.name}</span>
                  <span className="text-xs text-brand-muted">{option.email}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
