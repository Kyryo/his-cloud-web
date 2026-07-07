"use client";

import {
  LandingFeatureInsuranceClaimVisual,
  LandingFeatureInventoryVisual,
  LandingFeatureProviderVisual,
  LandingFeatureRevenueVisual,
  LandingFeatureSchemeRulesVisual,
} from "@/features/brand/components/landing/LandingFeatureCardVisuals";
import {
  LandingFeatureGrid,
  LandingFeatureGridCard,
} from "@/features/brand/components/landing/LandingFeatureGridCard";
import { LandingSectionHeader } from "@/features/brand/components/landing/LandingSectionHeader";
import { LANDING_FEATURES } from "@/features/brand/constants/landing-home-content";
import { ROUTES } from "@/constants/routes";

/**
 * "Run your clinic with confidence" — Ramp-style feature card grid.
 */
export function LandingFeatureCardGrid() {
  return (
    <LandingFeatureGrid
      intro={
        <LandingSectionHeader
          title={LANDING_FEATURES.title}
          description={LANDING_FEATURES.description}
        />
      }
      closing={
        <p className="landing-body mx-auto max-w-3xl text-center text-base leading-relaxed text-[color:var(--landing-ledger-ink)] sm:text-lg">
          {LANDING_FEATURES.closing}
        </p>
      }
      primary={
        <>
          <LandingFeatureGridCard
            size="primary"
            headlineBold="End-to-end inventory management"
            headlineRest="from receiving to dispense, nothing goes missing"
            href={ROUTES.signup}
            mockup={<LandingFeatureInventoryVisual />}
          />
          <LandingFeatureGridCard
            size="primary"
            headlineBold="Insurance claims"
            headlineRest="without the chasing"
            href={ROUTES.signup}
            mockup={<LandingFeatureInsuranceClaimVisual />}
          />
        </>
      }
      secondary={
        <>
          <LandingFeatureGridCard
            size="secondary"
            headlineBold="Revenue"
            headlineRest="at a glance, every day"
            href={ROUTES.signup}
            mockup={<LandingFeatureRevenueVisual />}
          />
          <LandingFeatureGridCard
            size="secondary"
            headlineBold="Scheme rules"
            headlineRest="built in, so billing never has to guess"
            href={ROUTES.signup}
            mockup={<LandingFeatureSchemeRulesVisual />}
          />
          <LandingFeatureGridCard
            size="secondary"
            headlineBold="Provider performance"
            headlineRest="by doctor, nurse, or care provider"
            href={ROUTES.signup}
            mockup={<LandingFeatureProviderVisual />}
          />
        </>
      }
    />
  );
}
