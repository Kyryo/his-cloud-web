"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";

import { PasswordInput } from "@/components/password-input";
import { StatusBanner } from "@/components/ui/status-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND_LOGO_SRC } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { AuthOtpStep } from "@/features/auth/components/AuthOtpStep";
import { LoginMfaMethodPicker, hasAlternateMfaMethods } from "@/features/auth/components/LoginMfaMethodPicker";
import { LoginRecoveryStep } from "@/features/auth/components/LoginRecoveryStep";
import { LoginTotpStep } from "@/features/auth/components/LoginTotpStep";
import { LoginWebAuthnStep } from "@/features/auth/components/LoginWebAuthnStep";
import { MedicalIllustrations } from "@/features/auth/components/MedicalIllustrations";
import {
  isAccessTokenValid,
  getCurrentUser,
  markAuthenticatedSession,
  requestSigninOtp,
  sendSigninEmailOtp,
  requestSigninWebAuthnOptions,
  verifySignin,
  verifySigninRecovery,
  verifySigninTotp,
  verifySigninWebAuthn,
} from "@/features/auth/services/auth.service";
import {
  signinCredentialsSchema,
  signinOtpSchema,
  type SigninCredentialsValues,
  type SigninOtpValues,
} from "@/features/auth/schemas/login.schema";
import type { MfaSigninMethod, User } from "@/features/auth/types/auth.types";
import {
  getWebAuthnAssertion,
  webAuthnErrorMessage,
} from "@/features/auth/utils/webauthn";

type LoginStep =
  | "credentials"
  | "otp"
  | "methods"
  | "totp"
  | "webauthn"
  | "recovery";

function loginStepForMethod(method: MfaSigninMethod): LoginStep {
  if (method === "email") return "otp";
  if (method === "recovery_codes") return "recovery";
  return method;
}

function destinationForUser(user: User): string {
  return user.is_superuser && user.tenant === null
    ? ROUTES.platformAdmin
    : ROUTES.customers;
}

