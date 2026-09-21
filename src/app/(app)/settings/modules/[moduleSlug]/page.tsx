import { notFound } from "next/navigation";

import { getModuleSettingsItemBySlug } from "@/features/settings/constants/module-settings-cards";
import { GenericModuleSettingsPage } from "@/features/settings/pages/GenericModuleSettingsPage";

type PageProps = {
  params: Promise<{ moduleSlug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { moduleSlug } = await params;
  const module = getModuleSettingsItemBySlug(moduleSlug);

  if (!module || module.hasSettings) {
    notFound();
  }

  return <GenericModuleSettingsPage module={module} />;
}
