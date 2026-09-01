import { SettingsWorkspaceLayout } from "@/features/settings/components/SettingsWorkspaceLayout";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsWorkspaceLayout>{children}</SettingsWorkspaceLayout>;
}
