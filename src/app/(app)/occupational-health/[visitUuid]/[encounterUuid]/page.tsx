import { OhEncounterWorkspacePage } from "@/features/occupational-health/pages/OhEncounterWorkspacePage";

type PageProps = {
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { visitUuid, encounterUuid } = await params;
  return (
    <OhEncounterWorkspacePage
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
    />
  );
}
