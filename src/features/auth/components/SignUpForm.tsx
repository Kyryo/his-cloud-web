"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactFlagsSelect from "react-flags-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { AuthOtpStep } from "@/features/auth/components/AuthOtpStep";
import {
  AuthWizardShell,
  type AuthWizardStep,
} from "@/features/auth/components/AuthWizardShell";
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

const WIZARD_STEPS: AuthWizardStep[] = [
  { number: 1, label: "Account", description: "Email and password" },
  { number: 2, label: "Verify email", description: "Confirm your inbox" },
  { number: 3, label: "Clinic", description: "Workspace details" },
  { number: 4, label: "Modules", description: "Choose your features" },
];

const STEP_COPY = {
  1: {
    title: "Create your Sigma account",
    subtitle: "Start with your credentials. We'll send a verification code next.",
  },
  2: {
    title: "Verify your email",
    subtitle: "Enter the 6-digit code we sent to confirm it's really you.",
  },
  3: {
    title: "Set up your clinic",
    subtitle: "Tell us about your organization so we can prepare your workspace.",
  },
  4: {
    title: "Choose your modules",
    subtitle: "Pick the areas you want to run on day one. You can add more later.",
  },
} as const;

export function SignUpForm() {
  const router = useRouter();
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

  const prioritizedCountries = useMemo(() => getPrioritizedCountryCodes(), []);

  const credentialsForm = useForm<SignupCredentialsValues>({
    resolver: zodResolver(signupCredentialsSchema),
    defaultValues: { email: "", password: "", password2: "" },
  });

  const profileForm = useForm<SignupProfileValues>({
    resolver: zodResolver(signupProfileSchema),
    defaultValues: { name: "", clinic_name: "", country: "" },
  });

  const otpForm = useForm<SignupOtpValues>({
    resolver: zodResolver(signupOtpSchema),
    defaultValues: { code: "" },
  });

  const signupEmail = credentialsForm.watch("email");
  const stepCopy = STEP_COPY[currentStep];
  const isSubmitting =
    credentialsForm.formState.isSubmitting ||
    otpForm.formState.isSubmitting ||
    isFinalizing;

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
      subtitle={stepCopy.subtitle}
      footer={currentStep === 1 ? signInFooter : undefined}
    >
      {currentStep === 1 ? (
        <form
          method="post"
          className="space-y-4"
          data-testid="signup-credentials-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleCredentialsNext();
          }}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              data-testid="signup-email"
              type="email"
              autoComplete="email"
              className="mt-1.5 h-11"
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
            <Input
              id="password"
              data-testid="signup-password"
              type="password"
              autoComplete="new-password"
              className="mt-1.5 h-11"
              {...credentialsForm.register("password")}
            />
            {credentialsForm.formState.errors.password ? (
              <p className="mt-1.5 text-sm text-destructive">
                {credentialsForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="password2">Confirm password</Label>
            <Input
              id="password2"
              type="password"
              autoComplete="new-password"
              className="mt-1.5 h-11"
              {...credentialsForm.register("password2")}
            />
            {credentialsForm.formState.errors.password2 ? (
              <p className="mt-1.5 text-sm text-destructive">
                {credentialsForm.formState.errors.password2.message}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          ) : null}

          <Button
            type="submit"
            data-testid="signup-continue"
            className="mt-2 h-11 w-full bg-brand-primary hover:bg-[#1254b8] sm:w-auto sm:min-w-[12rem]"
            disabled={credentialsForm.formState.isSubmitting}
          >
            {credentialsForm.formState.isSubmitting ? "Sending code..." : "Continue"}
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
            <p role="status" className="text-sm text-emerald-600">
              {infoMessage}
            </p>
          ) : null}

          <AuthOtpStep
            embedded
            title="Check your inbox"
            description="We sent a verification code to"
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
            submitLabel="Continue"
            submittingLabel="Verifying..."
            submitTestId="signup-verify-email"
            isSubmitting={otpForm.formState.isSubmitting}
            onSubmit={() => void handleVerifyEmailSubmit()}
          />
        </form>
      ) : null}

      {currentStep === 3 ? (
        <form
          method="post"
          className="space-y-4"
          data-testid="signup-profile-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleProfileNext();
          }}
        >
          {infoMessage ? (
            <p role="status" className="text-sm text-emerald-600">
              {infoMessage}
            </p>
          ) : null}

          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              data-testid="signup-name"
              autoComplete="name"
              className="mt-1.5 h-11"
              {...profileForm.register("name")}
            />
            {profileForm.formState.errors.name ? (
              <p className="mt-1.5 text-sm text-destructive">
                {profileForm.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="clinic_name">Clinic name</Label>
            <Input
              id="clinic_name"
              data-testid="signup-clinic-name"
              className="mt-1.5 h-11"
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
            <div className="mt-1.5">
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
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => setCurrentStep(2)}
            >
              Back
            </Button>
            <Button
              type="submit"
              data-testid="signup-profile-continue"
              className="h-11 min-w-[10rem] bg-brand-primary hover:bg-[#1254b8]"
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
