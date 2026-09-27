"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { UserIdenticon } from "@/components/UserIdenticon";
import { PasswordInput } from "@/components/password-input";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { CustomerVisitSheetFooter } from "@/features/customers/components/detail/CustomerVisitSheetFooter";
import { StartVisitChoiceRow } from "@/features/visits/components/StartVisitChoiceRow";
import { SettingsUnderlineTabs } from "@/features/settings/components/SettingsPageLayout";
import { UpdateUserClinicsPanel } from "@/features/settings/components/UpdateUserClinicsPanel";
import { UpdateUserLocationsPanel } from "@/features/settings/components/UpdateUserLocationsPanel";
import { UpdateUserSalesReportsPanel } from "@/features/settings/components/UpdateUserSalesReportsPanel";
import { UpdateUserTabLoader } from "@/features/settings/components/UpdateUserTabLoader";
import {
  ORGANIZATION_USER_ROLE_OPTIONS,
  formatOrganizationUserRole,
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
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdateUserDialogProps = {
  user: OrganizationUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (user: OrganizationUser) => void;
};

type UpdateUserDialogTab =
  | "general"
  | "role"
  | "clinics"
  | "locations"
  | "reports";

const TABS = [
  { id: "general", label: "General" },
  { id: "role", label: "Role" },
  { id: "clinics", label: "Clinics" },
  { id: "locations", label: "Locations" },
  { id: "reports", label: "Reports" },
] as const satisfies ReadonlyArray<{ id: UpdateUserDialogTab; label: string }>;

function toGeneralFormValues(
  user: OrganizationUser,
): UpdateOrganizationUserGeneralFormValues {
  return {
    name: user.name,
    email: user.email,
    password: "",
    is_admin: user.is_admin,
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

  function resetDialogState() {
    setActiveTab("general");
    setCurrentUser(user);
    generalForm.reset(toGeneralFormValues(user));
    roleForm.reset(toRoleFormValues(user.user_role));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      resetDialogState();
      void loadUser();
    }
    onOpenChange(nextOpen);
  }

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
          generalForm.setError(
            field as keyof UpdateOrganizationUserGeneralFormValues,
            { message },
          );
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

  const footerRecap = useMemo(() => {
    const parts = [
      currentUser.email,
      currentUser.is_admin
        ? "Administrator"
        : formatOrganizationUserRole(currentUser.user_role ?? ""),
    ].filter(Boolean);
    return parts.join(" · ");
  }, [currentUser.email, currentUser.is_admin, currentUser.user_role]);

  const headerMeta = useMemo(() => {
    const parts = [
      currentUser.email,
      currentUser.primary_clinic?.name ?? null,
    ].filter(Boolean);
    return parts.join(" · ");
  }, [currentUser.email, currentUser.primary_clinic?.name]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className={cn(
          appFont.className,
          "flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl",
        )}
        data-testid="update-user-dialog"
      >
        <SheetHeader className="space-y-0 border-b border-dash-border/70 px-6 py-5 pr-14 text-left">
          <div className="flex items-center gap-3.5">
            <UserIdenticon
              seed={currentUser.email || currentUser.name}
              name={currentUser.name}
              className="size-11 shrink-0 rounded-xl"
              fallbackClassName="text-sm font-semibold"
            />
            <div className="min-w-0">
              <SheetTitle className="text-sm font-medium text-dash-muted">
                Update user
              </SheetTitle>
              <p className="truncate text-base font-semibold tracking-tight text-brand-navy">
                {currentUser.name}
              </p>
              {headerMeta ? (
                <p className="mt-0.5 truncate text-sm text-dash-muted">
                  {headerMeta}
                </p>
              ) : null}
            </div>
          </div>
          <SheetDescription className="sr-only">
            Manage profile, role, and access for {currentUser.name}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-6">
            <SettingsUnderlineTabs
              tabs={[...TABS]}
              activeTab={activeTab}
              onChange={setActiveTab}
              ariaLabel="Update user sections"
            />
          </div>

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

                <FormField
                  control={generalForm.control}
                  name="is_admin"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-brand-border px-4 py-3">
                      <div className="space-y-1">
                        <FormLabel className="text-base">
                          Tenant administrator
                        </FormLabel>
                        <p className="text-xs text-brand-muted">
                          Administrators can manage users, groups, and
                          organization settings.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="update-user-is-admin-switch"
                        />
                      </FormControl>
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
                      <div
                        role="radiogroup"
                        aria-label="User role"
                        className="divide-y divide-dash-border/70"
                      >
                        {ORGANIZATION_USER_ROLE_OPTIONS.map((option) => (
                          <StartVisitChoiceRow
                            key={option.value || "unassigned"}
                            selected={field.value === option.value}
                            title={option.label}
                            onSelect={() => field.onChange(option.value)}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-brand-muted">
                        Defines the user&apos;s clinical or operational role in
                        the system.
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

          {activeTab === "reports" ? (
            <UpdateUserSalesReportsPanel
              userId={user.id}
              userName={currentUser.name}
              isActive={activeTab === "reports"}
              onChanged={() => void refreshUserSummary()}
            />
          ) : null}
        </div>

        <CustomerVisitSheetFooter recap={footerRecap}>
          {activeTab === "clinics" ||
          activeTab === "locations" ||
          activeTab === "reports" ? (
            <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
              Close
            </SecondaryButton>
          ) : (
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
          )}
        </CustomerVisitSheetFooter>
      </SheetContent>
    </Sheet>
  );
}
