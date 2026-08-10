"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ReactFlagsSelect from "react-flags-select";

import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { AuthWizardShell, type AuthWizardStep } from "@/features/auth/components/AuthWizardShell";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { SignupEmailConfirmStep } from "@/features/auth/components/SignupEmailConfirmStep";
import { SignupModulesStep } from "@/features/auth/components/SignupModulesStep";
import {
  getCountryNameFromCode,
  getPrioritizedCountryCodes,
} from "@/features/auth/constants/countries";
import { moduleIdsToGroupNames } from "@/features/auth/constants/onboarding-modules";
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
import { cn } from "@/lib/utils";

const WIZARD_STEPS: AuthWizardStep[] = [
  { number: 1, label: "Workspace" },
  { number: 2, label: "Verify" },
  { number: 3, label: "Modules" },
];

const STEP_COPY = {
  1: {
    title: "Set up your clinic workspace",
    subtitle:
      "Create your Sigma workspace to manage patients, billing, claims, and operations in one place.",
  },
  2: {
    title: "Confirm your email",
    subtitle:
      "We sent a 6-digit code to your inbox. Enter it below to verify ownership.",
  },
  3: {
    title: "Choose what to run first",
    subtitle: "Start with the essentials — you can add more modules anytime.",
  },
} as const;

const fieldClassName =
  "mt-1.5 h-12 rounded-xl border-slate-200 bg-white px-3.5 text-[15px] shadow-none transition-[box-shadow,border-color] focus-visible:border-brand-primary focus-visible:ring-brand-primary/20";

