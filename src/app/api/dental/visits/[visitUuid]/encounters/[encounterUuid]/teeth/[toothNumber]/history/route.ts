import { NextResponse } from "next/server";

import { CLINICAL_DENTAL_API_PATHS } from "@/constants/clinical-dental-api";
import type { DentalToothHistory } from "@/features/clinical-dental/types/clinical-dental.types";
import { handleClinicalObjectGet } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string; toothNumber: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, toothNumber } = await context.params;
  const tooth = Number.parseInt(toothNumber, 10);
  if (!Number.isInteger(tooth) || tooth <= 0) {
    return NextResponse.json({ message: "Invalid tooth number." }, { status: 400 });
  }
  return handleClinicalObjectGet<DentalToothHistory>(
    request,
    CLINICAL_DENTAL_API_PATHS.toothHistory(visitUuid, encounterUuid, tooth),
  );
}
