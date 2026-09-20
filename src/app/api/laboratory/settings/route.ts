import { LABORATORY_API_PATHS } from "@/constants/laboratory-api";
import {
  getLaboratorySettingsHandler,
  putLaboratorySettingsHandler,
} from "@/lib/server/laboratory-catalog-bff";

export async function GET() {
  return getLaboratorySettingsHandler(LABORATORY_API_PATHS.settings);
}

export async function PUT(request: Request) {
  return putLaboratorySettingsHandler(request, LABORATORY_API_PATHS.settings);
}
