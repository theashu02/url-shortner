"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
    <p role="alert" className="text-xs text-destructive">
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
      <DialogContent className="sm:max-w-lg p-6 sm:p-7">
        <DialogHeader className="gap-1.5 pb-1">
          <DialogTitle className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight">
            Connect via SMTP
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            Works with any provider (Gmail app passwords, SES, Postmark, self-hosted). The
            password is used only to verify and is never stored in app state.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:gap-5 py-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
            <div className="grid gap-2">
              <Label htmlFor="smtp-host" className="text-sm font-medium text-foreground">
                SMTP host
              </Label>
              <Input
                id="smtp-host"
                placeholder="smtp.example.com"
                autoComplete="off"
                value={values.host}
                onChange={(e) => set("host", e.target.value)}
                aria-invalid={touched && !!errors.host}
                className="h-10 text-sm px-3 md:text-sm"
              />
              {touched ? <FieldError message={errors.host} /> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtp-port" className="text-sm font-medium text-foreground">
                Port
              </Label>
              <Input
                id="smtp-port"
                inputMode="numeric"
                placeholder="587"
                value={values.port}
                onChange={(e) => set("port", e.target.value)}
                aria-invalid={touched && !!errors.port}
                className="h-10 text-sm px-3 md:text-sm"
              />
              {touched ? <FieldError message={errors.port} /> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="smtp-user" className="text-sm font-medium text-foreground">
                Username
              </Label>
              <Input
                id="smtp-user"
                autoComplete="username"
                placeholder="you@example.com"
                value={values.username}
                onChange={(e) => set("username", e.target.value)}
                aria-invalid={touched && !!errors.username}
                className="h-10 text-sm px-3 md:text-sm"
              />
              {touched ? <FieldError message={errors.username} /> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtp-pass" className="text-sm font-medium text-foreground">
                Password / app password
              </Label>
              <Input
                id="smtp-pass"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(e) => set("password", e.target.value)}
                aria-invalid={touched && !!errors.password}
                className="h-10 text-sm px-3 md:text-sm"
              />
              {touched ? <FieldError message={errors.password} /> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="smtp-from-name" className="text-sm font-medium text-foreground">
                Sender name
              </Label>
              <Input
                id="smtp-from-name"
                placeholder="Acme News"
                value={values.fromName}
                onChange={(e) => set("fromName", e.target.value)}
                className="h-10 text-sm px-3 md:text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtp-from-email" className="text-sm font-medium text-foreground">
                Sender email
              </Label>
              <Input
                id="smtp-from-email"
                type="email"
                placeholder="news@example.com"
                value={values.fromEmail}
                onChange={(e) => set("fromEmail", e.target.value)}
                aria-invalid={touched && !!errors.fromEmail}
                className="h-10 text-sm px-3 md:text-sm"
              />
              {touched ? <FieldError message={errors.fromEmail} /> : null}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-none border border-border bg-muted/40 p-3 sm:p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">Use SSL / TLS</p>
              <p className="text-xs text-muted-foreground">Port 465 for SSL, 587 for STARTTLS.</p>
            </div>
            <Switch checked={values.secure} onCheckedChange={(v) => set("secure", v)} aria-label="Use SSL or TLS" />
          </div>

          {serverError ? (
            <p role="alert" className="text-xs sm:text-sm text-destructive">
              {serverError}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <DialogClose
            render={<Button variant="outline" size="sm" className="h-9 px-4 text-xs sm:text-sm rounded-none" disabled={saving} />}
          >
            Cancel
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="h-9 px-4 text-xs sm:text-sm rounded-none gap-1.5"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
            <span>{saving ? "Verifying..." : "Verify & save"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
