"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND_LOGO_SRC } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { AuthOtpStep } from "@/features/auth/components/AuthOtpStep";
import { MedicalIllustrations } from "@/features/auth/components/MedicalIllustrations";
import {
  isAccessTokenValid,
  markAuthenticatedSession,
  requestSigninOtp,
  verifySignin,
} from "@/features/auth/services/auth.service";
import {
  signinCredentialsSchema,
  signinOtpSchema,
  type SigninCredentialsValues,
  type SigninOtpValues,
} from "@/features/auth/schemas/login.schema";

type LoginStep = "credentials" | "otp";

export function LoginForm() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isDark = resolvedTheme === "dark";

  const credentialsForm = useForm<SigninCredentialsValues>({
    resolver: zodResolver(signinCredentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<SigninOtpValues>({
    resolver: zodResolver(signinOtpSchema),
    defaultValues: { email: "", code: "" },
  });

  useEffect(() => {
    async function redirectIfAuthenticated() {
      if (await isAccessTokenValid()) {
        router.replace(ROUTES.customers);
      }
    }

    void redirectIfAuthenticated();
  }, [router]);

  async function handleCredentialsSubmit(values: SigninCredentialsValues) {
    setSubmitError(null);

    try {
      await requestSigninOtp(values);
      const email = values.email.trim().toLowerCase();
      setPendingEmail(email);
      otpForm.setValue("email", email);
      otpForm.setValue("code", "");
      setOtpCode("");
      setStep("otp");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Sign in failed. Please try again.",
      );
    }
  }

  async function handleOtpSubmit(values: SigninOtpValues) {
    setSubmitError(null);

    try {
      await verifySignin(values);
      markAuthenticatedSession();
      router.push(ROUTES.customers);
    } catch (error) {
      setOtpCode("");
      otpForm.setValue("code", "");
      setSubmitError(
        error instanceof Error ? error.message : "Invalid verification code.",
      );
    }
  }

  async function handleResendOtp() {
    const password = credentialsForm.getValues("password");
    if (!pendingEmail || !password) {
      throw new Error("Session expired. Go back and enter your credentials again.");
    }

    await requestSigninOtp({
      email: pendingEmail,
      password,
    });
    setOtpCode("");
    otpForm.setValue("code", "");
    setSubmitError(null);
  }

  function handleBack() {
    setSubmitError(null);
    setOtpCode("");
    setStep("credentials");
  }

  function syncOtpCode(code: string) {
    setOtpCode(code);
    otpForm.setValue("code", code, { shouldValidate: code.length === 6 });
  }

  async function submitOtpIfReady(code: string) {
    if (otpForm.formState.isSubmitting) return;

    syncOtpCode(code);
    otpForm.setValue("email", pendingEmail);
    await otpForm.handleSubmit(handleOtpSubmit)();
  }

  const submitCredentials = credentialsForm.handleSubmit(handleCredentialsSubmit);
  const isSubmitting = otpForm.formState.isSubmitting;

  if (step === "otp") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
        <form
          className="w-full max-w-md"
          data-testid="login-otp-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <AuthOtpStep
            title="Check your email"
            description="If an account exists for this email, we've sent a verification code."
            email={pendingEmail}
            codeTestId="login-otp"
            code={otpCode}
            disabled={isSubmitting}
            error={submitError ?? otpForm.formState.errors.code?.message}
            onCodeChange={syncOtpCode}
            onCodeComplete={(code) => void submitOtpIfReady(code)}
            onResend={handleResendOtp}
            onBack={handleBack}
            submitLabel="Sign in"
            submittingLabel="Signing in..."
            submitTestId="login-submit"
            isSubmitting={isSubmitting}
            onSubmit={() => void otpForm.handleSubmit(handleOtpSubmit)()}
          />
        </form>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6 lg:px-8">
      <MedicalIllustrations isDark={isDark} />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src={BRAND_LOGO_SRC}
            alt="Sigma Health Logo"
            width={240}
            height={80}
            className="mx-auto h-[72px] w-auto rounded-sm object-contain sm:h-[80px]"
            priority
          />
        </div>

        <div className="space-y-8">
          <form
            method="post"
            className="space-y-6"
            data-testid="login-credentials-form"
            onSubmit={(event) => {
              event.preventDefault();
              void submitCredentials(event);
            }}
          >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    data-testid="login-email"
                    type="email"
                    autoComplete="email"
                    className="mt-1.5 h-11"
                    disabled={credentialsForm.formState.isSubmitting}
                    {...credentialsForm.register("email")}
                  />
                  {credentialsForm.formState.errors.email && (
                    <p className="mt-1.5 text-sm text-destructive">
                      {credentialsForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    data-testid="login-password"
                    type="password"
                    autoComplete="current-password"
                    className="mt-1.5 h-11"
                    disabled={credentialsForm.formState.isSubmitting}
                    {...credentialsForm.register("password")}
                  />
                  {credentialsForm.formState.errors.password && (
                    <p className="mt-1.5 text-sm text-destructive">
                      {credentialsForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {submitError && (
                <p role="alert" className="text-sm text-destructive">
                  {submitError}
                </p>
              )}

              <Button
                type="submit"
                data-testid="login-continue"
                className="h-11 w-full"
                disabled={credentialsForm.formState.isSubmitting}
              >
                {credentialsForm.formState.isSubmitting
                  ? "Sending code..."
                  : "Continue"}
              </Button>
            </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.signup}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
