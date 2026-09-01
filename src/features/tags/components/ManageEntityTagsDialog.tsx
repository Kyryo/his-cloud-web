"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { ListPagePagination } from "@/features/app-shell/components/page-layout";
import { TagBadge } from "@/features/tags/components/TagBadge";
import { TAG_TARGET_TYPES } from "@/features/tags/constants/tag-target-types";
import { syncCustomerTags } from "@/features/tags/services/customer-tags.service";
import { fetchTags } from "@/features/tags/services/tags.service";
import type { Tag } from "@/features/tags/types/tag.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const TAGS_PAGE_SIZE = 8;

type ManageEntityTagsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityLabel: string;
  entityUuid: string;
  targetType?: string;
  selectedTags?: Tag[];
  onSaved: (tags: Tag[]) => void;
};

function mergeTagsIntoMap(tags: Tag[], current: Record<string, Tag>) {
  const next = { ...current };
  for (const tag of tags) {
    next[tag.uuid] = tag;
  }
  return next;
}

export function ManageEntityTagsDialog({
  open,
  onOpenChange,
  entityLabel,
  entityUuid,
  targetType = TAG_TARGET_TYPES.CUSTOMER,
  selectedTags = [],
  onSaved,
}: ManageEntityTagsDialogProps) {
  const { toast } = useToast();
  const [catalog, setCatalog] = useState<Tag[]>([]);
  const [tagByUuid, setTagByUuid] = useState<Record<string, Tag>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelected(selectedTags.map((tag) => tag.uuid));
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
    setTagByUuid(
      selectedTags.reduce<Record<string, Tag>>((accumulator, tag) => {
        accumulator[tag.uuid] = tag;
        return accumulator;
      }, {}),
    );
  }, [open, selectedTags]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);

    return () => clearTimeout(handle);
  }, [open, search]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;

    async function loadCatalog() {
      setIsLoading(true);
      try {
        const response = await fetchTags({
          target_type: targetType,
          is_active: true,
          page,
          pageSize: TAGS_PAGE_SIZE,
          ordering: "name",
          search: debouncedSearch || undefined,
        });
        if (active) {
          setCatalog(response.results);
          setTagByUuid((current) => mergeTagsIntoMap(response.results, current));
          setTotalCount(response.pagination?.count ?? response.results.length);
          setHasNext(Boolean(response.pagination?.next));
          setHasPrevious(Boolean(response.pagination?.previous));
        }
      } catch (error) {
        if (active) {
          setCatalog([]);
          setTotalCount(0);
          setHasNext(false);
          setHasPrevious(false);
          toast({
            variant: "error",
            title: "Could not load tags",
            description:
              error instanceof Error ? error.message : "Something went wrong.",
          });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      active = false;
    };
  }, [debouncedSearch, open, page, targetType, toast]);

  const selectedTagObjects = useMemo(
    () =>
      selected
        .map((uuid) => tagByUuid[uuid])
        .filter((tag): tag is Tag => Boolean(tag)),
    [selected, tagByUuid],
  );

  function toggleTag(tag: Tag) {
    setTagByUuid((current) => ({ ...current, [tag.uuid]: tag }));
    setSelected((current) =>
      current.includes(tag.uuid)
        ? current.filter((value) => value !== tag.uuid)
        : [...current, tag.uuid],
    );
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const tags =
        targetType === TAG_TARGET_TYPES.CUSTOMER
          ? await syncCustomerTags(entityUuid, selected)
          : selectedTagObjects;
      toast({
        variant: "success",
        title: "Tags updated",
        description: `Tags for ${entityLabel} were saved.`,
      });
      onSaved(tags);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save tags",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Manage tags"
      description={`Choose tags from your organization catalog for ${entityLabel}.`}
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="manage-entity-tags-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save tags"
            )}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
            Selected
          </p>
          {selectedTagObjects.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedTagObjects.map((tag) => (
                <TagBadge key={tag.uuid} tag={tag} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-muted">No tags selected.</p>
          )}
        </div>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tags..."
          disabled={isLoading || isSaving}
        />

        <div className="space-y-3 rounded-md border border-brand-border p-2">
          <div className="min-h-56 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-brand-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              </div>
            ) : catalog.length === 0 ? (
              <p className="px-2 py-4 text-sm text-brand-muted">
                No tags found in the catalog.
              </p>
            ) : (
              catalog.map((tag) => {
                const checked = selected.includes(tag.uuid);
                return (
                  <label
                    key={tag.uuid}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-brand-tint/60"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-brand-border"
                      checked={checked}
                      onChange={() => toggleTag(tag)}
                      disabled={isSaving}
                    />
                    <TagBadge tag={tag} />
                  </label>
                );
              })
            )}
          </div>

          {totalCount > TAGS_PAGE_SIZE ? (
            <ListPagePagination
              page={page}
              pageSize={TAGS_PAGE_SIZE}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          ) : null}
        </div>
      </div>
    </SectionedDialog>
  );
}
