"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { CountrySelectField } from "@/components/country-select-field";
import { Button } from "@/components/ui/button";
import { StatusBanner } from "@/components/ui/status-banner";
import { ROUTES } from "@/constants/routes";
import { AuthWizardShell, type AuthWizardStep } from "@/features/auth/components/AuthWizardShell";
import {
  FloatingLabelInput,
  FloatingLabelPasswordInput,
} from "@/features/auth/components/FloatingLabelField";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { SignupEmailConfirmStep } from "@/features/auth/components/SignupEmailConfirmStep";
import {
  DEFAULT_SIGNUP_MODULE_IDS,
  moduleIdsToGroupNames,
} from "@/features/auth/constants/onboarding-modules";
import {
  markAuthenticatedSession,
  requestSignupOtp,
  verifySignup,
  verifySignupEmail,
} from "@/features/auth/services/auth.service";
import { configureOnboardingModules } from "@/features/auth/services/onboarding.service";
import {
  signupCredentialsSchema,
  signupOtpSchema,
  signupProfileSchema,
  type SignupCredentialsValues,
  type SignupOtpValues,
  type SignupProfileValues,
} from "@/features/auth/schemas/signup.schema";

type SignupStep = 1 | 2 | 3;

const WIZARD_STEPS: AuthWizardStep[] = [
  { number: 1, label: "Clinic" },
  { number: 2, label: "Account" },
  { number: 3, label: "Verify" },
];

const STEP_COPY = {
  1: {
    title: "Tell us about your clinic",
    subtitle:
      "A few details so we can set up the right workspace for your team.",
  },
  2: {
    title: "Create your account",
    subtitle: "Add your details and work email. You'll confirm it next.",
  },
  3: {
    title: "Confirm your email",
    subtitle:
      "We sent a 6-digit code to your inbox. Enter it below to verify ownership.",
  },
} as const;

const DEFAULT_SIGNUP_GROUPS = moduleIdsToGroupNames([...DEFAULT_SIGNUP_MODULE_IDS]);


