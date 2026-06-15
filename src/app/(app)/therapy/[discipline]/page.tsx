import { notFound } from "next/navigation";

import { TherapyVisitsPage } from "@/features/therapy/pages/TherapyVisitsPage";
import { isTherapyDiscipline } from "@/features/therapy/utils/therapy-access";

export default async function Page({
  params,
}: {
  params: Promise<{ discipline: string }>;
}) {
  const { discipline } = await params;

  if (!isTherapyDiscipline(discipline)) {
    notFound();
  }

  return <TherapyVisitsPage discipline={discipline} />;
}
