"use client";

import { KeyRound, Loader2, Mail, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PasswordInput } from "@/components/password-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StatusBanner } from "@/components/ui/status-banner";
import {
  useActivateTotp,
  useBeginWebAuthnRegistration,
  useCompleteWebAuthnRegistration,
  useDeactivateTotp,
  useMfaStatus,
  useRegenerateRecoveryCodes,
  useRemoveWebAuthn,
  useRenameWebAuthn,
  useRevealRecoveryCodes,
  useSetPreferredMfaMethod,
  useSetupTotp,
} from "@/features/settings/hooks/use-mfa";
import { SettingsSection } from "@/features/settings/components/SettingsPageLayout";
import {
  mfaPasswordSchema,
  totpActivateSchema,
  type MfaPasswordValues,
  type TotpActivateValues,
} from "@/features/settings/schemas/mfa.schema";
import type { MfaStatus, TotpSetupResponse } from "@/features/settings/types/mfa.types";
import {
  createWebAuthnAttestation,
  isWebAuthnCancelled,
  webAuthnErrorMessage,
} from "@/features/auth/utils/webauthn";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const CANNOT_REMOVE_DEFAULT =
  "Set another default before removing this method.";

type PasswordDialog =
  | "deactivate-totp"
  | "add-webauthn"
  | "reveal-codes"
  | "regenerate-codes"
  | { type: "remove-webauthn"; id: number }
  | { type: "rename-webauthn"; id: number; name: string }
  | { type: "set-preferred"; method: "email" | "totp" | "webauthn" };

function formatKeyDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatKeyMeta(key: MfaStatus["webauthn"][number]) {
  if (key.last_used_at) {
    return `Last used ${formatKeyDate(key.last_used_at)}`;
  }
  return `Added ${formatKeyDate(key.created_at)}`;
}

function passwordDialogCopy(dialog: PasswordDialog) {
  if (dialog === "deactivate-totp") {
    return {
      title: "Remove authenticator app",
      description: "You will not be able to use authenticator codes to sign in.",
      confirmLabel: "Remove",
      destructive: true,
    };
  }
  if (dialog === "add-webauthn") {
    return {
      title: "Add a security key",
      description: "Confirm your password, then insert or tap your key when asked.",
      confirmLabel: "Add key",
      destructive: false,
    };
  }
  if (dialog === "reveal-codes") {
    return {
      title: "View recovery codes",
      description: "Confirm your password to see unused backup codes.",
      confirmLabel: "View codes",
      destructive: false,
    };
  }
  if (dialog === "regenerate-codes") {
    return {
      title: "Regenerate recovery codes",
      description: "Your current codes will stop working immediately.",
      confirmLabel: "Regenerate",
      destructive: true,
    };
  }
  if (dialog.type === "remove-webauthn") {
    return {
      title: "Remove this security key",
      description: "You will not be able to use this key to sign in.",
      confirmLabel: "Remove",
      destructive: true,
    };
  }
  if (dialog.type === "rename-webauthn") {
    return {
      title: "Rename this security key",
      description: "Choose a name you will recognize later.",
      confirmLabel: "Save name",
      destructive: false,
    };
  }
  return {
    title: "Set default sign-in method",
    description:
      "This method will be asked first after your password. Email stays available as another option.",
    confirmLabel: "Set as default",
    destructive: false,
  };
}

