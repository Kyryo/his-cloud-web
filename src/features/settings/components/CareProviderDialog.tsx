"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CareProviderRecord } from "@/features/care-providers/types/care-provider.types";
import { OrganizationUserPicker } from "@/features/settings/components/OrganizationUserPicker";
import type { ClinicalClinic } from "@/features/clinical/types/clinical-catalog.types";
import type { OrganizationUser } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

const careProviderFormSchema = z
  .object({
    displayName: z.string().trim().min(1, "Display name is required").max(255),
    linkExistingUser: z.boolean(),
    linkedUser: z.custom<OrganizationUser | null>(),
    createUserAccount: z.boolean(),
    inviteEmail: z.string().trim().email("Enter a valid email").or(z.literal("")),
    userRole: z.enum(["physician", "nurse"]),
    clinicIds: z.array(z.number().int().positive()),
    isActive: z.boolean(),
  })
  .superRefine((values, context) => {
    if (values.createUserAccount && !values.inviteEmail.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["inviteEmail"],
        message: "Email is required when creating a login account.",
      });
    }
    if (
      values.linkExistingUser &&
      values.createUserAccount
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["linkedUser"],
        message: "Choose either an existing user or a new account, not both.",
      });
    }
  });

type CareProviderFormValues = z.infer<typeof careProviderFormSchema>;

const defaultValues: CareProviderFormValues = {
  displayName: "",
  linkExistingUser: false,
  linkedUser: null,
  createUserAccount: false,
  inviteEmail: "",
  userRole: "physician",
  clinicIds: [],
  isActive: true,
};

type CareProviderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: CareProviderRecord | null;
  clinics: ClinicalClinic[];
  onSaved: (provider: CareProviderRecord) => void;
  onSubmit: (values: CareProviderFormValues) => Promise<CareProviderRecord>;
};

export function CareProviderDialog({
  open,
  onOpenChange,
  provider = null,
  clinics,
  onSaved,
  onSubmit,
}: CareProviderDialogProps) {
  const { toast } = useToast();
  const isEditing = provider != null;
  const form = useForm<CareProviderFormValues>({
    resolver: zodResolver(careProviderFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      return;
    }

    if (provider) {
      form.reset({
        displayName: provider.display_name,
        linkExistingUser: provider.provider_has_user,
        linkedUser: null,
        createUserAccount: false,
        inviteEmail: provider.user_email ?? "",
        userRole:
          provider.user_role === "nurse" ? "nurse" : "physician",
        clinicIds: provider.clinic_ids ?? [],
        isActive: provider.is_active,
      });
      return;
    }

    form.reset(defaultValues);
  }, [form, open, provider]);

  const isSubmitting = form.formState.isSubmitting;
  const linkExistingUser = form.watch("linkExistingUser");
  const createUserAccount = form.watch("createUserAccount");

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const saved = await onSubmit(values);
      toast({
        variant: "success",
        title: isEditing ? "Provider updated" : "Provider created",
        description: `${saved.display_name} is now available on sales orders.`,
      });
      onSaved(saved);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in defaultValues) {
            form.setError(field as keyof CareProviderFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: isEditing ? "Could not update provider" : "Could not create provider",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: isEditing ? "Could not update provider" : "Could not create provider",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit care provider" : "Add care provider"}</DialogTitle>
          <DialogDescription>
            Register clinicians for billing and clinical workflows. A user account is
            always created for each provider. Enable login to send an invitation email.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clinicIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinics</FormLabel>
                  <div className="space-y-2 rounded-md border border-brand-border bg-white p-3">
                    {clinics.length === 0 ? (
                      <p className="text-sm text-brand-muted">
                        No clinics found. Create a clinic first to assign providers.
                      </p>
                    ) : (
                      clinics.map((clinic) => {
                        const checked = field.value.includes(clinic.id);
                        return (
                          <label
                            key={clinic.id}
                            className="flex items-center gap-2 text-sm text-brand-foreground"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isSubmitting}
                              onChange={(event) => {
                                const next = event.target.checked
                                  ? Array.from(new Set([...field.value, clinic.id]))
                                  : field.value.filter((id) => id !== clinic.id);
                                field.onChange(next);
                              }}
                              className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                            />
                            <span>{clinic.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  <p className="text-xs text-brand-muted">
                    Providers can be assigned to one or more clinics. This controls
                    which clinics they appear under in pickers. For appointments, the
                    provider must be linked to a clinical user (login account) to be
                    assignable.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing ? (
              <>
                <FormField
                  control={form.control}
                  name="linkExistingUser"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            field.onChange(checked);
                            if (checked) {
                              form.setValue("createUserAccount", false);
                            }
                          }}
                          disabled={isSubmitting}
                          className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Link to an existing clinical user
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {linkExistingUser ? (
                  <FormField
                    control={form.control}
                    name="linkedUser"
                    render={({ field }) => (
                      <FormItem>
                        <OrganizationUserPicker
                          user={field.value}
                          onUserChange={field.onChange}
                          disabled={isSubmitting}
                          label="Clinical user"
                          description="Only physician and nurse users can be linked."
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="createUserAccount"
                  render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          field.onChange(checked);
                          if (checked) {
                            form.setValue("linkExistingUser", false);
                          }
                        }}
                        disabled={isSubmitting}
                        className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                      />
                    </FormControl>
                      <FormLabel className="font-normal">
                        Enable login and send invitation email
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {createUserAccount ? (
                  <>
                    <FormField
                      control={form.control}
                      name="inviteEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="userRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinical role</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="physician">Physician</SelectItem>
                              <SelectItem value="nurse">Nurse</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : null}
              </>
            ) : (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      disabled={isSubmitting}
                      className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                    />
                  </FormControl>
                    <FormLabel className="font-normal">Active</FormLabel>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Save changes"
                ) : (
                  "Add provider"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export type { CareProviderFormValues };
