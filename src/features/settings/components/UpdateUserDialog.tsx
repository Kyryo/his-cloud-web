"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdateUserClinicsPanel } from "@/features/settings/components/UpdateUserClinicsPanel";
import { UpdateUserLocationsPanel } from "@/features/settings/components/UpdateUserLocationsPanel";
import { UpdateUserTabLoader } from "@/features/settings/components/UpdateUserTabLoader";
import {
  ORGANIZATION_USER_ROLE_OPTIONS,
  toUpdateOrganizationUserPayload,
  toUpdateOrganizationUserRolePayload,
  updateOrganizationUserGeneralSchema,
  updateOrganizationUserRoleSchema,
  type UpdateOrganizationUserGeneralFormValues,
  type UpdateOrganizationUserRoleFormValues,
} from "@/features/settings/schemas/organization-user.schema";
import {
  fetchOrganizationUser,
  updateOrganizationUser,
} from "@/features/settings/services/user-management.service";
import type {
  OrganizationUser,
  OrganizationUserRole,
} from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type UpdateUserDialogProps = {
  user: OrganizationUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (user: OrganizationUser) => void;
};

type UpdateUserDialogTab = "general" | "role" | "clinics" | "locations";

const tabs = [
  { id: "general", label: "General" },
  { id: "role", label: "Role" },
  { id: "clinics", label: "Clinics" },
  { id: "locations", label: "Locations" },
] as const satisfies ReadonlyArray<{ id: UpdateUserDialogTab; label: string }>;

const UNASSIGNED_ROLE_VALUE = "__unassigned__";

function toGeneralFormValues(
  user: OrganizationUser,
): UpdateOrganizationUserGeneralFormValues {
  return {
    name: user.name,
    email: user.email,
    password: "",
  };
}

function toRoleFormValues(
  userRole: OrganizationUserRole | undefined,
): UpdateOrganizationUserRoleFormValues {
  return {
    user_role: userRole ?? "",
  };
}

