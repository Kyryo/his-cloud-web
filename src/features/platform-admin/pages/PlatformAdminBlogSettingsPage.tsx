"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes";
import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import {
  fetchBlogSettings,
  saveBlogSettings,
  uploadBlogImage,
} from "@/features/platform-admin/services/blog-cms.service";
import type { BlogSiteSettings } from "@/features/platform-admin/types/blog.types";
import { useToast } from "@/providers/toast-provider";

export function PlatformAdminBlogSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BlogSiteSettings>({ social: [] });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void fetchBlogSettings()
      .then((data) => {
        setSettings({ ...data, social: data.social || [] });
        setLoaded(true);
      })
      .catch((error) =>
        toast({
          variant: "error",
          title: "Unable to load settings",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        }),
      );
  }, [toast]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await saveBlogSettings(settings);
      setSettings(saved);
      toast({ variant: "success", title: "Settings saved" });
    } catch (error) {
      toast({
        variant: "error",
        title: "Save failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ListPageLayout data-testid="platform-admin-blog-settings">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Blog site settings"
            description="SEO, branding, and contact details for the public blog."
          />
          <Button asChild variant="outline">
            <Link href={ROUTES.platformAdminBlog}>Hub</Link>
          </Button>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageTableSection>
        {!loaded ? (
          <p className="text-sm text-brand-muted">Loading…</p>
        ) : (
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="mx-auto max-w-2xl space-y-4 rounded-xl border border-brand-border bg-white p-4"
          >
            {(
              [
                ["title", "Site title"],
                ["url", "Site URL"],
                ["copyright", "Copyright"],
                ["email", "Support email"],
                ["phone", "Support phone"],
                ["w3ckey", "Web3Forms key"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  value={(settings[key] as string | undefined) || ""}
                  onChange={(e) =>
                    setSettings((current) => ({
                      ...current,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Meta description</Label>
              <Textarea
                rows={4}
                value={settings.description || ""}
                onChange={(e) =>
                  setSettings((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            {(
              [
                ["logoUrl", "Logo URL"],
                ["logoAltUrl", "Alternate logo URL"],
                ["openGraphImageUrl", "Open Graph image URL"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={(settings[key] as string | null | undefined) || ""}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        [key]: e.target.value,
                      }))
                    }
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        return;
                      }
                      void uploadBlogImage(file, "settings").then((uploaded) =>
                        setSettings((current) => ({
                          ...current,
                          [key]: uploaded.url,
                        })),
                      );
                    }}
                  />
                </div>
              </div>
            ))}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Social links</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      social: [
                        ...(current.social || []),
                        { media: "twitter", url: "" },
                      ],
                    }))
                  }
                >
                  Add link
                </Button>
              </div>
              <div className="space-y-2">
                {(settings.social || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={item.media}
                      onChange={(e) => {
                        const media = e.target.value;
                        setSettings((current) => ({
                          ...current,
                          social: (current.social || []).map((row, i) =>
                            i === index ? { ...row, media } : row,
                          ),
                        }));
                      }}
                      className="rounded-md border border-brand-border px-2 text-sm"
                    >
                      {["twitter", "facebook", "instagram", "linkedin", "youtube"].map(
                        (media) => (
                          <option key={media} value={media}>
                            {media}
                          </option>
                        ),
                      )}
                    </select>
                    <Input
                      value={item.url}
                      onChange={(e) => {
                        const url = e.target.value;
                        setSettings((current) => ({
                          ...current,
                          social: (current.social || []).map((row, i) =>
                            i === index ? { ...row, url } : row,
                          ),
                        }));
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSettings((current) => ({
                          ...current,
                          social: (current.social || []).filter(
                            (_, i) => i !== index,
                          ),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </form>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}
