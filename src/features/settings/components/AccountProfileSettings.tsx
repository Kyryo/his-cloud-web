"use client";

import { Camera, ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { UserIdenticon } from "@/components/UserIdenticon";
import { FilterSelectField } from "@/components/filter-select-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { AssignedClinicsTable } from "@/features/settings/components/AssignedClinicsTable";
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
  coverImage?: string | null;
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

function readStoredPreferences(userId: number): StoredAccountPreferences {
  if (typeof window === "undefined") {
    return {
      about: "",
      language: "en",
      timezone: "Africa/Blantyre",
      coverImage: null,
      avatarImage: null,
    };
  }

  try {
    const raw = window.localStorage.getItem(preferencesStorageKey(userId));
    if (!raw) {
      return {
        about: "",
        language: "en",
        timezone: "Africa/Blantyre",
        coverImage: null,
        avatarImage: null,
      };
    }
    return JSON.parse(raw) as StoredAccountPreferences;
  } catch {
    return {
      about: "",
      language: "en",
      timezone: "Africa/Blantyre",
      coverImage: null,
      avatarImage: null,
    };
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
  const { toast } = useToast();
  const { refreshUser } = useUser();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AccountProfileFormValues>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: {
      displayName: user.name || "",
      about: "",
      language: "en",
      timezone: "Africa/Blantyre",
    },
  });

  useEffect(() => {
    const stored = readStoredPreferences(user.id);
    setCoverImage(stored.coverImage ?? null);
    setAvatarImage(stored.avatarImage ?? null);
    form.reset({
      displayName: user.name || "",
      about: stored.about,
      language: stored.language,
      timezone: stored.timezone,
    });
  }, [form, user.id, user.name]);

  async function handleImageChange(
    file: File | undefined,
    setter: (value: string | null) => void,
  ) {
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readImageFile(file);
      setter(dataUrl);
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
        coverImage,
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

  const displayName = form.watch("displayName") || user.name || "User";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6" data-testid="account-profile-settings">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">Account</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Manage your profile, preferences, and clinic access.
        </p>
      </div>

      <Card className="overflow-hidden border-brand-border shadow-sm">
        <div className="relative">
          <div
            className="relative h-40 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 sm:h-48"
            style={
              coverImage
                ? {
                    backgroundImage: `url(${coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="bg-white/90 text-brand-navy hover:bg-white"
                onClick={() => coverInputRef.current?.click()}
              >
                <ImageIcon className="size-4" aria-hidden="true" />
                Change cover
              </Button>
              {coverImage ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 text-brand-navy hover:bg-white"
                  onClick={() => setCoverImage(null)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <div className="relative px-6 pb-6 pt-0">
            <div className="absolute -top-12 left-6">
              <div className="relative">
                <div className="rounded-full border-4 border-white bg-white shadow-sm">
                  {avatarImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarImage}
                      alt=""
                      className="size-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserIdenticon
                      seed={user.email}
                      name={displayName}
                      className="size-24 rounded-full text-base"
                    />
                  )}
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 size-8 rounded-full border border-brand-border bg-white shadow-sm"
                  onClick={() => avatarInputRef.current?.click()}
                  aria-label="Upload avatar"
                >
                  <Camera className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="pt-16">
              <h2 className="text-lg font-semibold text-brand-navy">{displayName}</h2>
              <p className="text-sm text-brand-muted">{user.email}</p>
            </div>
          </div>
        </div>
      </Card>

      <Form {...form}>
        <form className="space-y-6" onSubmit={onSubmit}>
          <Card className="border-brand-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Basic information</CardTitle>
              <CardDescription>
                Update how your name and profile details appear across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
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
            </CardContent>
          </Card>

          <AccountAppointmentsSection />

          <Card className="border-brand-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Preferences</CardTitle>
              <CardDescription>
                Choose your language and timezone for dates and notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
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
            </CardContent>
          </Card>

          <Card className="border-brand-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Assigned clinics</CardTitle>
              <CardDescription>
                Clinics linked to your account and your role at each location.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssignedClinicsTable clinics={user.clinics ?? []} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
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
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleImageChange(event.target.files?.[0], setCoverImage);
          event.target.value = "";
        }}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleImageChange(event.target.files?.[0], setAvatarImage);
          event.target.value = "";
        }}
      />
    </div>
  );
}
