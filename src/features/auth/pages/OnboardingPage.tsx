"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

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
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to Sigma Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your account is ready. Continue to complete clinic setup and
            configuration.
          </p>
          <Button onClick={handleContinue} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  );
}
