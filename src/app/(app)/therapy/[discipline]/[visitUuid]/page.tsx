import { notFound } from "next/navigation";

import { TherapyVisitDetailPage } from "@/features/therapy/pages/TherapyVisitDetailPage";
import { isTherapyDiscipline } from "@/features/therapy/utils/therapy-access";

export default async function Page({
  params,
}: {
  params: Promise<{ discipline: string; visitUuid: string }>;
}) {
  const { discipline, visitUuid } = await params;

  if (!isTherapyDiscipline(discipline)) {
    notFound();
  }

  return (
    <TherapyVisitDetailPage
      discipline={discipline}
      visitUuid={visitUuid}
    />
  );
}
