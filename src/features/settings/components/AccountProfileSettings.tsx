"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { UserIdenticon } from "@/components/UserIdenticon";
import { FilterSelectField } from "@/components/filter-select-field";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/features/auth/types/auth.types";
import { SettingsFieldRow } from "@/features/settings/components/SettingsPageLayout";
import {
  clearProfileAvatar,
  updateProfile,
  uploadProfileAvatar,
} from "@/features/settings/services/settings.service";
import { splitDisplayName } from "@/features/settings/utils/user-name";
import {
  formatCurrentTime,
  formatTimezoneLabel,
  listTimezones,
} from "@/features/settings/utils/timezone-options";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

const DEFAULT_TIMEZONE = "Africa/Blantyre";

const accountProfileSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required"),
  about: z.string().trim().max(500, "About must be 500 characters or fewer"),
  language: z.literal("en"),
  timezone: z.string().trim().min(1, "Select a timezone"),
});

type AccountProfileFormValues = z.infer<typeof accountProfileSchema>;

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "French", disabled: true },
  { value: "pt", label: "Portuguese", disabled: true },
  { value: "sw", label: "Swahili", disabled: true },
] as const;

type AccountProfileSettingsProps = {
  user: User;
};

export function AccountProfileSettings({ user }: AccountProfileSettingsProps) {
  return <AccountProfileSettingsForm key={user.id} user={user} />;
}

function AccountProfileSettingsForm({ user }: AccountProfileSettingsProps) {
  const { toast } = useToast();
  const { refreshUser } = useUser();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [useGravatar, setUseGravatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearingAvatar, setIsClearingAvatar] = useState(false);
  const timezoneOptions = useMemo(
    () =>
      listTimezones().map((timeZone) => ({
        value: timeZone,
        label: formatTimezoneLabel(timeZone),
      })),
    [],
  );

  const form = useForm<AccountProfileFormValues>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: {
      displayName: user.name || "",
      about: user.about ?? "",
      language: "en",
      timezone: user.timezone || DEFAULT_TIMEZONE,
    },
  });

  const selectedTimezone = form.watch("timezone");

  useEffect(() => {
    form.reset({
      displayName: user.name || "",
      about: user.about ?? "",
      language: "en",
      timezone: user.timezone || DEFAULT_TIMEZONE,
    });
  }, [form, user.about, user.name, user.timezone]);

  useEffect(() => {
    if (!user.avatar_url) {
      setUseGravatar(false);
    }
  }, [user.avatar_url]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  function handleAvatarChange(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "error",
        description: "Profile photo must be an image.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "error",
        description: "Profile photo must be 5 MB or smaller.",
      });
      return;
    }

    setUseGravatar(false);
    setAvatarFile(file);
  }

  async function handleUseGravatar() {
    setIsClearingAvatar(true);
    setAvatarFile(null);
    setUseGravatar(true);
    try {
      await clearProfileAvatar();
      await refreshUser();
      toast({
        variant: "success",
        description: "Your profile photo now uses a gravatar.",
      });
    } catch (error) {
      setUseGravatar(false);
      toast({
        variant: "error",
        description:
          error instanceof Error
            ? error.message
            : "Unable to switch to a gravatar.",
      });
    } finally {
      setIsClearingAvatar(false);
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      const { firstName, lastName } = splitDisplayName(values.displayName.trim());
      await updateProfile({
        firstName,
        lastName,
        about: values.about,
        timezone: values.timezone,
      });

      if (avatarFile) {
        await uploadProfileAvatar(avatarFile);
        setAvatarFile(null);
      }

      await refreshUser();
      toast({
        variant: "success",
        description: "Your account settings have been saved.",
      });
    } catch (error) {
      toast({
        variant: "error",
        description:
          error instanceof Error
            ? error.message
            : "Unable to save account settings.",
      });
    } finally {
      setIsSaving(false);
    }
  });

  const displayName = user.name || "User";
  const hasUploadedPhoto = Boolean(user.avatar_url) && !useGravatar;
  const photoUrl = useGravatar ? null : avatarPreview || user.avatar_url || null;

  return (
    <div data-testid="account-profile-settings">
      <p className="max-w-xl text-sm text-slate-400">
        Your name and photo as they appear to your team, plus language and
        timezone.
      </p>

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-5">
          <SettingsFieldRow label="Photo">
            <div className="flex flex-wrap items-center gap-3">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={`${displayName} avatar`}
                  className="size-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <UserIdenticon
                  seed={user.email}
                  name={displayName}
                  className="size-12 rounded-full text-sm"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Upload avatar"
                disabled={isClearingAvatar}
              >
                Change photo
              </Button>
              {hasUploadedPhoto ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleUseGravatar()}
                  disabled={isClearingAvatar || isSaving}
                >
                  Use a gravatar
                </Button>
              ) : null}
            </div>
          </SettingsFieldRow>

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SettingsFieldRow
                  label={
                    <>
                      Display name
                      <RequiredFieldMarker />
                    </>
                  }
                >
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </SettingsFieldRow>
              </FormItem>
            )}
          />

          <SettingsFieldRow label="Email">
            <p>{user.email}</p>
            <p className="mt-1 text-sm text-slate-400">
              Managed by your administrator.
            </p>
          </SettingsFieldRow>

          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SettingsFieldRow label="About">
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Tell your team a little about yourself."
                    />
                  </FormControl>
                  <FormMessage />
                </SettingsFieldRow>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SettingsFieldRow label="Language">
                  <FormControl>
                    <FilterSelectField
                      id="account-language"
                      label=""
                      value={field.value}
                      options={[...LANGUAGE_OPTIONS]}
                      onValueChange={() => field.onChange("en")}
                    />
                  </FormControl>
                  <p className="mt-1 text-sm text-slate-400">
                    English is the only available language for now.
                  </p>
                  <FormMessage />
                </SettingsFieldRow>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SettingsFieldRow label="Timezone">
                  <FormControl>
                    <select
                      id="account-timezone"
                      aria-label="Timezone"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                    >
                      {timezoneOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <p className="mt-1 text-sm text-slate-400">
                    Current time: {formatCurrentTime(selectedTimezone)}
                  </p>
                  <FormMessage />
                </SettingsFieldRow>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="mt-5"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save profile"
            )}
          </Button>
        </form>
      </Form>

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          handleAvatarChange(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
