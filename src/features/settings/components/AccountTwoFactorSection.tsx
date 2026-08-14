"use client";

import { KeyRound, Loader2, Mail, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PasswordInput } from "@/components/password-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  useSetupTotp,
} from "@/features/settings/hooks/use-mfa";
import { SettingsSection } from "@/features/settings/components/SettingsPageLayout";
import {
  mfaPasswordSchema,
  totpActivateSchema,
  type MfaPasswordValues,
  type TotpActivateValues,
} from "@/features/settings/schemas/mfa.schema";
import type { TotpSetupResponse } from "@/features/settings/types/mfa.types";
import {
  createWebAuthnAttestation,
  webAuthnErrorMessage,
} from "@/features/auth/utils/webauthn";
import { useToast } from "@/providers/toast-provider";

function RecoveryCodesPanel({
  codes,
  onAcknowledged,
}: {
  codes: string[];
  onAcknowledged: () => void;
}) {
  const [saved, setSaved] = useState(false);

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
        <Button type="button" variant="secondary" onClick={() => void copyCodes()}>
          Copy
        </Button>
        <Button type="button" variant="secondary" onClick={downloadCodes}>
          Download
        </Button>
      </div>
      <label className="flex items-center gap-2 text-sm text-brand-navy">
        <input
          type="checkbox"
          checked={saved}
          onChange={(event) => setSaved(event.target.checked)}
          data-testid="mfa-recovery-codes-ack"
        />
        I have saved these recovery codes
      </label>
      <Button type="button" disabled={!saved} onClick={onAcknowledged}>
        Done
      </Button>
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

  const [totpOpen, setTotpOpen] = useState(false);
  const [totpSetup, setTotpSetup] = useState<TotpSetupResponse | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [passwordDialog, setPasswordDialog] = useState<
    | "deactivate-totp"
    | "add-webauthn"
    | "reveal-codes"
    | "regenerate-codes"
    | { type: "remove-webauthn"; id: number }
    | { type: "rename-webauthn"; id: number; name: string }
    | null
  >(null);

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

  const status = statusQuery.data;

  async function startTotpSetup(values: TotpActivateValues) {
    try {
      const setup = await setupTotp.mutateAsync(values.password);
      setTotpSetup(setup);
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
        setRecoveryCodes(result.recovery_codes);
      }
      toast({ variant: "success", description: "Authenticator app added." });
    } catch (error) {
      totpForm.setError("code", {
        message: error instanceof Error ? error.message : "Incorrect code.",
      });
    }
  }

  async function handlePasswordAction(values: MfaPasswordValues) {
    if (!passwordDialog) return;
    try {
      if (passwordDialog === "deactivate-totp") {
        await deactivateTotp.mutateAsync(values.password);
        toast({ variant: "success", description: "Authenticator app removed." });
      } else if (passwordDialog === "add-webauthn") {
        const options = await beginWebAuthn.mutateAsync({
          password: values.password,
          name: webauthnName,
        });
        const credential = await createWebAuthnAttestation(options.creation_options);
        const result = await completeWebAuthn.mutateAsync({
          password: values.password,
          name: webauthnName,
          credential,
        });
        if (result.recovery_codes.length > 0) {
          setRecoveryCodes(result.recovery_codes);
        }
        toast({ variant: "success", description: "Security key added." });
      } else if (passwordDialog === "reveal-codes") {
        const result = await revealCodes.mutateAsync(values.password);
        setRecoveryCodes(result.unused_codes);
      } else if (passwordDialog === "regenerate-codes") {
        const result = await regenerateCodes.mutateAsync(values.password);
        setRecoveryCodes(result.unused_codes);
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
      }
      setPasswordDialog(null);
      passwordForm.reset();
      setWebauthnName("");
    } catch (error) {
      passwordForm.setError("password", {
        message:
          error instanceof Error ? webAuthnErrorMessage(error) : "Request failed.",
      });
    }
  }

  const extraFactorEnabled = Boolean(
    status?.totp.enabled || (status?.webauthn.length ?? 0) > 0,
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
        description="Choose how you verify your identity after entering your password."
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
              description="A 6-digit code is sent to your email for every sign-in."
              badge={<Badge variant="secondary">Required</Badge>}
            />
            <MethodRow
              icon={Smartphone}
              title="Authenticator app"
              description={
                status?.totp.enabled
                  ? "Use this from Try another method after you enter your password."
                  : "Use Google Authenticator, 1Password, or a similar app."
              }
              badge={
                status?.totp.enabled ? (
                  <Badge variant="success">On</Badge>
                ) : (
                  <Badge variant="outline">Off</Badge>
                )
              }
              actions={
                status?.totp.enabled ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPasswordDialog("deactivate-totp")}
                  >
                    Remove
                  </Button>
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
                )
              }
            />
            <MethodRow
              icon={KeyRound}
              title="Security keys"
              description="Passkeys and hardware keys such as YubiKey."
              badge={
                (status?.webauthn.length ?? 0) > 0 ? (
                  <Badge variant="success">On</Badge>
                ) : (
                  <Badge variant="outline">Off</Badge>
                )
              }
              actions={
                <Button
                  type="button"
                  size="sm"
                  data-testid="mfa-add-webauthn"
                  onClick={() => setPasswordDialog("add-webauthn")}
                >
                  Add
                </Button>
              }
            >
              {status?.webauthn.length ? (
                <ul className="mt-4 space-y-2">
                  {status.webauthn.map((key) => (
                    <li
                      key={key.id}
                      className="flex flex-col gap-2 rounded-lg border border-brand-border bg-slate-50/80 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className="text-sm font-medium text-brand-navy">
                        {key.name}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRenameName(key.name);
                            setPasswordDialog({
                              type: "rename-webauthn",
                              id: key.id,
                              name: key.name,
                            });
                          }}
                        >
                          Rename
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setPasswordDialog({
                              type: "remove-webauthn",
                              id: key.id,
                            })
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
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

      <Dialog
        open={totpOpen}
        onOpenChange={(open) => {
          setTotpOpen(open);
          if (!open) {
            setTotpSetup(null);
            totpForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up authenticator app</DialogTitle>
            <DialogDescription>
              Confirm your password, then scan the QR code with your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <Form {...totpForm}>
            <form
              className="space-y-4"
              onSubmit={totpForm.handleSubmit(totpSetup ? confirmTotp : startTotpSetup)}
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
              {totpSetup ? (
                <>
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-slate-50 px-4 py-5">
                    <div
                      className="flex size-[180px] items-center justify-center overflow-hidden rounded-lg bg-white p-2"
                      data-testid="mfa-totp-qr"
                      dangerouslySetInnerHTML={{ __html: totpSetup.qr_svg }}
                    />
                    <p className="max-w-full break-all text-center font-mono text-xs text-brand-muted">
                      {totpSetup.secret}
                    </p>
                  </div>
                  <FormField
                    control={totpForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authenticator code</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            maxLength={6}
                            autoComplete="one-time-code"
                            data-testid="mfa-totp-code"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : null}
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={setupTotp.isPending || activateTotp.isPending}
                >
                  {setupTotp.isPending || activateTotp.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : totpSetup ? (
                    "Activate"
                  ) : (
                    "Continue"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={passwordDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordDialog(null);
            passwordForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your password</DialogTitle>
            <DialogDescription>
              This change requires your current password.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form
              className="space-y-4"
              onSubmit={passwordForm.handleSubmit(handlePasswordAction)}
            >
              {passwordDialog === "add-webauthn" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-navy" htmlFor="webauthn-name">
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
                  <label className="text-sm font-medium text-brand-navy" htmlFor="webauthn-rename">
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
              <DialogFooter>
                <Button type="submit">Continue</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={recoveryCodes !== null} onOpenChange={() => undefined}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recovery codes</DialogTitle>
            <DialogDescription>
              Each code can be used once if you lose access to your other methods.
            </DialogDescription>
          </DialogHeader>
          {recoveryCodes ? (
            <RecoveryCodesPanel
              codes={recoveryCodes}
              onAcknowledged={() => setRecoveryCodes(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
