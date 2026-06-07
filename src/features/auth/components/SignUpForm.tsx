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
import { StepIndicator } from "@/features/auth/components/StepIndicator";
import {
  getCountryNameFromCode,
  getPrioritizedCountryCodes,
} from "@/features/auth/constants/countries";
import {
  requestSignupOtp,
  verifySignup,
  markAuthenticatedSession,
} from "@/features/auth/services/auth.service";
import {
  signupCredentialsSchema,
  signupOtpSchema,
  signupProfileSchema,
  type SignupCredentialsValues,
  type SignupOtpValues,
  type SignupProfileValues,
} from "@/features/auth/schemas/signup.schema";

const STEPS = [
  { number: 1, label: "Account" },
  { number: 2, label: "Clinic" },
  { number: 3, label: "Verify" },
] as const;

export function SignUpForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
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

  const [countryCode, setCountryCode] = useState("MW");
  const [otpCode, setOtpCode] = useState("");

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
      setCurrentStep(2);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not start sign up.",
      );
    }
  }

  async function handleProfileNext() {
    setSubmitError(null);

    const isValid = await profileForm.trigger();
    if (!isValid) return;

    setCurrentStep(3);
  }

  async function handleVerifySubmit() {
    setSubmitError(null);

    const credentialsValid = await credentialsForm.trigger();
    const profileValid = await profileForm.trigger();
    const otpValid = await otpForm.trigger();

    if (!credentialsValid) {
      setCurrentStep(1);
      return;
    }
    if (!profileValid) {
      setCurrentStep(2);
      return;
    }
    if (!otpValid) return;

    const credentials = credentialsForm.getValues();
    const profile = profileForm.getValues();
    const otp = otpForm.getValues();

    try {
      await verifySignup({
        email: credentials.email,
        password: credentials.password,
        name: profile.name,
        clinic_name: profile.clinic_name,
        country: countryCode ? getCountryNameFromCode(countryCode) : undefined,
        code: otp.code,
      });
      markAuthenticatedSession();
      router.push(ROUTES.customers);
    } catch (error) {
      setOtpCode("");
      otpForm.setValue("code", "");
      setSubmitError(
        error instanceof Error ? error.message : "Sign up failed. Please try again.",
      );
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
    setSubmitError(null);
  }

  function syncOtpCode(code: string) {
    setOtpCode(code);
    otpForm.setValue("code", code, { shouldValidate: code.length === 6 });
  }

  async function submitOtpIfReady(code: string) {
    if (otpForm.formState.isSubmitting) return;

    syncOtpCode(code);
    await handleVerifySubmit();
  }

  const isSubmitting = otpForm.formState.isSubmitting;
  const signupEmail = credentialsForm.getValues("email");

  if (currentStep === 3) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
        <form
          className="w-full max-w-md"
          data-testid="signup-otp-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <AuthOtpStep
            title="Verify your email"
            description="Enter the 6-digit code we sent to your inbox."
            email={signupEmail}
            codeTestId="signup-otp"
            code={otpCode}
            disabled={isSubmitting}
            error={submitError ?? otpForm.formState.errors.code?.message}
            onCodeChange={syncOtpCode}
            onCodeComplete={(code) => void submitOtpIfReady(code)}
            onResend={handleResendOtp}
            onBack={() => setCurrentStep(2)}
            submitLabel="Create account"
            submittingLabel="Creating account..."
            submitTestId="signup-submit"
            isSubmitting={isSubmitting}
            onSubmit={() => void handleVerifySubmit()}
          />
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:py-10">
      <div className="w-full max-w-md space-y-6">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="ghost"
            className="mb-4 h-auto px-0 text-muted-foreground hover:text-foreground"
            onClick={() =>
              setCurrentStep((step) => (step > 1 ? ((step - 1) as 1 | 2 | 3) : step))
            }
          >
            Back
          </Button>
        )}

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {currentStep === 1 && "Create your account"}
            {currentStep === 2 && "Set up your clinic"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentStep === 1 && "Start with your account credentials."}
            {currentStep === 2 && "Tell us about your clinic."}
          </p>
        </div>

        <StepIndicator currentStep={currentStep} steps={[...STEPS]} />

        {currentStep === 1 && (
          <form
            className="mt-6 space-y-4"
            data-testid="signup-credentials-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleCredentialsNext();
            }}
          >
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                data-testid="signup-email"
                type="email"
                className="mt-1.5 h-11"
                {...credentialsForm.register("email")}
              />
              {credentialsForm.formState.errors.email && (
                <p className="mt-1.5 text-sm text-destructive">
                  {credentialsForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                data-testid="signup-password"
                type="password"
                className="mt-1.5 h-11"
                {...credentialsForm.register("password")}
              />
              {credentialsForm.formState.errors.password && (
                <p className="mt-1.5 text-sm text-destructive">
                  {credentialsForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password2">Confirm password *</Label>
              <Input
                id="password2"
                type="password"
                className="mt-1.5 h-11"
                {...credentialsForm.register("password2")}
              />
              {credentialsForm.formState.errors.password2 && (
                <p className="mt-1.5 text-sm text-destructive">
                  {credentialsForm.formState.errors.password2.message}
                </p>
              )}
            </div>

            {submitError && (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            )}

            <Button
              type="submit"
              data-testid="signup-continue"
              className="h-11 w-full"
              disabled={credentialsForm.formState.isSubmitting}
            >
              {credentialsForm.formState.isSubmitting ? "Sending code..." : "Continue"}
            </Button>
          </form>
        )}

        {currentStep === 2 && (
          <form
            className="mt-6 space-y-4"
            data-testid="signup-profile-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleProfileNext();
            }}
          >
            {infoMessage && (
              <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
                {infoMessage}
              </p>
            )}

            <div>
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                data-testid="signup-name"
                className="mt-1.5 h-11"
                {...profileForm.register("name")}
              />
              {profileForm.formState.errors.name && (
                <p className="mt-1.5 text-sm text-destructive">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="clinic_name">Clinic name *</Label>
              <Input
                id="clinic_name"
                data-testid="signup-clinic-name"
                className="mt-1.5 h-11"
                {...profileForm.register("clinic_name")}
              />
              {profileForm.formState.errors.clinic_name && (
                <p className="mt-1.5 text-sm text-destructive">
                  {profileForm.formState.errors.clinic_name.message}
                </p>
              )}
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

            <Button
              type="submit"
              data-testid="signup-profile-continue"
              className="h-11 w-full"
            >
              Continue
            </Button>
          </form>
        )}

        {currentStep === 1 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={ROUTES.auth} className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
