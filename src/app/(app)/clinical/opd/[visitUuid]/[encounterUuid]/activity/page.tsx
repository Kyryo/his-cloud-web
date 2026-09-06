import { redirect } from "next/navigation";

type OpdEncounterActivityRedirectPageProps = {
  params: Promise<{
    visitUuid: string;
    encounterUuid: string;
  }>;
};

export default async function OpdEncounterActivityRedirectPage({
  params,
}: OpdEncounterActivityRedirectPageProps) {
  const { visitUuid, encounterUuid } = await params;
  redirect(`/clinical/opd/${visitUuid}/${encounterUuid}`);
}
