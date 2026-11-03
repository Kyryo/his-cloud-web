import type { EmploymentEpisode } from "@/features/occupational-health/types";

/** Open employment episode that can drive OH COF/exam templates. */
export function isActiveEmploymentEpisode(
  episode: EmploymentEpisode,
  todayIso = new Date().toISOString().slice(0, 10),
): boolean {
  if (episode.is_active === false) {
    return false;
  }
  if (!episode.end_date) {
    return true;
  }
  return episode.end_date >= todayIso;
}

export function customerHasActiveRiskProfile(
  episodes: EmploymentEpisode[],
  todayIso = new Date().toISOString().slice(0, 10),
): boolean {
  return resolveActiveRiskProfileEpisode(episodes, todayIso) != null;
}

/** Most recent open employment episode that has a risk (hazard) profile. */
export function resolveActiveRiskProfileEpisode(
  episodes: EmploymentEpisode[],
  todayIso = new Date().toISOString().slice(0, 10),
): EmploymentEpisode | null {
  const matches = episodes
    .filter(
      (episode) =>
        isActiveEmploymentEpisode(episode, todayIso) &&
        episode.hazard_profile != null,
    )
    .sort((a, b) => b.start_date.localeCompare(a.start_date));
  return matches[0] ?? null;
}

export const OH_RISK_PROFILE_REQUIRED_MESSAGE =
  "Assign a risk profile on an active employment episode before starting an Occupational Health visit. This selects the COF and exam templates.";
