"use client";

import { useEffect, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { AddClientTagDialog } from "@/features/settings/components/AddClientTagDialog";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { UpdateClientTagDialog } from "@/features/settings/components/UpdateClientTagDialog";
import { TagBadge } from "@/features/tags/components/TagBadge";
import { TAG_TARGET_TYPES } from "@/features/tags/constants/tag-target-types";
import { archiveTag, fetchTags } from "@/features/tags/services/tags.service";
import type { Tag } from "@/features/tags/types/tag.types";
import { useToast } from "@/providers/toast-provider";

type ClientTagsSettingsTabProps = {
  isActive: boolean;
};

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

  return (
    <>
      <SettingsPanelSection
        title="Client tags"
        description="Tags staff can assign to clients and use when filtering lists."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
          >
            Add tag
          </Button>
        }
      >
        {isLoading ? (
          <SettingsContentSkeleton rows={4} showHeader={false} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : tags.length === 0 ? (
          <p className="text-sm text-slate-400">
            No tags yet. Add a tag so staff can categorize and filter clients.
          </p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {tags.map((tag) => (
              <li
                key={tag.uuid}
                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <TagBadge tag={tag} />
                  {tag.description ? (
                    <p className="mt-1.5 text-sm text-slate-400">
                      {tag.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {tag.is_active ? "Active" : "Archived"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-brand-muted hover:text-brand-navy"
                    onClick={() => setEditingTag(tag)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-brand-muted hover:text-brand-navy"
                    disabled={archivingUuid === tag.uuid}
                    onClick={() => void handleArchive(tag)}
                  >
                    Archive
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SettingsPanelSection>

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
