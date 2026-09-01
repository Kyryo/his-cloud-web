"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddClientTagDialog } from "@/features/settings/components/AddClientTagDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { UpdateClientTagDialog } from "@/features/settings/components/UpdateClientTagDialog";
import { TagBadge } from "@/features/tags/components/TagBadge";
import { TAG_TARGET_TYPES } from "@/features/tags/constants/tag-target-types";
import { archiveTag, fetchTags } from "@/features/tags/services/tags.service";
import type { Tag } from "@/features/tags/types/tag.types";
import { useToast } from "@/providers/toast-provider";

type ClientTagsSettingsTabProps = {
  isActive: boolean;
};

const columns = [
  { key: "name", label: "Name" },
  { key: "color", label: "Color" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
] as const;

export function ClientTagsSettingsTab({ isActive }: ClientTagsSettingsTabProps) {
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [archivingUuid, setArchivingUuid] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadTags() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchTags({
          target_type: TAG_TARGET_TYPES.CUSTOMER,
          pageSize: 200,
          ordering: "name",
        });
        if (active) {
          setTags(response.results);
        }
      } catch (loadError) {
        if (active) {
          setTags([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load client tags.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadTags();

    return () => {
      active = false;
    };
  }, [isActive, reloadToken]);

  if (!isActive) {
    return null;
  }

  function handleCreated(tag: Tag) {
    setTags((current) =>
      [...current, tag].sort((left, right) => left.name.localeCompare(right.name)),
    );
    setReloadToken((token) => token + 1);
  }

  function handleUpdated(tag: Tag) {
    setTags((current) =>
      current
        .map((item) => (item.uuid === tag.uuid ? tag : item))
        .sort((left, right) => left.name.localeCompare(right.name)),
    );
  }

  async function handleArchive(tag: Tag) {
    setArchivingUuid(tag.uuid);
    try {
      await archiveTag(tag.uuid);
      setTags((current) => current.filter((item) => item.uuid !== tag.uuid));
      toast({
        variant: "success",
        title: "Tag archived",
        description: `${tag.name} was removed from the catalog.`,
      });
    } catch (archiveError) {
      toast({
        variant: "error",
        title: "Could not archive tag",
        description:
          archiveError instanceof Error
            ? archiveError.message
            : "Something went wrong.",
      });
    } finally {
      setArchivingUuid(null);
    }
  }

  const isEmpty = !isLoading && !error && tags.length === 0;

  return (
    <>
      <OrganizationTabSection
        title="Client tags"
        description="Manage the tag catalog staff can assign to clients."
        showHeader={!isEmpty}
        actions={
          <Button type="button" onClick={() => setAddDialogOpen(true)}>
            Add tag
          </Button>
        }
      >
        {isLoading ? <PageLoader /> : null}
        {!isLoading && error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}
        {isEmpty ? (
          <OrganizationEmptyState
            title="No client tags yet"
            description="Create tags to help staff categorize and filter clients."
            actionLabel="Add tag"
            onAction={() => setAddDialogOpen(true)}
          />
        ) : null}
        {!isLoading && !error && tags.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-xs uppercase tracking-wide text-brand-muted">
                  {columns.map((column) => (
                    <th key={column.key} className="px-3 py-2 font-medium">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr key={tag.uuid} className="border-b border-brand-border/70">
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <TagBadge tag={tag} />
                        {tag.description ? (
                          <p className="text-xs text-brand-muted">{tag.description}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-brand-muted">
                      {tag.color || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={tag.is_active ? "default" : "outline"}>
                        {tag.is_active ? "Active" : "Archived"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTag(tag)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={archivingUuid === tag.uuid}
                          onClick={() => void handleArchive(tag)}
                        >
                          Archive
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </OrganizationTabSection>

      <AddClientTagDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleCreated}
      />
      <UpdateClientTagDialog
        tag={editingTag}
        open={Boolean(editingTag)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTag(null);
          }
        }}
        onUpdated={handleUpdated}
      />
    </>
  );
}
