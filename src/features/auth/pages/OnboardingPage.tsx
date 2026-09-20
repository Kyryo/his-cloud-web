"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { AuthSplitLayout } from "@/features/auth/components/AuthSplitLayout";

function OnboardingContent() {
  const router = useRouter();

  useEffect(() => {
    const completed = sessionStorage.getItem("onboardingCompleted");
    if (completed === "true") {
      router.replace(ROUTES.home);
    }
  }, [router]);

  function handleContinue() {
    sessionStorage.setItem("onboardingCompleted", "true");
    router.push(ROUTES.home);
  }

  return (
    <AuthSplitLayout
      headline={"Your workspace is ready.\nLet's get to work."}
      subhead="One last step, then you can start using your clinic."
      imageSrc="/landing/hero-clinic-billing.jpg"
      imageAlt="A clinic finance officer reviewing claims and payments"
    >
      <h2 className="font-[family-name:var(--font-bricolage)] text-xl font-semibold tracking-[-0.02em] text-brand-navy sm:text-[1.5rem]">
        Welcome to Sigma Health
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">
        Your account is ready. Continue to complete clinic setup and
        configuration.
      </p>
      <Button
        onClick={handleContinue}
        className="mt-6 h-10 w-full rounded-full text-sm font-semibold"
      >
        Continue
      </Button>
    </AuthSplitLayout>
  );
}

export function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  );
}