export function UpdateUserDialog({
  user,
  open,
  onOpenChange,
  onUpdated,
}: UpdateUserDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<UpdateUserDialogTab>("general");
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<OrganizationUser>(user);

  const generalForm = useForm<UpdateOrganizationUserGeneralFormValues>({
    resolver: zodResolver(updateOrganizationUserGeneralSchema),
    defaultValues: toGeneralFormValues(user),
  });

  const roleForm = useForm<UpdateOrganizationUserRoleFormValues>({
    resolver: zodResolver(updateOrganizationUserRoleSchema),
    defaultValues: toRoleFormValues(user.user_role),
  });

  const loadUser = useCallback(async () => {
    setIsLoadingUser(true);

    try {
      const detail = await fetchOrganizationUser(user.id);
      setCurrentUser(detail);
      generalForm.reset(toGeneralFormValues(detail));
      roleForm.reset(toRoleFormValues(detail.user_role));
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not load user details",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsLoadingUser(false);
    }
  }, [generalForm, roleForm, toast, user.id]);

  useEffect(() => {
    if (open) {
      setActiveTab("general");
      setCurrentUser(user);
      generalForm.reset(toGeneralFormValues(user));
      roleForm.reset(toRoleFormValues(user.user_role));
      void loadUser();
    }
  }, [generalForm, loadUser, open, roleForm, user]);

  const refreshUserSummary = useCallback(async () => {
    try {
      const detail = await fetchOrganizationUser(user.id);
      setCurrentUser(detail);
      onUpdated(detail);
    } catch {
      // Keep existing list state if refresh fails after association changes.
    }
  }, [onUpdated, user.id]);

  const handleSaveGeneral = generalForm.handleSubmit(async (values) => {
    try {
      const updatedUser = await updateOrganizationUser(
        user.id,
        toUpdateOrganizationUserPayload(values),
      );
      setCurrentUser((current) => ({ ...current, ...updatedUser }));
      generalForm.reset(toGeneralFormValues(updatedUser));
      onUpdated(updatedUser);
      toast({
        variant: "success",
        title: "User updated",
        description: `${updatedUser.name}'s profile was saved.`,
      });
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          generalForm.setError(field as keyof UpdateOrganizationUserGeneralFormValues, {
            message,
          });
        }
        toast({
          variant: "error",
          title: "Could not update user",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update user",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const handleSaveRole = roleForm.handleSubmit(async (values) => {
    try {
      const updatedUser = await updateOrganizationUser(
        user.id,
        toUpdateOrganizationUserRolePayload(values),
      );
      setCurrentUser((current) => ({ ...current, ...updatedUser }));
      roleForm.reset(toRoleFormValues(updatedUser.user_role));
      onUpdated(updatedUser);
      toast({
        variant: "success",
        title: "Role updated",
        description: `${updatedUser.name}'s role was saved.`,
      });
    } catch (error) {
      if (error instanceof BffError) {
        toast({
          variant: "error",
          title: "Could not update role",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update role",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const isSaving =
    generalForm.formState.isSubmitting || roleForm.formState.isSubmitting;

  function renderFooter() {
    if (activeTab === "clinics" || activeTab === "locations") {
      return (
        <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
          Close
        </SecondaryButton>
      );
    }

    return (
      <>
        <SecondaryButton
          type="button"
          onClick={() => onOpenChange(false)}
          disabled={isSaving}
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          form={
            activeTab === "general"
              ? "update-user-general-form"
              : "update-user-role-form"
          }
          disabled={isSaving || isLoadingUser}
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </PrimaryButton>
      </>
    );
  }

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update user"
      description={`Manage profile, role, and access for ${currentUser.name}.`}
      tabs={[...tabs]}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (
          tabId === "general" ||
          tabId === "role" ||
          tabId === "clinics" ||
          tabId === "locations"
        ) {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="update-user-dialog"
      footer={renderFooter()}
    >
      {isLoadingUser &&
      (activeTab === "general" || activeTab === "role") ? (
        <UpdateUserTabLoader message="Loading user details..." />
      ) : null}

      {activeTab === "general" && !isLoadingUser ? (
        <Form {...generalForm}>
          <form
            id="update-user-general-form"
            className="space-y-4"
            onSubmit={(event) => void handleSaveGeneral(event)}
          >
            <FormField
              control={generalForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={generalForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={generalForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Leave blank to keep current"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      ) : null}

      {activeTab === "role" && !isLoadingUser ? (
        <Form {...roleForm}>
          <form
            id="update-user-role-form"
            className="space-y-4"
            onSubmit={(event) => void handleSaveRole(event)}
          >
            <FormField
              control={roleForm.control}
              name="user_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User role</FormLabel>
                  <Select
                    value={field.value === "" ? UNASSIGNED_ROLE_VALUE : field.value}
                    onValueChange={(value) =>
                      field.onChange(
                        value === UNASSIGNED_ROLE_VALUE
                          ? ""
                          : (value as OrganizationUserRole),
                      )
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ORGANIZATION_USER_ROLE_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value || UNASSIGNED_ROLE_VALUE}
                          value={
                            option.value === "" ? UNASSIGNED_ROLE_VALUE : option.value
                          }
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-brand-muted">
                    Defines the user&apos;s clinical or operational role in the
                    system.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      ) : null}

      {activeTab === "clinics" ? (
        <UpdateUserClinicsPanel
          userId={user.id}
          isActive={activeTab === "clinics"}
          onChanged={() => void refreshUserSummary()}
        />
      ) : null}

      {activeTab === "locations" ? (
        <UpdateUserLocationsPanel
          userId={user.id}
          isActive={activeTab === "locations"}
          onChanged={() => void refreshUserSummary()}
        />
      ) : null}
    </TabbedDialog>
  );
}