function RecoveryCodesPanel({
  codes,
  saved,
  onSavedChange,
}: {
  codes: string[];
  saved: boolean;
  onSavedChange: (saved: boolean) => void;
}) {
  function downloadCodes() {
    const blob = new Blob([codes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sigma-health-recovery-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyCodes() {
    await navigator.clipboard.writeText(codes.join("\n"));
  }

  return (
    <div className="space-y-4" data-testid="mfa-recovery-codes">
      <StatusBanner
        variant="error"
        message="Store these codes in a safe place. They will not be shown again."
      />
      <ul className="grid grid-cols-2 gap-2 rounded-lg border border-brand-border bg-slate-50 p-4 font-mono text-sm">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <SecondaryButton type="button" onClick={() => void copyCodes()}>
          Copy
        </SecondaryButton>
        <SecondaryButton type="button" onClick={downloadCodes}>
          Download
        </SecondaryButton>
      </div>
      <label className="flex items-center gap-2 text-sm text-brand-navy">
        <input
          type="checkbox"
          checked={saved}
          onChange={(event) => onSavedChange(event.target.checked)}
          data-testid="mfa-recovery-codes-ack"
        />
        I have saved these recovery codes
      </label>
    </div>
  );
}

function MethodRow({
  icon: Icon,
  title,
  description,
  badge,
  actions,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
            <Icon className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-brand-navy">{title}</p>
              {badge}
            </div>
            <p className="mt-0.5 text-sm text-brand-muted">{description}</p>
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function GuardedRemoveButton({
  blocked,
  onClick,
  testId,
  variant = "outline",
}: {
  blocked: boolean;
  onClick: () => void;
  testId: string;
  variant?: "outline" | "ghost";
}) {
  const button = (
    <Button
      type="button"
      variant={variant}
      size="sm"
      disabled={blocked}
      data-testid={testId}
      className={cn(
        variant === "ghost" && "h-8 px-2.5 text-red-700 hover:text-red-800",
      )}
      onClick={onClick}
    >
      Remove
    </Button>
  );
  if (!blocked) {
    return button;
  }
  return (
    <span className="inline-flex" title={CANNOT_REMOVE_DEFAULT}>
      {button}
    </span>
  );
}

function SecretKeyRow({ secret }: { secret: string }) {
  const [copied, setCopied] = useState(false);

  async function copySecret() {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-brand-border bg-slate-50 px-3 py-2">
      <code className="min-w-0 flex-1 break-all font-mono text-xs text-brand-navy">
        {secret}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 shrink-0 px-2.5"
        onClick={() => void copySecret()}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function SecurityKeyCancelledState() {
  return (
    <div
      className="flex flex-col items-center rounded-xl border border-dashed border-brand-border bg-slate-50/70 px-6 py-10 text-center"
      data-testid="mfa-webauthn-cancelled"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-tint text-brand-primary">
        <KeyRound className="size-6" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-brand-navy">
        Key not added
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-brand-muted">
        The request was cancelled or timed out. Insert or tap your key, then try
        again.
      </p>
    </div>
  );
}

function SetupStep({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-navy text-[11px] font-medium text-white"
        aria-hidden="true"
      >
        {step}
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="text-sm font-medium text-brand-navy">{title}</p>
          <p className="mt-0.5 text-sm text-brand-muted">{description}</p>
        </div>
        {children}
      </div>
    </li>
  );
}

function SecurityKeysList({
  keys,
  preferredMethod,
  onRename,
  onRemove,
}: {
  keys: MfaStatus["webauthn"];
  preferredMethod: MfaStatus["preferred_method"];
  onRename: (key: MfaStatus["webauthn"][number]) => void;
  onRemove: (id: number) => void;
}) {
  const blockLastKey = preferredMethod === "webauthn" && keys.length === 1;

  return (
    <div className="mt-5" data-testid="mfa-security-keys">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium text-brand-navy">Your keys</h3>
        <p className="text-xs text-brand-muted">
          {keys.length === 1 ? "1 key" : `${keys.length} keys`}
        </p>
      </div>
      <ul className="overflow-hidden rounded-lg border border-brand-border">
        {keys.map((key, index) => (
          <li
            key={key.id}
            className={cn(
              "flex flex-col gap-2 px-3.5 py-3 sm:flex-row sm:items-center sm:gap-3",
              index > 0 && "border-t border-brand-border",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-primary">
                <KeyRound className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-navy">
                  {key.name}
                </p>
                <p className="text-xs text-brand-muted">{formatKeyMeta(key)}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center self-end sm:self-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-brand-navy"
                onClick={() => onRename(key)}
              >
                Rename
              </Button>
              <GuardedRemoveButton
                variant="ghost"
                blocked={blockLastKey}
                testId={`mfa-remove-webauthn-${key.id}`}
                onClick={() => onRemove(key.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AccountTwoFactorSection() {
  const { toast } = useToast();
  const statusQuery = useMfaStatus();
  const setupTotp = useSetupTotp();
  const activateTotp = useActivateTotp();
  const deactivateTotp = useDeactivateTotp();
  const beginWebAuthn = useBeginWebAuthnRegistration();
  const completeWebAuthn = useCompleteWebAuthnRegistration();
  const renameWebAuthn = useRenameWebAuthn();
  const removeWebAuthn = useRemoveWebAuthn();
  const revealCodes = useRevealRecoveryCodes();
  const regenerateCodes = useRegenerateRecoveryCodes();
  const setPreferredMethod = useSetPreferredMfaMethod();

  const [totpOpen, setTotpOpen] = useState(false);
  const [totpSetup, setTotpSetup] = useState<TotpSetupResponse | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [recoveryCodesSaved, setRecoveryCodesSaved] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState<PasswordDialog | null>(
    null,
  );

  const totpForm = useForm<TotpActivateValues>({
    resolver: zodResolver(totpActivateSchema),
    defaultValues: { password: "", code: "" },
  });
  const passwordForm = useForm<MfaPasswordValues>({
    resolver: zodResolver(mfaPasswordSchema),
    defaultValues: { password: "" },
  });
  const [webauthnName, setWebauthnName] = useState("");
  const [renameName, setRenameName] = useState("");
  const [webauthnCancelled, setWebauthnCancelled] = useState(false);
  const [webauthnNotice, setWebauthnNotice] = useState<string | null>(null);
  const [isRetryingWebAuthn, setIsRetryingWebAuthn] = useState(false);
  const [isWaitingForWebAuthn, setIsWaitingForWebAuthn] = useState(false);
  const [webauthnSession, setWebauthnSession] = useState<{
    password: string;
    options: Record<string, unknown> | null;
  } | null>(null);

  const status = statusQuery.data;
  const passwordCopy = passwordDialog ? passwordDialogCopy(passwordDialog) : null;
  const isAddWebAuthn = passwordDialog === "add-webauthn";
  const isPasswordSubmitting =
    deactivateTotp.isPending ||
    beginWebAuthn.isPending ||
    completeWebAuthn.isPending ||
    renameWebAuthn.isPending ||
    removeWebAuthn.isPending ||
    revealCodes.isPending ||
    regenerateCodes.isPending ||
    setPreferredMethod.isPending ||
    isRetryingWebAuthn ||
    isWaitingForWebAuthn;

  function closePasswordDialog() {
    setPasswordDialog(null);
    passwordForm.reset();
    setWebauthnName("");
    setWebauthnCancelled(false);
    setWebauthnNotice(null);
    setIsRetryingWebAuthn(false);
    setIsWaitingForWebAuthn(false);
    setWebauthnSession(null);
  }

  function showRecoveryCodes(codes: string[]) {
    setRecoveryCodesSaved(false);
    setRecoveryCodes(codes);
  }

  async function startTotpSetup(values: TotpActivateValues) {
    try {
      const setup = await setupTotp.mutateAsync(values.password);
      setTotpSetup(setup);
      totpForm.setValue("code", "");
    } catch (error) {
      totpForm.setError("password", {
        message: error instanceof Error ? error.message : "Unable to start setup.",
      });
    }
  }

  async function confirmTotp(values: TotpActivateValues) {
    const code = values.code?.trim() ?? "";
    if (!/^\d{6}$/.test(code)) {
      totpForm.setError("code", {
        message: "Enter the 6-digit authenticator code",
      });
      return;
    }
    try {
      const result = await activateTotp.mutateAsync({
        password: values.password,
        code,
      });
      setTotpOpen(false);
      setTotpSetup(null);
      totpForm.reset();
      if (result.recovery_codes.length > 0) {
        showRecoveryCodes(result.recovery_codes);
      }
      toast({ variant: "success", description: "Authenticator app added." });
    } catch (error) {
      totpForm.setError("code", {
        message: error instanceof Error ? error.message : "Incorrect code.",
      });
    }
  }

  async function finishWebAuthnEnrollment(
    password: string,
    existingOptions: Record<string, unknown> | null,
  ) {
    let options = existingOptions;
    if (!options) {
      const started = await beginWebAuthn.mutateAsync({
        password,
        name: webauthnName,
      });
      options = started.creation_options;
      setWebauthnSession({ password, options });
    }
    setIsWaitingForWebAuthn(true);
    try {
      const credential = await createWebAuthnAttestation(options);
      const result = await completeWebAuthn.mutateAsync({
        password,
        name: webauthnName,
        credential,
      });
      if (result.recovery_codes.length > 0) {
        showRecoveryCodes(result.recovery_codes);
      }
      toast({ variant: "success", description: "Security key added." });
      closePasswordDialog();
    } finally {
      setIsWaitingForWebAuthn(false);
    }
  }

  async function retryWebAuthn() {
    if (!webauthnSession) return;
    setIsRetryingWebAuthn(true);
    try {
      await finishWebAuthnEnrollment(
        webauthnSession.password,
        webauthnSession.options,
      );
    } catch (error) {
      if (isWebAuthnCancelled(error)) {
        return;
      }
      setWebauthnCancelled(false);
      setWebauthnNotice(webAuthnErrorMessage(error));
    } finally {
      setIsRetryingWebAuthn(false);
    }
  }

  async function handlePasswordAction(values: MfaPasswordValues) {
    if (!passwordDialog) return;
    try {
      if (passwordDialog === "deactivate-totp") {
        await deactivateTotp.mutateAsync(values.password);
        toast({ variant: "success", description: "Authenticator app removed." });
      } else if (passwordDialog === "add-webauthn") {
        setWebauthnNotice(null);
        await finishWebAuthnEnrollment(
          values.password,
          webauthnSession?.options ?? null,
        );
        return;
      } else if (passwordDialog === "reveal-codes") {
        const result = await revealCodes.mutateAsync(values.password);
        showRecoveryCodes(result.unused_codes);
      } else if (passwordDialog === "regenerate-codes") {
        const result = await regenerateCodes.mutateAsync(values.password);
        showRecoveryCodes(result.unused_codes);
        toast({ variant: "success", description: "Recovery codes regenerated." });
      } else if (passwordDialog.type === "remove-webauthn") {
        await removeWebAuthn.mutateAsync({
          id: passwordDialog.id,
          password: values.password,
        });
        toast({ variant: "success", description: "Security key removed." });
      } else if (passwordDialog.type === "rename-webauthn") {
        await renameWebAuthn.mutateAsync({
          id: passwordDialog.id,
          password: values.password,
          name: renameName.trim() || passwordDialog.name,
        });
        toast({ variant: "success", description: "Security key renamed." });
      } else if (passwordDialog.type === "set-preferred") {
        await setPreferredMethod.mutateAsync({
          password: values.password,
          method: passwordDialog.method,
        });
        toast({ variant: "success", description: "Default sign-in method updated." });
      }
      closePasswordDialog();
    } catch (error) {
      if (passwordDialog === "add-webauthn" && isWebAuthnCancelled(error)) {
        setWebauthnCancelled(true);
        passwordForm.clearErrors("password");
        return;
      }
      const message =
        error instanceof Error ? webAuthnErrorMessage(error) : "Request failed.";
      if (passwordDialog === "add-webauthn" && /password/i.test(message)) {
        passwordForm.setError("password", { message });
        return;
      }
      if (passwordDialog === "add-webauthn") {
        setWebauthnNotice(message);
        return;
      }
      passwordForm.setError("password", { message });
    }
  }

  const extraFactorEnabled = Boolean(
    status?.totp.enabled || (status?.webauthn.length ?? 0) > 0,
  );
  const preferredMethod = status?.preferred_method ?? "email";

  function defaultBadge(method: "email" | "totp" | "webauthn") {
    return preferredMethod === method ? <Badge>Default</Badge> : null;
  }

  function defaultAction(method: "email" | "totp" | "webauthn", canSet: boolean) {
    if (!canSet || preferredMethod === method) return null;
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        data-testid={`mfa-set-default-${method}`}
        onClick={() => setPasswordDialog({ type: "set-preferred", method })}
      >
        Set as default
      </Button>
    );
  }

  const confirmBusyLabel =
    isAddWebAuthn && (isWaitingForWebAuthn || beginWebAuthn.isPending)
      ? "Waiting for key..."
      : "Working...";

  const confirmButton = passwordCopy?.destructive ? (
    <DestructiveButton
      type="submit"
      form="mfa-password-form"
      disabled={isPasswordSubmitting}
    >
      {isPasswordSubmitting ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {confirmBusyLabel}
        </>
      ) : (
        passwordCopy.confirmLabel
      )}
    </DestructiveButton>
  ) : (
    <PrimaryButton
      type="submit"
      form="mfa-password-form"
      disabled={isPasswordSubmitting}
    >
      {isPasswordSubmitting ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {confirmBusyLabel}
        </>
      ) : (
        passwordCopy?.confirmLabel
      )}
    </PrimaryButton>
  );

  return (
    <div className="space-y-6" data-testid="account-mfa-section">
      {statusQuery.isError ? (
        <StatusBanner
          variant="error"
          message="Unable to load two-factor settings."
        />
      ) : null}

      {!statusQuery.isLoading && status && !extraFactorEnabled ? (
        <div className="rounded-xl border border-brand-border bg-brand-tint/60 px-5 py-4">
          <p className="text-sm font-medium text-brand-navy">
            Add a backup sign-in method
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            Email codes already protect every sign-in. An authenticator app or
            security key lets you sign in if email is unavailable.
          </p>
        </div>
      ) : null}

      <SettingsSection
        title="Sign-in methods"
        description="The default method is asked first after your password. Email stays available from Try another method."
        flush
      >
        {statusQuery.isLoading ? (
          <p className="px-6 py-5 text-sm text-brand-muted">
            Loading security settings...
          </p>
        ) : (
          <div className="divide-y divide-brand-border">
            <MethodRow
              icon={Mail}
              title="Email code"
              description={
                preferredMethod === "email"
                  ? "Used first after you enter your password."
                  : "Available from Try another method after you enter your password."
              }
              badge={
                <>
                  <Badge variant="secondary">Required</Badge>
                  {defaultBadge("email")}
                </>
              }
              actions={defaultAction("email", true)}
            />
            <MethodRow
              icon={Smartphone}
              title="Authenticator app"
              description={
                status?.totp.enabled
                  ? preferredMethod === "totp"
                    ? "Used first after you enter your password."
                    : "Use this from Try another method after you enter your password."
                  : "Use Google Authenticator, 1Password, or a similar app."
              }
              badge={
                <>
                  {status?.totp.enabled ? (
                    <Badge variant="success">On</Badge>
                  ) : (
                    <Badge variant="outline">Off</Badge>
                  )}
                  {defaultBadge("totp")}
                </>
              }
              actions={
                <>
                  {defaultAction("totp", Boolean(status?.totp.enabled))}
                  {status?.totp.enabled ? (
                    <GuardedRemoveButton
                      blocked={preferredMethod === "totp"}
                      testId="mfa-remove-totp"
                      onClick={() => setPasswordDialog("deactivate-totp")}
                    />
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      data-testid="mfa-setup-totp"
                      onClick={() => {
                        totpForm.reset();
                        setTotpSetup(null);
                        setTotpOpen(true);
                      }}
                    >
                      Set up
                    </Button>
                  )}
                </>
              }
            />
            <MethodRow
              icon={KeyRound}
              title="Security keys"
              description={
                preferredMethod === "webauthn"
                  ? "Used first after you enter your password."
                  : "Passkeys and hardware keys such as YubiKey."
              }
              badge={
                <>
                  {(status?.webauthn.length ?? 0) > 0 ? (
                    <Badge variant="success">On</Badge>
                  ) : (
                    <Badge variant="outline">Off</Badge>
                  )}
                  {defaultBadge("webauthn")}
                </>
              }
              actions={
                <>
                  {defaultAction("webauthn", (status?.webauthn.length ?? 0) > 0)}
                  <Button
                    type="button"
                    size="sm"
                    data-testid="mfa-add-webauthn"
                    onClick={() => setPasswordDialog("add-webauthn")}
                  >
                    Add
                  </Button>
                </>
              }
            >
              {status?.webauthn.length ? (
                <SecurityKeysList
                  keys={status.webauthn}
                  preferredMethod={preferredMethod}
                  onRename={(key) => {
                    setRenameName(key.name);
                    setPasswordDialog({
                      type: "rename-webauthn",
                      id: key.id,
                      name: key.name,
                    });
                  }}
                  onRemove={(id) =>
                    setPasswordDialog({ type: "remove-webauthn", id })
                  }
                />
              ) : null}
            </MethodRow>
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        title="Recovery codes"
        description="One-time backup codes if you lose access to your other methods."
        flush
      >
        <MethodRow
          icon={ShieldCheck}
          title="Backup codes"
          description={
            status?.recovery_codes.enabled
              ? `${status.recovery_codes.unused_count} of ${status.recovery_codes.total_count} unused`
              : "Generated automatically when you add an authenticator app or security key."
          }
          badge={
            status?.recovery_codes.enabled ? (
              <Badge variant="success">On</Badge>
            ) : (
              <Badge variant="outline">Off</Badge>
            )
          }
          actions={
            status?.recovery_codes.enabled ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPasswordDialog("reveal-codes")}
                >
                  View
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPasswordDialog("regenerate-codes")}
                >
                  Regenerate
                </Button>
              </>
            ) : null
          }
        />
      </SettingsSection>

      <SectionedDialog
        open={totpOpen && !totpSetup}
        onOpenChange={(open) => {
          if (!open) {
            setTotpOpen(false);
            totpForm.reset();
          }
        }}
        title="Set up authenticator app"
        description="Confirm your password to start setup."
        className={appFont.className}
        footer={
          <>
            <SecondaryButton
              type="button"
              disabled={setupTotp.isPending}
              onClick={() => setTotpOpen(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              form="mfa-totp-password-form"
              disabled={setupTotp.isPending}
            >
              {setupTotp.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Continuing...
                </>
              ) : (
                "Continue"
              )}
            </PrimaryButton>
          </>
        }
      >
        <Form {...totpForm}>
          <form
            id="mfa-totp-password-form"
            className="space-y-3"
            onSubmit={totpForm.handleSubmit(startTotpSetup)}
          >
            <FormField
              control={totpForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </SectionedDialog>

      <SectionedDialog
        open={totpOpen && totpSetup !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTotpOpen(false);
            setTotpSetup(null);
            totpForm.reset();
          }
        }}
        title="Set up authenticator app"
        description="Follow the steps below. Your password has already been confirmed."
        className={appFont.className}
        footer={
          <>
            <SecondaryButton
              type="button"
              disabled={activateTotp.isPending}
              onClick={() => {
                setTotpSetup(null);
                totpForm.setValue("code", "");
              }}
            >
              Back
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              form="mfa-totp-activate-form"
              disabled={activateTotp.isPending}
            >
              {activateTotp.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Activating...
                </>
              ) : (
                "Activate"
              )}
            </PrimaryButton>
          </>
        }
      >
        {totpSetup ? (
          <Form {...totpForm}>
            <form
              id="mfa-totp-activate-form"
              onSubmit={totpForm.handleSubmit(confirmTotp)}
            >
              <ol className="space-y-6">
                <SetupStep
                  step={1}
                  title="Scan the QR code"
                  description="Open Google Authenticator, 1Password, or a similar app and scan this code. Can’t scan? Enter the secret key instead."
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div
                      className="flex size-[180px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-border bg-white p-3"
                      data-testid="mfa-totp-qr"
                      dangerouslySetInnerHTML={{ __html: totpSetup.qr_svg }}
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-sm text-brand-muted">
                        Can’t scan? Enter this secret key in your authenticator
                        app.
                      </p>
                      <SecretKeyRow secret={totpSetup.secret} />
                    </div>
                  </div>
                </SetupStep>
                <SetupStep
                  step={2}
                  title="Authenticator code"
                  description="Once you scan, enter the 6-digit code from your authenticator app to confirm it’s working."
                >
                  <FormField
                    control={totpForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            maxLength={6}
                            autoComplete="one-time-code"
                            autoFocus
                            data-testid="mfa-totp-code"
                            placeholder="000000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </SetupStep>
              </ol>
            </form>
          </Form>
        ) : null}
      </SectionedDialog>

      <SectionedDialog
        open={passwordDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            closePasswordDialog();
          }
        }}
        title={
          isAddWebAuthn && webauthnCancelled
            ? "Add a security key"
            : (passwordCopy?.title ?? "Confirm your password")
        }
        description={
          isAddWebAuthn && webauthnCancelled
            ? "Your password is confirmed. Insert or tap your key to finish setup."
            : passwordCopy?.description
        }
        className={appFont.className}
        footer={
          isAddWebAuthn && webauthnCancelled ? (
            <>
              <SecondaryButton
                type="button"
                disabled={isRetryingWebAuthn}
                onClick={closePasswordDialog}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="button"
                disabled={isRetryingWebAuthn}
                data-testid="mfa-webauthn-retry"
                onClick={() => void retryWebAuthn()}
              >
                {isRetryingWebAuthn ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Waiting for key...
                  </>
                ) : (
                  "Try again"
                )}
              </PrimaryButton>
            </>
          ) : (
            <>
              <SecondaryButton
                type="button"
                disabled={isPasswordSubmitting}
                onClick={closePasswordDialog}
              >
                Cancel
              </SecondaryButton>
              {confirmButton}
            </>
          )
        }
      >
        {isAddWebAuthn && webauthnCancelled ? (
          <SecurityKeyCancelledState />
        ) : (
          <Form {...passwordForm}>
            <form
              id="mfa-password-form"
              className="space-y-3"
              onSubmit={passwordForm.handleSubmit(handlePasswordAction)}
            >
              {isAddWebAuthn && webauthnNotice ? (
                <StatusBanner variant="error" message={webauthnNotice} />
              ) : null}
              {isAddWebAuthn ? (
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-brand-navy"
                    htmlFor="webauthn-name"
                  >
                    Key name
                  </label>
                  <Input
                    id="webauthn-name"
                    value={webauthnName}
                    onChange={(event) => setWebauthnName(event.target.value)}
                    placeholder="YubiKey, laptop passkey..."
                  />
                </div>
              ) : null}
              {passwordDialog &&
              typeof passwordDialog === "object" &&
              passwordDialog.type === "rename-webauthn" ? (
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-brand-navy"
                    htmlFor="webauthn-rename"
                  >
                    Key name
                  </label>
                  <Input
                    id="webauthn-rename"
                    value={renameName}
                    onChange={(event) => setRenameName(event.target.value)}
                  />
                </div>
              ) : null}
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </SectionedDialog>

      <SectionedDialog
        open={recoveryCodes !== null}
        onOpenChange={() => undefined}
        title="Save your recovery codes"
        description="Each code can be used once if you lose access to your other methods."
        className={appFont.className}
        footer={
          <PrimaryButton
            type="button"
            disabled={!recoveryCodesSaved}
            onClick={() => setRecoveryCodes(null)}
          >
            Done
          </PrimaryButton>
        }
      >
        {recoveryCodes ? (
          <RecoveryCodesPanel
            codes={recoveryCodes}
            saved={recoveryCodesSaved}
            onSavedChange={setRecoveryCodesSaved}
          />
        ) : null}
      </SectionedDialog>
    </div>
  );
}
