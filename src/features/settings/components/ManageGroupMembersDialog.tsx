"use client";

import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { UserIdenticon } from "@/components/UserIdenticon";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { portalGroupLabel } from "@/constants/portal-groups";
import { CustomerVisitSheetFooter } from "@/features/customers/components/detail/CustomerVisitSheetFooter";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { OrganizationUserPicker } from "@/features/settings/components/OrganizationUserPicker";
import {
  addUserToOrganizationGroup,
  fetchOrganizationGroup,
  removeUserFromOrganizationGroup,
} from "@/features/settings/services/user-management.service";
import type {
  OrganizationGroup,
  OrganizationGroupDetail,
  OrganizationUser,
} from "@/features/settings/types/settings.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const MEMBERS_PAGE_SIZE = 8;

type ManageGroupMembersDialogProps = {
  group: OrganizationGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManageGroupMembersDialog({
  group,
  open,
  onOpenChange,
}: ManageGroupMembersDialogProps) {
  const { toast } = useToast();
  const [groupDetail, setGroupDetail] = useState<OrganizationGroupDetail | null>(null);
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const groupLabel = portalGroupLabel(group.name);

  const loadGroup = useCallback(async () => {
    setIsLoading(true);

    try {
      const detail = await fetchOrganizationGroup(group.id);
      setGroupDetail({
        ...detail,
        users: detail.users ?? [],
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not load group members",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [group.id, toast]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedUser(null);
    setMemberSearch("");
    setMemberPage(1);
    setGroupDetail(null);
    void loadGroup();
  }, [group.id, loadGroup, open]);

  const memberIds = useMemo(
    () => groupDetail?.users.map((user) => user.id) ?? [],
    [groupDetail?.users],
  );

  const filteredMembers = useMemo(() => {
    const members = groupDetail?.users ?? [];
    const query = memberSearch.trim().toLowerCase();
    if (!query) {
      return members;
    }

    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query),
    );
  }, [groupDetail?.users, memberSearch]);

  const totalMemberPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / MEMBERS_PAGE_SIZE),
  );
  const currentMemberPage = Math.min(memberPage, totalMemberPages);

  const paginatedMembers = useMemo(() => {
    const start = (currentMemberPage - 1) * MEMBERS_PAGE_SIZE;
    return filteredMembers.slice(start, start + MEMBERS_PAGE_SIZE);
  }, [currentMemberPage, filteredMembers]);

  const handleAddMember = async () => {
    if (!selectedUser) {
      return;
    }

    setIsMutating(true);

    try {
      await addUserToOrganizationGroup({
        user_id: selectedUser.id,
        group_id: group.id,
      });
      setSelectedUser(null);
      await loadGroup();
      toast({
        variant: "success",
        title: "Member added",
        description: "The user was added to this group.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add member",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    setIsMutating(true);

    try {
      await removeUserFromOrganizationGroup({
        user_id: userId,
        group_id: group.id,
      });
      await loadGroup();
      toast({
        variant: "success",
        title: "Member removed",
        description: "The user was removed from this group.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not remove member",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsMutating(false);
    }
  };

  const memberCount = groupDetail?.users.length ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          appFont.className,
          "flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl",
        )}
        data-testid="manage-group-members-sheet"
      >
        <SheetHeader className="space-y-0 border-b border-dash-border/70 px-6 py-5 pr-14 text-left">
          <div className="flex items-center gap-3.5">
            <UserIdenticon
              seed={group.name}
              name={groupLabel}
              className="size-11 shrink-0 rounded-xl"
              fallbackClassName="text-sm font-semibold"
            />
            <div className="min-w-0">
              <SheetTitle className="text-sm font-medium text-dash-muted">
                Group members
              </SheetTitle>
              <p className="truncate text-base font-semibold tracking-tight text-brand-navy">
                {groupLabel}
              </p>
              <p className="mt-0.5 truncate text-sm text-dash-muted">
                Add or remove people in this group.
              </p>
            </div>
          </div>
          <SheetDescription className="sr-only">
            Add or remove users in the {groupLabel} group.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <OrganizationUserPicker
                user={selectedUser}
                onUserChange={setSelectedUser}
                excludeUserIds={memberIds}
                disabled={isLoading || isMutating}
                label="Add member"
                description="Search by name or email."
                id="group-add-member-select"
              />
            </div>
            <PrimaryButton
              type="button"
              className="shrink-0"
              onClick={() => void handleAddMember()}
              disabled={isLoading || isMutating || !selectedUser}
            >
              <UserPlus className="size-4" aria-hidden="true" />
              Add
            </PrimaryButton>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-brand-navy">Current members</p>
            <Input
              value={memberSearch}
              placeholder="Search members..."
              onChange={(event) => {
                setMemberSearch(event.target.value);
                setMemberPage(1);
              }}
              disabled={isLoading}
              data-testid="group-members-search"
            />

            {isLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-brand-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading members...
              </div>
            ) : groupDetail && filteredMembers.length > 0 ? (
              <div className="space-y-3">
                <ul className="divide-y divide-brand-border rounded-xl border border-brand-border">
                  {paginatedMembers.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-brand-navy">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-brand-muted">
                          {member.email}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {member.is_admin ? (
                          <Badge variant="secondary">Admin</Badge>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-brand-muted hover:text-red-600"
                          onClick={() => void handleRemoveMember(member.id)}
                          disabled={isMutating}
                        >
                          <UserMinus className="size-4" aria-hidden="true" />
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>

                {filteredMembers.length > MEMBERS_PAGE_SIZE ? (
                  <InventoryListPagination
                    page={currentMemberPage}
                    pageSize={MEMBERS_PAGE_SIZE}
                    totalCount={filteredMembers.length}
                    hasPrevious={currentMemberPage > 1}
                    hasNext={currentMemberPage < totalMemberPages}
                    onPageChange={setMemberPage}
                    isLoading={isMutating}
                  />
                ) : null}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-brand-border px-4 py-8 text-center text-sm text-brand-muted">
                {groupDetail && groupDetail.users.length > 0
                  ? "No members match your search."
                  : "No members in this group yet."}
              </p>
            )}
          </div>
        </div>

        <CustomerVisitSheetFooter
          recap={
            isLoading
              ? "Loading members"
              : `${memberCount} ${memberCount === 1 ? "member" : "members"}`
          }
        >
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Close
          </SecondaryButton>
        </CustomerVisitSheetFooter>
      </SheetContent>
    </Sheet>
  );
}