export function LoginForm() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingMfaToken, setPendingMfaToken] = useState("");
  const [methods, setMethods] = useState<MfaSigninMethod[]>(["email"]);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAlternateSubmitting, setIsAlternateSubmitting] = useState(false);
  const [pickerFrom, setPickerFrom] = useState<MfaSigninMethod>("email");
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
        const user = await getCurrentUser();
        router.replace(
          user?.is_superuser && user.tenant === null
            ? ROUTES.platformAdmin
            : ROUTES.customers,
        );
      }
    }

    void redirectIfAuthenticated();
  }, [router]);

  async function handleCredentialsSubmit(values: SigninCredentialsValues) {
    setSubmitError(null);

    try {
      const challenge = await requestSigninOtp(values);
      const email = values.email.trim().toLowerCase();
      setPendingEmail(email);
      setPendingMfaToken(challenge.pending_mfa_token);
      setMethods(challenge.methods);
      setEmailOtpSent(challenge.email_otp_sent);
      otpForm.setValue("email", email);
      otpForm.setValue("code", "");
      setOtpCode("");
      const preferred = challenge.methods.includes(challenge.preferred_method)
        ? challenge.preferred_method
        : "email";
      setPickerFrom(preferred);
      setStep(loginStepForMethod(preferred));
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Sign in failed. Please try again.",
      );
    }
  }

  async function handleOtpSubmit(values: SigninOtpValues) {
    setSubmitError(null);

    try {
      const result = await verifySignin({
        ...values,
        pending_mfa_token: pendingMfaToken,
      });
      markAuthenticatedSession();
      router.push(destinationForUser(result.user));
    } catch (error) {
      setOtpCode("");
      otpForm.setValue("code", "");
      setSubmitError(
        error instanceof Error ? error.message : "Invalid verification code.",
      );
    }
  }

  async function handleResendOtp() {
    if (!pendingMfaToken) {
      throw new Error("Session expired. Go back and enter your credentials again.");
    }

    await sendSigninEmailOtp({ pending_mfa_token: pendingMfaToken });
    setEmailOtpSent(true);
    setOtpCode("");
    otpForm.setValue("code", "");
    setSubmitError(null);
  }

  async function selectSigninMethod(method: MfaSigninMethod) {
    setSubmitError(null);
    if (method === "email" && !emailOtpSent) {
      try {
        await sendSigninEmailOtp({ pending_mfa_token: pendingMfaToken });
        setEmailOtpSent(true);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Unable to send a verification code.",
        );
        return;
      }
    }
    setPickerFrom(method);
    setStep(loginStepForMethod(method));
  }

  function handleBack() {
    setSubmitError(null);
    setOtpCode("");
    setTotpCode("");
    setRecoveryCode("");
    setPendingMfaToken("");
    setMethods(["email"]);
    setEmailOtpSent(false);
    setPickerFrom("email");
    setStep("credentials");
  }

  async function completeAlternateSignin(user: User) {
    markAuthenticatedSession();
    router.push(destinationForUser(user));
  }

  async function handleTotpSubmit(code = totpCode) {
    if (isAlternateSubmitting) return;
    setSubmitError(null);
    setIsAlternateSubmitting(true);
    try {
      const result = await verifySigninTotp({
        pending_mfa_token: pendingMfaToken,
        code,
      });
      await completeAlternateSignin(result.user);
    } catch (error) {
      setTotpCode("");
      setSubmitError(
        error instanceof Error ? error.message : "Incorrect authenticator code.",
      );
    } finally {
      setIsAlternateSubmitting(false);
    }
  }

  async function handleRecoverySubmit() {
    setSubmitError(null);
    setIsAlternateSubmitting(true);
    try {
      const result = await verifySigninRecovery({
        pending_mfa_token: pendingMfaToken,
        code: recoveryCode,
      });
      await completeAlternateSignin(result.user);
    } catch (error) {
      setRecoveryCode("");
      setSubmitError(
        error instanceof Error ? error.message : "Incorrect recovery code.",
      );
    } finally {
      setIsAlternateSubmitting(false);
    }
  }

  async function handleWebAuthnVerify() {
    setSubmitError(null);
    setIsAlternateSubmitting(true);
    try {
      const { request_options: requestOptions } = await requestSigninWebAuthnOptions({
        pending_mfa_token: pendingMfaToken,
      });
      const credential = await getWebAuthnAssertion(requestOptions);
      const result = await verifySigninWebAuthn({
        pending_mfa_token: pendingMfaToken,
        credential,
      });
      await completeAlternateSignin(result.user);
    } catch (error) {
      setSubmitError(webAuthnErrorMessage(error));
    } finally {
      setIsAlternateSubmitting(false);
    }
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
  const isSubmitting = otpForm.formState.isSubmitting || isAlternateSubmitting;
  const showAlternateLink = hasAlternateMfaMethods(methods);

  function tryAnotherMethodLink(from: MfaSigninMethod) {
    if (!showAlternateLink) return null;
    return (
      <div className="mt-4 text-center">
        <button
          type="button"
          data-testid="login-try-another-method"
          disabled={isSubmitting}
          onClick={() => {
            setSubmitError(null);
            setPickerFrom(from);
            setStep("methods");
          }}
          className="text-sm text-brand-muted transition-colors hover:text-brand-navy hover:underline disabled:opacity-50"
        >
          Try another method
        </button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
        <div className="w-full max-w-md">
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
          {tryAnotherMethodLink("email")}
        </div>
      </div>
    );
  }

  if (step === "methods") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
        <div className="w-full max-w-md">
          {submitError ? (
            <StatusBanner variant="error" message={submitError} className="mb-4" />
          ) : null}
          <LoginMfaMethodPicker
            methods={methods}
            currentMethod={pickerFrom}
            disabled={isSubmitting}
            onSelect={(method) => {
              void selectSigninMethod(method);
            }}
            onBack={() => setStep(loginStepForMethod(pickerFrom))}
          />
        </div>
      </div>
    );
  }

  if (step === "totp") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
        <div className="w-full max-w-md">
          <LoginTotpStep
            code={totpCode}
            error={submitError ?? undefined}
            disabled={isSubmitting}
            isSubmitting={isSubmitting}
            onCodeChange={setTotpCode}
            onCodeComplete={(code) => {
              setTotpCode(code);
              if (code.length === 6) {
                void handleTotpSubmit(code);
              }
            }}
            onSubmit={() => void handleTotpSubmit()}
            onBack={() => setStep("methods")}
          />
          {tryAnotherMethodLink("totp")}
        </div>
      </div>
    );
  }

  if (step === "recovery") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
        <div className="w-full max-w-md">
          <LoginRecoveryStep
            code={recoveryCode}
            error={submitError ?? undefined}
            disabled={isSubmitting}
            isSubmitting={isSubmitting}
            onCodeChange={setRecoveryCode}
            onSubmit={() => void handleRecoverySubmit()}
            onBack={() => setStep("methods")}
          />
          {tryAnotherMethodLink("recovery_codes")}
        </div>
      </div>
    );
  }

  if (step === "webauthn") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
        <div className="w-full max-w-md">
          <LoginWebAuthnStep
            error={submitError ?? undefined}
            isSubmitting={isSubmitting}
            onVerify={() => void handleWebAuthnVerify()}
            onBack={() => setStep("methods")}
          />
          {tryAnotherMethodLink("webauthn")}
        </div>
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
            className="mx-auto h-[88px] w-auto rounded-sm object-contain sm:h-[96px]"
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
                  <PasswordInput
                    id="password"
                    data-testid="login-password"
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

              {submitError ? (
                <StatusBanner variant="error" message={submitError} />
              ) : null}

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
