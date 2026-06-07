"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { UserIdenticon } from "@/components/UserIdenticon";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { User } from "@/features/auth/types/auth.types";
import { updateProfile } from "@/features/settings/services/settings.service";
import { splitDisplayName } from "@/features/settings/utils/user-name";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type AccountProfileFormProps = {
  user: User;
};

export function AccountProfileForm({ user }: AccountProfileFormProps) {
  const { toast } = useToast();
  const { refreshUser } = useUser();
  const { firstName, lastName } = splitDisplayName(user.name);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName,
      lastName,
    },
  });

  useEffect(() => {
    const next = splitDisplayName(user.name);
    form.reset({
      firstName: next.firstName,
      lastName: next.lastName,
    });
  }, [form, user.name]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName ?? "",
      });
      await refreshUser();
      toast({
        variant: "success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      toast({
        variant: "error",
        description:
          error instanceof Error ? error.message : "Unable to update profile.",
      });
    }
  });

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex items-center gap-4 rounded-lg border border-brand-border bg-slate-50/70 p-4 lg:w-56 lg:flex-col lg:items-start">
        <UserIdenticon seed={user.email} name={user.name} className="size-14" />
        <div className="min-w-0 space-y-1">
          <p className="truncate font-medium text-brand-navy">{user.name || "User"}</p>
          <p className="truncate text-sm text-brand-muted">{user.email}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="flex-1 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormItem>
            <FormLabel>Email</FormLabel>
            <Input value={user.email} disabled readOnly />
            <p className="text-xs text-brand-muted">
              Email is managed by your administrator and cannot be changed here.
            </p>
          </FormItem>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
