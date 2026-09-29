"use client";

import { useOhHrFitness } from "@/features/occupational-health/hooks/use-occupational-health";
import type { EmploymentEpisode } from "@/features/occupational-health/types";

type OhHrFitnessSectionProps = {
  episodes: EmploymentEpisode[];
};

export function OhHrFitnessSection({ episodes }: OhHrFitnessSectionProps) {
  const activeEpisodes = episodes.filter((episode) => episode.is_active);

  if (activeEpisodes.length === 0) {
    return (
      <section className="rounded-xl border border-brand-border bg-white p-4">
        <h3 className="text-sm font-semibold text-brand-navy">HR fitness view</h3>
        <p className="mt-2 text-sm text-brand-muted">
          No active employment episodes to show HR-safe fitness data.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4" data-testid="oh-hr-fitness-section">
      <div>
        <h3 className="text-sm font-semibold text-brand-navy">HR fitness view</h3>
        <p className="text-xs text-brand-muted">
          Read-only fitness summaries safe for HR (no clinical narrative).
        </p>
      </div>
      {activeEpisodes.map((episode) => (
        <OhHrFitnessEpisodeBlock key={episode.uuid} episode={episode} />
      ))}
    </section>
  );
}

function OhHrFitnessEpisodeBlock({ episode }: { episode: EmploymentEpisode }) {
  const { data, isLoading, error } = useOhHrFitness(episode.uuid);

  return (
    <div className="rounded-xl border border-brand-border bg-white p-4">
      <p className="text-sm font-medium text-brand-navy">
        Episode {episode.employee_number || episode.uuid.slice(0, 8)}
      </p>
      {isLoading ? (
        <p className="mt-2 text-sm text-brand-muted">Loading HR fitness…</p>
      ) : error ? (
        <p className="mt-2 text-sm text-red-700">Could not load HR fitness.</p>
      ) : (data ?? []).length === 0 ? (
        <p className="mt-2 text-sm text-brand-muted">No HR fitness rows.</p>
      ) : (
        <ul className="mt-3 divide-y text-sm">
          {data?.map((row) => (
            <li key={row.assessment_uuid} className="py-2">
              <div className="font-medium capitalize">
                {row.outcome.replace(/_/g, " ")} · {row.assessed_at.slice(0, 10)}
              </div>
              {row.certificate ? (
                <p className="text-brand-muted">
                  Certificate {row.certificate.status} · valid{" "}
                  {row.certificate.valid_from}
                  {row.certificate.valid_to
                    ? ` → ${row.certificate.valid_to}`
                    : ""}
                </p>
              ) : null}
              {row.restrictions.length > 0 ? (
                <p className="text-brand-muted">
                  Restrictions:{" "}
                  {row.restrictions.map((item) => item.description).join("; ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
