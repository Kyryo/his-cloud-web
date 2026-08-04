"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
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
import { AuthOtpStep } from "@/features/auth/components/AuthOtpStep";
import {
  AuthWizardShell,
  type AuthWizardStep,
} from "@/features/auth/components/AuthWizardShell";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
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
import { maskEmail } from "@/lib/mask-email";
import { cn } from "@/lib/utils";

const WIZARD_STEPS: AuthWizardStep[] = [
  { number: 1, label: "Account", description: "Email and password" },
  { number: 2, label: "Verify", description: "Confirm your inbox" },
  { number: 3, label: "Clinic", description: "Workspace details" },
  { number: 4, label: "Modules", description: "Choose your features" },
];

const STEP_COPY = {
  1: {
    title: "Your work email",
    subtitle: "We’ll send a one-time code to verify it’s you.",
  },
  2: {
    title: "Confirm it’s you",
    subtitle: "Enter the 6-digit code we sent to",
  },
  3: {
    title: "Name your clinic workspace",
    subtitle: "We’ll use this to personalize your Sigma workspace.",
  },
  4: {
    title: "Choose what to run on day one",
    subtitle: "Add more modules anytime from settings.",
  },
} as const;

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

export function SignUpForm() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([
    "registration",
  ]);
  const [otpCode, setOtpCode] = useState("");
  const [countryCode, setCountryCode] = useState("MW");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

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
    credentialsForm.formState.isSubmitting ||
    otpForm.formState.isSubmitting ||
    isFinalizing;

  useEffect(() => {
    if (currentStep === 1) {
      emailInputRef.current?.focus();
    } else if (currentStep === 3) {
      nameInputRef.current?.focus();
    }
  }, [currentStep]);

  async function handleCredentialsNext() {
    setSubmitError(null);
    setInfoMessage(null);

    const isValid = await credentialsForm.trigger();
    if (!isValid) return;

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

    try {
      const response = await verifySignupEmail({
        email: credentials.email,
        password: credentials.password,
        code: otp.code,
      });
      setVerificationToken(response.verification_token);
      setInfoMessage("Email verified. Continue setting up your clinic.");
      setCurrentStep(3);
    } catch (error) {
      setOtpCode("");
      otpForm.setValue("code", "");
      setSubmitError(
        error instanceof Error ? error.message : "Email verification failed.",
      );
    }
  }

  async function handleProfileNext() {
    setSubmitError(null);

    const isValid = await profileForm.trigger();
    if (!isValid) return;

    setCurrentStep(4);
  }

  async function handleCreateWorkspace() {
    setSubmitError(null);
    setIsFinalizing(true);

    const credentialsValid = await credentialsForm.trigger();
    const profileValid = await profileForm.trigger();

    if (!credentialsValid) {
      setCurrentStep(1);
      setIsFinalizing(false);
      return;
    }
    if (!profileValid) {
      setCurrentStep(3);
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

  const emailRegister = credentialsForm.register("email");
  const nameRegister = profileForm.register("name");

  const stepSubtitle =
    currentStep === 2
      ? `${stepCopy.subtitle} ${maskEmail(signupEmail)}.`
      : stepCopy.subtitle;

  const signInFooter = (
    <p className="text-sm text-brand-muted">
      Already have an account?{" "}
      <Link href={ROUTES.auth} className="font-medium text-brand-primary hover:underline">
        Sign in
      </Link>
    </p>
  );

  return (
    <AuthWizardShell
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      title={stepCopy.title}
      subtitle={stepSubtitle}
      footer={currentStep === 1 ? signInFooter : undefined}
    >
      {currentStep === 1 ? (
        <form
          method="post"
          className="space-y-5"
          data-testid="signup-credentials-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleCredentialsNext();
          }}
        >
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
              className="mt-1.5 h-12 rounded-xl border-brand-border bg-white px-3.5 text-[15px] shadow-none transition-[box-shadow,border-color] focus-visible:border-brand-primary focus-visible:ring-brand-primary/20"
              {...emailRegister}
              ref={(element) => {
                emailRegister.ref(element);
                emailInputRef.current = element;
              }}
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
              className="mt-1.5 h-12 rounded-xl border-brand-border bg-white px-3.5 text-[15px] shadow-none transition-[box-shadow,border-color] focus-visible:border-brand-primary focus-visible:ring-brand-primary/20"
              {...credentialsForm.register("password")}
            />
            <PasswordStrengthMeter password={passwordValue ?? ""} />
            {credentialsForm.formState.errors.password ? (
              <p className="mt-1.5 text-sm text-destructive">
                {credentialsForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <FormErrorShake message={submitError} reduceMotion={reduceMotion} />
          ) : null}

          <Button
            type="submit"
            data-testid="signup-continue"
            className="mt-1 h-12 w-full rounded-full bg-brand-primary text-[15px] font-semibold hover:bg-brand-primary-hover"
            disabled={credentialsForm.formState.isSubmitting}
            aria-busy={credentialsForm.formState.isSubmitting}
          >
            {credentialsForm.formState.isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Sending code…
              </span>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      ) : null}

      {currentStep === 2 ? (
        <form
          className="space-y-4"
          data-testid="signup-otp-form"
          onSubmit={(event) => event.preventDefault()}
        >
          {infoMessage ? (
            <p role="status" className="text-sm text-emerald-700">
              {infoMessage}
            </p>
          ) : null}

          <AuthOtpStep
            embedded
            title="Confirm it’s you"
            description="Enter the 6-digit code we sent to"
            email={signupEmail}
            codeTestId="signup-otp"
            code={otpCode}
            disabled={isSubmitting}
            error={submitError ?? otpForm.formState.errors.code?.message}
            onCodeChange={syncOtpCode}
            onCodeComplete={(code) => {
              syncOtpCode(code);
              void handleVerifyEmailSubmit();
            }}
            onResend={handleResendOtp}
            onBack={() => setCurrentStep(1)}
            submitLabel="Verify email"
            submittingLabel="Verifying…"
            submitTestId="signup-verify-email"
            isSubmitting={otpForm.formState.isSubmitting}
            onSubmit={() => void handleVerifyEmailSubmit()}
          />
        </form>
      ) : null}

      {currentStep === 3 ? (
        <form
          method="post"
          className="space-y-5"
          data-testid="signup-profile-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleProfileNext();
          }}
        >
          {infoMessage ? (
            <p role="status" className="text-sm text-emerald-700">
              {infoMessage}
            </p>
          ) : null}

          <div>
            <Label htmlFor="name">Your full name</Label>
            <Input
              id="name"
              data-testid="signup-name"
              autoComplete="name"
              placeholder="Jane Banda"
              className="mt-1.5 h-12 rounded-xl border-brand-border bg-white px-3.5 text-[15px] shadow-none focus-visible:border-brand-primary focus-visible:ring-brand-primary/20"
              {...nameRegister}
              ref={(element) => {
                nameRegister.ref(element);
                nameInputRef.current = element;
              }}
            />
            {profileForm.formState.errors.name ? (
              <p className="mt-1.5 text-sm text-destructive">
                {profileForm.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="clinic_name">Clinic or organization</Label>
            <Input
              id="clinic_name"
              data-testid="signup-clinic-name"
              autoComplete="organization"
              placeholder="Lakeview Clinic"
              className="mt-1.5 h-12 rounded-xl border-brand-border bg-white px-3.5 text-[15px] shadow-none focus-visible:border-brand-primary focus-visible:ring-brand-primary/20"
              {...profileForm.register("clinic_name")}
            />
            {profileForm.formState.errors.clinic_name ? (
              <p className="mt-1.5 text-sm text-destructive">
                {profileForm.formState.errors.clinic_name.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <p className="mt-0.5 text-xs text-brand-muted">
              Used to prepare regional defaults for your workspace.
            </p>
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

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full border-brand-border"
              onClick={() => setCurrentStep(2)}
            >
              Back
            </Button>
            <Button
              type="submit"
              data-testid="signup-profile-continue"
              className="h-12 min-w-[10rem] rounded-full bg-brand-primary font-semibold hover:bg-brand-primary-hover"
            >
              Continue
            </Button>
          </div>
        </form>
      ) : null}

      {currentStep === 4 ? (
        <SignupModulesStep
          selectedModuleIds={selectedModuleIds}
          onSelectedModuleIdsChange={setSelectedModuleIds}
          onBack={() => setCurrentStep(3)}
          onSubmit={handleCreateWorkspace}
          isSubmitting={isFinalizing}
          error={submitError}
        />
      ) : null}
    </AuthWizardShell>
  );
}
