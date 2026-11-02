"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/toast-manager";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  loadConnections,
  selectConnectedProviders,
  setNotice,
} from "@/store/mailer-connection-slice";

export const PROVIDER_LABEL: Record<string, string> = {
  gmail: "Gmail",
  outlook: "Outlook",
  smtp: "SMTP",
};

export function useMailerConnect() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const connected = useAppSelector(selectConnectedProviders);
  const listLoading = useAppSelector((s) => s.mailerConnection.listLoading);
  const notice = useAppSelector((s) => s.mailerConnection.notice);
  const errorCount = useAppSelector(
    (s) =>
      Object.values(s.mailerConnection.connections).filter((c) => c.status === "error").length
  );

  useEffect(() => {
    const ok = searchParams.get("mail_connected");
    const email = searchParams.get("mail_email");
    const error = searchParams.get("mail_error");

    if (ok || error) {
      if (ok) {
        const label = PROVIDER_LABEL[ok] ?? ok;
        toast.success(`${label} connected${email ? ` as ${email}` : ""}.`);
      } else if (error) {
        toast.error(error);
      }
      router.replace("/appv1/Mailer");
    }

    dispatch(loadConnections());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (notice) {
      toast.add({
        type: notice.kind,
        title: notice.kind === "success" ? "Success" : "Error",
        description: notice.text,
      });
      dispatch(setNotice(null));
    }
  }, [notice, dispatch]);

  return {
    connected,
    listLoading,
    errorCount,
    refresh: () => dispatch(loadConnections()),
  };
}

