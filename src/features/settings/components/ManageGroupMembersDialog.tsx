"use client";

import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addUserToOrganizationGroup,
  fetchOrganizationGroup,
  fetchOrganizationUsers,
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
  const [allUsers, setAllUsers] = useState<OrganizationUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const loadGroup = useCallback(async () => {
    setIsLoading(true);

    try {
      const [detail, usersResponse] = await Promise.all([
        fetchOrganizationGroup(group.id),
        fetchOrganizationUsers(),
      ]);
      setGroupDetail(detail);
      setAllUsers(usersResponse.results);
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
    if (open) {
      setSelectedUserId("");
      void loadGroup();
    }
  }, [loadGroup, open]);

  const availableUsers = useMemo(() => {
    const memberIds = new Set(groupDetail?.users.map((user) => user.id) ?? []);
    return allUsers.filter((user) => !memberIds.has(user.id) && user.is_active);
  }, [allUsers, groupDetail?.users]);

  const handleAddMember = async () => {
    const userId = Number.parseInt(selectedUserId, 10);

    if (!Number.isFinite(userId)) {
      return;
    }

    setIsMutating(true);

    try {
      await addUserToOrganizationGroup({
        user_id: userId,
        group_id: group.id,
      });
      setSelectedUserId("");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg", appFont.className)}
      >
        <DialogHeader className="border-b border-brand-border px-6 py-4">
          <DialogTitle>Manage members</DialogTitle>
          <DialogDescription>
            Add or remove users in the {group.name} group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-medium text-brand-navy">Add member</p>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                disabled={isLoading || isMutating || availableUsers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      availableUsers.length === 0
                        ? "No available users"
                        : "Select a user"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name} · {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <PrimaryButton
              type="button"
              className="shrink-0"
              onClick={() => void handleAddMember()}
              disabled={
                isLoading || isMutating || !selectedUserId || availableUsers.length === 0
              }
            >
              <UserPlus className="size-4" aria-hidden="true" />
              Add
            </PrimaryButton>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-brand-navy">Current members</p>

            {isLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-brand-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading members...
              </div>
            ) : groupDetail && groupDetail.users.length > 0 ? (
              <ul className="divide-y divide-brand-border rounded-xl border border-brand-border">
                {groupDetail.users.map((member) => (
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
            ) : (
              <p className="rounded-xl border border-dashed border-brand-border px-4 py-8 text-center text-sm text-brand-muted">
                No members in this group yet.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-brand-border px-6 py-4">
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Close
          </SecondaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