function WizardFooter({
  onBack,
  backLabel = "Back",
  continueLabel,
  continueTestId,
  onContinue,
  isBusy,
  continueDisabled,
  continueType = "button",
  formId,
}: {
  onBack?: () => void;
  backLabel?: string;
  continueLabel: string;
  continueTestId: string;
  onContinue?: () => void;
  isBusy?: boolean;
  continueDisabled?: boolean;
  continueType?: "button" | "submit";
  formId?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          className="h-11 gap-1.5 px-3 text-brand-muted hover:bg-transparent hover:text-brand-navy"
          onClick={onBack}
          disabled={isBusy}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Button>
      ) : (
        <span />
      )}
      <Button
        type={continueType}
        form={formId}
        data-testid={continueTestId}
        className="h-11 min-w-[9.5rem] gap-1.5 rounded-full bg-brand-primary px-5 text-[15px] font-semibold hover:bg-brand-primary-hover"
        onClick={continueType === "button" ? onContinue : undefined}
        disabled={isBusy || continueDisabled}
        aria-busy={isBusy}
      >
        {isBusy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Working…
          </span>
        ) : (
          <>
            {continueLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </>
        )}
      </Button>
    </div>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const clinicInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const credentialsForm = useForm<SignupCredentialsValues>({
    resolver: zodResolver(signupCredentialsSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const profileForm = useForm<SignupProfileValues>({
    resolver: zodResolver(signupProfileSchema),
    defaultValues: { name: "", clinic_name: "", country: "Malawi" },
    mode: "onBlur",
  });

  const otpForm = useForm<SignupOtpValues>({
    resolver: zodResolver(signupOtpSchema),
    defaultValues: { code: "" },
  });

  const signupEmail = credentialsForm.watch("email");
  const passwordValue = credentialsForm.watch("password");
  const countryValue = profileForm.watch("country") ?? "";
  const stepCopy = STEP_COPY[currentStep];
  const isSubmitting =
    credentialsForm.formState.isSubmitting || isFinalizing;

  useEffect(() => {
    if (currentStep === 1) {
      clinicInputRef.current?.focus();
    }
    if (currentStep === 2) {
      nameInputRef.current?.focus();
    }
  }, [currentStep]);

  async function handleClinicContinue() {
    setSubmitError(null);

    const profileValid = await profileForm.trigger(["clinic_name", "country"]);
    if (!profileValid) return;
    setCurrentStep(2);
  }

  async function handleAccountContinue() {
    setSubmitError(null);

    const [credentialsValid, nameValid] = await Promise.all([
      credentialsForm.trigger(),
      profileForm.trigger("name"),
    ]);
    if (!credentialsValid || !nameValid) return;

    const values = credentialsForm.getValues();

    try {
      await requestSignupOtp({
        email: values.email,
        password: values.password,
      });
      setOtpCode("");
      otpForm.setValue("code", "");
      setCurrentStep(3);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not start sign up.",
      );
    }
  }

  function syncOtpCode(code: string) {
    setOtpCode(code);
    otpForm.setValue("code", code, { shouldValidate: code.length === 6 });
  }

  async function handleVerifyAndCreateWorkspace() {
    if (isFinalizing) return;
    setSubmitError(null);

    const credentialsValid = await credentialsForm.trigger();
    const profileValid = await profileForm.trigger();
    const otpValid = await otpForm.trigger();

    if (!profileValid) {
      setCurrentStep(1);
      return;
    }
    if (!credentialsValid) {
      setCurrentStep(2);
      return;
    }
    if (!otpValid) return;

    const credentials = credentialsForm.getValues();
    const profile = profileForm.getValues();
    const otp = otpForm.getValues();

    setIsFinalizing(true);
    try {
      const verified = await verifySignupEmail({
        email: credentials.email,
        password: credentials.password,
        code: otp.code,
      });

      await verifySignup({
        email: credentials.email,
        password: credentials.password,
        name: profile.name,
        clinic_name: profile.clinic_name,
        country: profile.country?.trim() || undefined,
        verification_token: verified.verification_token,
      });
      await configureOnboardingModules(DEFAULT_SIGNUP_GROUPS);
      markAuthenticatedSession();
      router.push(ROUTES.customers);
    } catch (error) {
      setOtpCode("");
      otpForm.setValue("code", "");
      setSubmitError(
        error instanceof Error ? error.message : "Sign up failed. Please try again.",
      );
    } finally {
      setIsFinalizing(false);
    }
  }

  async function handleResendOtp() {
    const credentials = credentialsForm.getValues();
    if (!credentials.email || !credentials.password) {
      throw new Error("Session expired. Go back and enter your credentials again.");
    }

    const response = await requestSignupOtp({
      email: credentials.email,
      password: credentials.password,
    });
    setOtpCode("");
    otpForm.setValue("code", "");
    setSubmitError(null);
    return response;
  }

  const clinicRegister = profileForm.register("clinic_name");
  const nameRegister = profileForm.register("name");
  const emailRegister = credentialsForm.register("email");
  const passwordRegister = credentialsForm.register("password");

  const belowCard = (
    <p className="text-sm text-brand-muted">
      Already have an account?{" "}
      <Link href={ROUTES.auth} className="font-medium text-brand-primary hover:underline">
        Sign in
      </Link>
    </p>
  );

  const footer =
    currentStep === 1 ? (
      <WizardFooter
        continueType="submit"
        formId="signup-clinic-form"
        continueLabel="Continue"
        continueTestId="signup-continue"
      />
    ) : currentStep === 2 ? (
      <WizardFooter
        onBack={() => setCurrentStep(1)}
        continueType="submit"
        formId="signup-account-form"
        continueLabel="Continue"
        continueTestId="signup-account-continue"
        isBusy={credentialsForm.formState.isSubmitting}
      />
    ) : (
      <WizardFooter
        onBack={() => setCurrentStep(2)}
        continueLabel="Start workspace"
        continueTestId="signup-submit"
        onContinue={() => void handleVerifyAndCreateWorkspace()}
        isBusy={isFinalizing}
      />
    );

  return (
    <AuthWizardShell
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      title={stepCopy.title}
      subtitle={stepCopy.subtitle}
      footer={footer}
      belowCard={currentStep <= 2 ? belowCard : undefined}
    >
      {currentStep === 1 ? (
        <form
          id="signup-clinic-form"
          method="post"
          className="flex flex-1 flex-col gap-4"
          data-testid="signup-clinic-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleClinicContinue();
          }}
        >
          <FloatingLabelInput
            id="clinic_name"
            label="Clinic name"
            data-testid="signup-clinic-name"
            autoComplete="organization"
            error={profileForm.formState.errors.clinic_name?.message}
            {...clinicRegister}
            ref={(element) => {
              clinicRegister.ref(element);
              clinicInputRef.current = element;
            }}
          />

          <div className="space-y-1.5">
            <div className="auth-country-field">
              <CountrySelectField
                id="country"
                data-testid="signup-country"
                value={countryValue}
                hasError={Boolean(profileForm.formState.errors.country)}
                onChange={(value) =>
                  profileForm.setValue("country", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                placeholder="Select a country"
              />
            </div>
            {profileForm.formState.errors.country ? (
              <p className="text-sm text-destructive">
                {profileForm.formState.errors.country.message}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <StatusBanner
              variant="error"
              message={submitError}
              showIcon={false}
              data-testid="signup-submit-error"
            />
          ) : null}
        </form>
      ) : null}

      {currentStep === 2 ? (
        <form
          id="signup-account-form"
          method="post"
          className="flex flex-1 flex-col gap-4"
          data-testid="signup-credentials-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleAccountContinue();
          }}
        >
          <FloatingLabelInput
            id="name"
            label="Your name"
            data-testid="signup-name"
            autoComplete="name"
            error={profileForm.formState.errors.name?.message}
            {...nameRegister}
            ref={(element) => {
              nameRegister.ref(element);
              nameInputRef.current = element;
            }}
          />

          <FloatingLabelInput
            id="email"
            label="Work email"
            data-testid="signup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            error={credentialsForm.formState.errors.email?.message}
            {...emailRegister}
          />

          <FloatingLabelPasswordInput
            id="password"
            label="Password"
            data-testid="signup-password"
            autoComplete="new-password"
            error={credentialsForm.formState.errors.password?.message}
            hint={<PasswordStrengthMeter password={passwordValue ?? ""} />}
            {...passwordRegister}
          />

          {submitError ? (
            <StatusBanner
              variant="error"
              message={submitError}
              showIcon={false}
              data-testid="signup-submit-error"
            />
          ) : null}
        </form>
      ) : null}

      {currentStep === 3 ? (
        <div className="flex flex-1 flex-col">
          <SignupEmailConfirmStep
            email={signupEmail}
            code={otpCode}
            disabled={isSubmitting}
            error={submitError ?? otpForm.formState.errors.code?.message}
            onCodeChange={syncOtpCode}
            onCodeComplete={(nextCode) => {
              syncOtpCode(nextCode);
              void handleVerifyAndCreateWorkspace();
            }}
            onResend={handleResendOtp}
            isSubmitting={isFinalizing}
          />
        </div>
      ) : null}
    </AuthWizardShell>
  );
}