function FormErrorShake({
  message,
  reduceMotion,
}: {
  message: string;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.p
      role="alert"
      className="text-sm text-destructive"
      initial={reduceMotion ? false : { x: 0 }}
      animate={reduceMotion ? undefined : { x: [0, -6, 6, -4, 4, 0] }}
      transition={{ duration: 0.35 }}
    >
      {message}
    </motion.p>
  );
}

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
  const reduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([
    "registration",
    "billing",
    "clinical",
  ]);
  const [otpCode, setOtpCode] = useState("");
  const [countryCode, setCountryCode] = useState("MW");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const clinicInputRef = useRef<HTMLInputElement | null>(null);

  const prioritizedCountries = useMemo(() => getPrioritizedCountryCodes(), []);

  const credentialsForm = useForm<SignupCredentialsValues>({
    resolver: zodResolver(signupCredentialsSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const profileForm = useForm<SignupProfileValues>({
    resolver: zodResolver(signupProfileSchema),
    defaultValues: { name: "", clinic_name: "", country: "" },
    mode: "onBlur",
  });

  const otpForm = useForm<SignupOtpValues>({
    resolver: zodResolver(signupOtpSchema),
    defaultValues: { code: "" },
  });

  const signupEmail = credentialsForm.watch("email");
  const passwordValue = credentialsForm.watch("password");
  const stepCopy = STEP_COPY[currentStep];
  const isSubmitting =
    credentialsForm.formState.isSubmitting || isVerifying || isFinalizing;

  useEffect(() => {
    if (currentStep === 1) {
      clinicInputRef.current?.focus();
    }
  }, [currentStep]);

  async function handleWorkspaceContinue() {
    setSubmitError(null);
    setInfoMessage(null);

    const [credentialsValid, profileValid] = await Promise.all([
      credentialsForm.trigger(),
      profileForm.trigger(),
    ]);
    if (!credentialsValid || !profileValid) return;

    const values = credentialsForm.getValues();

    try {
      const response = await requestSignupOtp({
        email: values.email,
        password: values.password,
      });
      setInfoMessage(response.detail || "Verification code sent.");
      setOtpCode("");
      otpForm.setValue("code", "");
      setVerificationToken(null);
      setCurrentStep(2);
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

  async function handleVerifyEmailSubmit() {
    if (isVerifying) return;
    setSubmitError(null);

    const credentialsValid = await credentialsForm.trigger();
    const otpValid = await otpForm.trigger();

    if (!credentialsValid) {
      setCurrentStep(1);
      return;
    }
    if (!otpValid) return;

    const credentials = credentialsForm.getValues();
    const otp = otpForm.getValues();

    setIsVerifying(true);
    try {
      const response = await verifySignupEmail({
        email: credentials.email,
        password: credentials.password,
        code: otp.code,
      });
      setVerificationToken(response.verification_token);
      setInfoMessage("Email verified.");
      setCurrentStep(3);
    } catch (error) {
      setOtpCode("");
      otpForm.setValue("code", "");
      setSubmitError(
        error instanceof Error ? error.message : "Email verification failed.",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleCreateWorkspace() {
    setSubmitError(null);
    setIsFinalizing(true);

    const credentialsValid = await credentialsForm.trigger();
    const profileValid = await profileForm.trigger();

    if (!credentialsValid || !profileValid) {
      setCurrentStep(1);
      setIsFinalizing(false);
      return;
    }
    if (!verificationToken) {
      setCurrentStep(2);
      setIsFinalizing(false);
      setSubmitError("Please verify your email before continuing.");
      return;
    }

    const credentials = credentialsForm.getValues();
    const profile = profileForm.getValues();
    const groups = moduleIdsToGroupNames(selectedModuleIds);

    if (groups.length === 0) {
      setSubmitError("Select at least one module to continue.");
      setIsFinalizing(false);
      return;
    }

    try {
      await verifySignup({
        email: credentials.email,
        password: credentials.password,
        name: profile.name,
        clinic_name: profile.clinic_name,
        country: countryCode ? getCountryNameFromCode(countryCode) : undefined,
        verification_token: verificationToken,
      });
      await configureOnboardingModules(groups);
      markAuthenticatedSession();
      router.push(ROUTES.customers);
    } catch (error) {
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
    setInfoMessage(response.detail || "A new verification code has been sent.");
    setOtpCode("");
    otpForm.setValue("code", "");
    setVerificationToken(null);
    setSubmitError(null);
  }

  const clinicRegister = profileForm.register("clinic_name");

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
        formId="signup-workspace-form"
        continueLabel="Continue"
        continueTestId="signup-continue"
        isBusy={credentialsForm.formState.isSubmitting}
      />
    ) : currentStep === 2 ? (
      <WizardFooter
        onBack={() => setCurrentStep(1)}
        continueLabel="Continue"
        continueTestId="signup-verify-email"
        onContinue={() => void handleVerifyEmailSubmit()}
        isBusy={isVerifying}
      />
    ) : (
      <WizardFooter
        onBack={() => setCurrentStep(2)}
        continueLabel="Start workspace"
        continueTestId="signup-submit"
        onContinue={() => void handleCreateWorkspace()}
        isBusy={isFinalizing}
        continueDisabled={selectedModuleIds.length === 0}
      />
    );

  return (
    <AuthWizardShell
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      title={stepCopy.title}
      subtitle={stepCopy.subtitle}
      footer={footer}
      belowCard={currentStep === 1 ? belowCard : undefined}
    >
      {currentStep === 1 ? (
        <form
          id="signup-workspace-form"
          method="post"
          className="flex flex-1 flex-col space-y-4"
          data-testid="signup-credentials-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleWorkspaceContinue();
          }}
        >
          <div>
            <Label htmlFor="clinic_name">Clinic name</Label>
            <Input
              id="clinic_name"
              data-testid="signup-clinic-name"
              autoComplete="organization"
              placeholder="Lakeview Clinic"
              className={fieldClassName}
              {...clinicRegister}
              ref={(element) => {
                clinicRegister.ref(element);
                clinicInputRef.current = element;
              }}
            />
            {profileForm.formState.errors.clinic_name ? (
              <p className="mt-1.5 text-sm text-destructive">
                {profileForm.formState.errors.clinic_name.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              data-testid="signup-name"
              autoComplete="name"
              placeholder="Jane Banda"
              className={fieldClassName}
              {...profileForm.register("name")}
            />
            {profileForm.formState.errors.name ? (
              <p className="mt-1.5 text-sm text-destructive">
                {profileForm.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              data-testid="signup-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@clinic.org"
              className={fieldClassName}
              {...credentialsForm.register("email")}
            />
            {credentialsForm.formState.errors.email ? (
              <p className="mt-1.5 text-sm text-destructive">
                {credentialsForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              data-testid="signup-password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={fieldClassName}
              {...credentialsForm.register("password")}
            />
            <PasswordStrengthMeter password={passwordValue ?? ""} />
            {credentialsForm.formState.errors.password ? (
              <p className="mt-1.5 text-sm text-destructive">
                {credentialsForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <div className={cn("mt-1.5 [&_button]:h-12 [&_button]:rounded-xl")}>
              <ReactFlagsSelect
                selected={countryCode}
                onSelect={setCountryCode}
                placeholder="Select a country"
                searchable
                searchPlaceholder="Search countries"
                countries={prioritizedCountries}
                showSelectedLabel
                showOptionLabel
              />
            </div>
          </div>

          {submitError ? (
            <FormErrorShake message={submitError} reduceMotion={reduceMotion} />
          ) : null}
        </form>
      ) : null}

      {currentStep === 2 ? (
        <div className="flex flex-1 flex-col">
          {infoMessage ? (
            <p role="status" className="mb-4 text-sm text-emerald-700">
              {infoMessage}
            </p>
          ) : null}

          <SignupEmailConfirmStep
            email={signupEmail}
            code={otpCode}
            disabled={isSubmitting}
            error={submitError ?? otpForm.formState.errors.code?.message}
            onCodeChange={syncOtpCode}
            onCodeComplete={(nextCode) => {
              syncOtpCode(nextCode);
              void handleVerifyEmailSubmit();
            }}
            onResend={handleResendOtp}
            isSubmitting={isVerifying}
          />
        </div>
      ) : null}

      {currentStep === 3 ? (
        <SignupModulesStep
          selectedModuleIds={selectedModuleIds}
          onSelectedModuleIdsChange={setSelectedModuleIds}
          error={submitError}
        />
      ) : null}
    </AuthWizardShell>
  );
}
