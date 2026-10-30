"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSmtpDialogOpen, testSmtpConnection } from "@/store/mailer-connection-slice";
import { validateSmtpForm, type SmtpConfig, type SmtpFormValues } from "./mailer-types";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[11px] text-destructive">
      {message}
    </p>
  );
}

function toFormValues(saved: SmtpConfig): SmtpFormValues {
  return {
    host: saved.host,
    port: String(saved.port || 587),
    secure: saved.secure,
    username: saved.username,
    password: "",
    fromName: saved.fromName,
    fromEmail: saved.fromEmail,
  };
}

export function SmtpConfigDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.mailerConnection.smtpDialogOpen);
  const saving = useAppSelector((s) => s.mailerConnection.smtpSaving);
  const saved = useAppSelector((s) => s.mailerConnection.smtpConfig);
  const serverError = useAppSelector((s) => s.mailerConnection.connections.smtp.error);

  const [values, setValues] = useState<SmtpFormValues>(() => toFormValues(saved));
  const [touched, setTouched] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setValues(toFormValues(saved));
      setTouched(false);
    }
    dispatch(setSmtpDialogOpen(next));
  };

  const errors = validateSmtpForm(values);
  const set = <K extends keyof SmtpFormValues>(key: K, val: SmtpFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const handleSave = () => {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    dispatch(testSmtpConnection({ values }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect via SMTP</DialogTitle>
          <DialogDescription>
            Works with any provider (Gmail app passwords, SES, Postmark, self-hosted). The
            password is used only to verify and is never stored in app state.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
            <div className="grid gap-1.5">
              <Label htmlFor="smtp-host">SMTP host</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.example.com"
                autoComplete="off"
                value={values.host}
                onChange={(e) => set("host", e.target.value)}
                aria-invalid={touched && !!errors.host}
              />
              {touched ? <FieldError message={errors.host} /> : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="smtp-port">Port</Label>
              <Input
                id="smtp-port"
                inputMode="numeric"
                placeholder="587"
                value={values.port}
                onChange={(e) => set("port", e.target.value)}
                aria-invalid={touched && !!errors.port}
              />
              {touched ? <FieldError message={errors.port} /> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="smtp-user">Username</Label>
              <Input
                id="smtp-user"
                autoComplete="username"
                placeholder="you@example.com"
                value={values.username}
                onChange={(e) => set("username", e.target.value)}
                aria-invalid={touched && !!errors.username}
              />
              {touched ? <FieldError message={errors.username} /> : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="smtp-pass">Password / app password</Label>
              <Input
                id="smtp-pass"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(e) => set("password", e.target.value)}
                aria-invalid={touched && !!errors.password}
              />
              {touched ? <FieldError message={errors.password} /> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="smtp-from-name">Sender name</Label>
              <Input
                id="smtp-from-name"
                placeholder="Acme News"
                value={values.fromName}
                onChange={(e) => set("fromName", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="smtp-from-email">Sender email</Label>
              <Input
                id="smtp-from-email"
                type="email"
                placeholder="news@example.com"
                value={values.fromEmail}
                onChange={(e) => set("fromEmail", e.target.value)}
                aria-invalid={touched && !!errors.fromEmail}
              />
              {touched ? <FieldError message={errors.fromEmail} /> : null}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-none border border-border bg-muted/40 px-3 py-2.5">
            <div>
              <p className="text-xs font-medium text-foreground">Use SSL / TLS</p>
              <p className="text-[11px] text-muted-foreground">Port 465 for SSL, 587 for STARTTLS.</p>
            </div>
            <Switch checked={values.secure} onCheckedChange={(v) => set("secure", v)} aria-label="Use SSL or TLS" />
          </div>

          {serverError ? (
            <p role="alert" className="text-xs text-destructive">
              {serverError}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={saving} />}
          >
            Cancel
          </DialogClose>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Verifying..." : "Verify & save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
