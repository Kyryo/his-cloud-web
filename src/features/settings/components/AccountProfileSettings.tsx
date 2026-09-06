"use client";

import { Camera, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/features/auth/types/auth.types";
import { AccountAppointmentsSection } from "@/features/settings/components/AccountAppointmentsSection";
import { AccountAppointmentsReportsSection } from "@/features/settings/components/AccountAppointmentsReportsSection";
import { AccountSalesReportsSection } from "@/features/settings/components/AccountSalesReportsSection";
import { AssignedClinicsTable } from "@/features/settings/components/AssignedClinicsTable";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { updateProfile } from "@/features/settings/services/settings.service";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

const accountProfileSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required"),
  about: z.string().trim().max(500, "About must be 500 characters or fewer"),
  language: z.string().trim().min(1, "Select a language"),
  timezone: z.string().trim().min(1, "Select a timezone"),
});

type AccountProfileFormValues = z.infer<typeof accountProfileSchema>;

type StoredAccountPreferences = {
  about: string;
  language: string;
  timezone: string;
  avatarImage?: string | null;
};

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "pt", label: "Portuguese" },
  { value: "sw", label: "Swahili" },
] as const;

const TIMEZONE_OPTIONS = [
  { value: "Africa/Blantyre", label: "Africa / Blantyre (CAT)" },
  { value: "Africa/Johannesburg", label: "Africa / Johannesburg (SAST)" },
  { value: "Africa/Nairobi", label: "Africa / Nairobi (EAT)" },
  { value: "UTC", label: "UTC" },
] as const;

type AccountProfileSettingsProps = {
  user: User;
};

function preferencesStorageKey(userId: number) {
  return `hmis-account-preferences-${userId}`;
}

function defaultPreferences(): StoredAccountPreferences {
  return {
    about: "",
    language: "en",
    timezone: "Africa/Blantyre",
    avatarImage: null,
  };
}

function readStoredPreferences(userId: number): StoredAccountPreferences {
  if (typeof window === "undefined") {
    return defaultPreferences();
  }

  try {
    const raw = window.localStorage.getItem(preferencesStorageKey(userId));
    if (!raw) {
      return defaultPreferences();
    }
    return { ...defaultPreferences(), ...JSON.parse(raw) };
  } catch {
    return defaultPreferences();
  }
}

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

export function AccountProfileSettings({ user }: AccountProfileSettingsProps) {
  return <AccountProfileSettingsForm key={user.id} user={user} />;
}

function AccountProfileSettingsForm({ user }: AccountProfileSettingsProps) {
  const { toast } = useToast();
  const { refreshUser } = useUser();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const stored = readStoredPreferences(user.id);
  const [avatarImage, setAvatarImage] = useState<string | null>(
    stored.avatarImage ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AccountProfileFormValues>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: {
      displayName: user.name || "",
      about: stored.about,
      language: stored.language,
      timezone: stored.timezone,
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      const nextStored = readStoredPreferences(user.id);
      setAvatarImage(nextStored.avatarImage ?? null);
      form.reset({
        displayName: user.name || "",
        about: nextStored.about,
        language: nextStored.language,
        timezone: nextStored.timezone,
      });
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [form, user.id, user.name]);

  async function handleAvatarChange(file: File | undefined) {
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readImageFile(file);
      setAvatarImage(dataUrl);
    } catch (error) {
      toast({
        variant: "error",
        description:
          error instanceof Error ? error.message : "Could not load image.",
      });
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      const trimmedName = values.displayName.trim();
      const parts = trimmedName.split(/\s+/);
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ");

      await updateProfile({
        firstName,
        lastName,
      });

      const payload: StoredAccountPreferences = {
        about: values.about,
        language: values.language,
        timezone: values.timezone,
        avatarImage,
      };
      window.localStorage.setItem(
        preferencesStorageKey(user.id),
        JSON.stringify(payload),
      );

      await refreshUser();
      toast({
        variant: "success",
        description: "Your account settings have been saved.",
      });
    } catch (error) {
      toast({
        variant: "error",
        description:
          error instanceof Error ? error.message : "Unable to save account settings.",
      });
    } finally {
      setIsSaving(false);
    }
  });

  const displayName = user.name || "User";

  return (
    <div className="w-full" data-testid="account-profile-settings">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative shrink-0">
          {avatarImage ? (
            <div
              className="size-16 rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url(${avatarImage})` }}
              role="img"
              aria-label={`${displayName} avatar`}
            />
          ) : (
            <UserIdenticon
              seed={user.email}
              name={displayName}
              className="size-16 rounded-full text-base"
            />
          )}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute -bottom-1 -right-1 size-7 rounded-full bg-white text-brand-navy hover:bg-slate-50"
            onClick={() => avatarInputRef.current?.click()}
            aria-label="Upload avatar"
          >
            <Camera className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-brand-navy">
            {displayName}
          </p>
          <p className="truncate text-sm text-brand-muted">{user.email}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <SettingsPanelSection
            title="Basic information"
            description="Update how your name and profile details appear across the platform."
          >
            <div className="max-w-xl space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Display name
                      <RequiredFieldMarker />
                    </FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Tell your team a little about yourself."
                      />
                    </FormControl>
                    <p className="text-xs text-brand-muted">
                      Markdown is supported for basic formatting.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SettingsPanelSection>

          <AccountAppointmentsSection />

          <AccountAppointmentsReportsSection />

          <AccountSalesReportsSection />

          <SettingsPanelSection
            title="Preferences"
            description="Choose your language and timezone for dates and notifications."
          >
            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <FilterSelectField
                        id="account-language"
                        label=""
                        value={field.value}
                        options={[...LANGUAGE_OPTIONS]}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <FilterSelectField
                        id="account-timezone"
                        label=""
                        value={field.value}
                        options={[...TIMEZONE_OPTIONS]}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SettingsPanelSection>

          <SettingsPanelSection
            title="Assigned clinics"
            description="Clinics linked to your account and your role at each location."
          >
            <AssignedClinicsTable clinics={user.clinics ?? []} />
          </SettingsPanelSection>

          <div className="flex justify-end border-t border-brand-border pt-8">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleAvatarChange(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
