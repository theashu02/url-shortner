import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  DEFAULT_SMTP_CONFIG,
  type MailConnectionStatus,
  type MailProviderConnection,
  type MailProviderId,
  type SmtpConfig,
  type SmtpFormValues,
} from "@/components/mailer/mailer-types";
import {
  disconnectMailbox as apiDisconnect,
  fetchConnections,
  fetchStartUrl,
  sendTestMail as apiSendTest,
  verifySmtp as apiVerifySmtp,
  type MailConnectionSummary,
} from "@/components/mailer/mailer-api";
import type { RootState } from "./index";

export interface MailerNotice {
  kind: "success" | "error";
  text: string;
}

export interface MailerConnectionState {
  connections: Record<MailProviderId, MailProviderConnection>;
  smtpConfig: SmtpConfig;
  smtpDialogOpen: boolean;
  listLoading: boolean;
  smtpSaving: boolean;
  testingFor: string | null;
  notice: MailerNotice | null;
}

function disconnected(provider: MailProviderId): MailProviderConnection {
  return { provider, status: "disconnected", email: null, connectedAt: null, error: null };
}

const initialState: MailerConnectionState = {
  connections: {
    gmail: disconnected("gmail"),
    outlook: disconnected("outlook"),
    smtp: disconnected("smtp"),
  },
  smtpConfig: DEFAULT_SMTP_CONFIG,
  smtpDialogOpen: false,
  listLoading: false,
  smtpSaving: false,
  testingFor: null,
  notice: null,
};

function applySummary(
  state: MailerConnectionState,
  summary: MailConnectionSummary
): void {
  const conn = state.connections[summary.provider];
  conn.status = summary.status === "connected" ? "connected" : "disconnected";
  conn.email = summary.email;
  conn.connectedAt = summary.connectedAt;
  conn.error = null;
  if (summary.provider === "smtp" && summary.smtp) {
    state.smtpConfig = summary.smtp;
  }
}

/** Load saved connections from the server (source of truth). */
export const loadConnections = createAsyncThunk<
  MailConnectionSummary[],
  void,
  { state: RootState; rejectValue: string }
>("mailer/loadConnections", async (_, { rejectWithValue }) => {
  try {
    return await fetchConnections();
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Could not load connections.");
  }
});

/** Start OAuth by navigating the browser to the provider consent screen. */
export const beginOAuthConnect = createAsyncThunk<
  void,
  Exclude<MailProviderId, "smtp">,
  { state: RootState; rejectValue: { provider: MailProviderId; error: string } }
>("mailer/beginOAuthConnect", async (provider, { rejectWithValue }) => {
  try {
    const url = await fetchStartUrl(provider);
    window.location.href = url;
  } catch (err) {
    return rejectWithValue({
      provider,
      error: err instanceof Error ? err.message : "Could not start OAuth.",
    });
  }
});

export interface TestSmtpArgs {
  values: SmtpFormValues;
}

/** Verify SMTP against the server; the server encrypts and saves on success. */
export const testSmtpConnection = createAsyncThunk<
  MailConnectionSummary,
  TestSmtpArgs,
  { state: RootState; rejectValue: string }
>("mailer/testSmtpConnection", async ({ values }, { rejectWithValue }) => {
  try {
    return await apiVerifySmtp(values);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "SMTP verification failed.");
  }
});

/** Revoke (best-effort) and delete a saved connection. */
export const disconnectMailbox = createAsyncThunk<
  MailProviderId,
  { provider: MailProviderId; email: string },
  { state: RootState; rejectValue: { provider: MailProviderId; error: string } }
>("mailer/disconnectMailbox", async ({ provider, email }, { rejectWithValue }) => {
  try {
    await apiDisconnect(provider, email);
    return provider;
  } catch (err) {
    return rejectWithValue({
      provider,
      error: err instanceof Error ? err.message : "Disconnect failed.",
    });
  }
});

/** Send a test mail from a saved connection to its own mailbox. */
export const sendTestMail = createAsyncThunk<
  string,
  { provider: MailProviderId; email: string },
  { state: RootState; rejectValue: string }
>("mailer/sendTestMail", async ({ provider, email }, { rejectWithValue }) => {
  try {
    return await apiSendTest(provider, email);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Test mail failed.");
  }
});

const mailerConnectionSlice = createSlice({
  name: "mailerConnection",
  initialState,
  reducers: {
    connectionStarted(state, action: PayloadAction<MailProviderId>) {
      const conn = state.connections[action.payload];
      conn.status = "connecting";
      conn.error = null;
    },
    connectionSucceeded(
      state,
      action: PayloadAction<{ provider: MailProviderId; email: string }>
    ) {
      const conn = state.connections[action.payload.provider];
      conn.status = "connected";
      conn.email = action.payload.email;
      conn.connectedAt = new Date().toISOString();
      conn.error = null;
    },
    connectionFailed(
      state,
      action: PayloadAction<{ provider: MailProviderId; error: string }>
    ) {
      const conn = state.connections[action.payload.provider];
      conn.status = "error";
      conn.error = action.payload.error;
    },
    clearProviderError(state, action: PayloadAction<MailProviderId>) {
      state.connections[action.payload].error = null;
      if (state.connections[action.payload].status === "error") {
        state.connections[action.payload].status = "disconnected";
      }
    },
    setSmtpDialogOpen(state, action: PayloadAction<boolean>) {
      state.smtpDialogOpen = action.payload;
    },
    setNotice(state, action: PayloadAction<MailerNotice | null>) {
      state.notice = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConnections.pending, (state) => {
        state.listLoading = true;
      })
      .addCase(loadConnections.fulfilled, (state, action) => {
        state.listLoading = false;
        state.connections.gmail = disconnected("gmail");
        state.connections.outlook = disconnected("outlook");
        state.connections.smtp = disconnected("smtp");
        for (const summary of action.payload) {
          if (summary.provider in state.connections) applySummary(state, summary);
        }
      })
      .addCase(loadConnections.rejected, (state, action) => {
        state.listLoading = false;
        state.notice = {
          kind: "error",
          text: (action.payload as string | undefined) ?? "Could not load connections.",
        };
      })
      .addCase(beginOAuthConnect.pending, (state, action) => {
        const conn = state.connections[action.meta.arg];
        conn.status = "connecting";
        conn.error = null;
      })
      .addCase(beginOAuthConnect.fulfilled, () => {
        // Browser navigates to the provider; callback lands back on /appv1/Mailer.
      })
      .addCase(beginOAuthConnect.rejected, (state, action) => {
        const payload = action.payload as
          | { provider: MailProviderId; error: string }
          | undefined;
        if (!payload) return;
        const conn = state.connections[payload.provider];
        conn.status = "error";
        conn.error = payload.error;
      })
      .addCase(testSmtpConnection.pending, (state) => {
        state.smtpSaving = true;
        state.connections.smtp.status = "connecting";
        state.connections.smtp.error = null;
      })
      .addCase(testSmtpConnection.fulfilled, (state, action) => {
        state.smtpSaving = false;
        applySummary(state, action.payload);
        state.smtpDialogOpen = false;
        state.notice = { kind: "success", text: "SMTP connected and saved." };
      })
      .addCase(testSmtpConnection.rejected, (state, action) => {
        state.smtpSaving = false;
        state.connections.smtp.status = "error";
        state.connections.smtp.error =
          (action.payload as string | undefined) ?? "SMTP verification failed.";
      })
      .addCase(disconnectMailbox.fulfilled, (state, action) => {
        state.connections[action.payload] = disconnected(action.payload);
        state.notice = { kind: "success", text: "Mailbox disconnected." };
      })
      .addCase(disconnectMailbox.rejected, (state, action) => {
        const payload = action.payload as
          | { provider: MailProviderId; error: string }
          | undefined;
        if (!payload) return;
        state.connections[payload.provider].error = payload.error;
        state.notice = { kind: "error", text: payload.error };
      })
      .addCase(sendTestMail.pending, (state, action) => {
        state.testingFor = action.meta.arg.email;
      })
      .addCase(sendTestMail.fulfilled, (state, action) => {
        state.testingFor = null;
        state.notice = { kind: "success", text: action.payload };
      })
      .addCase(sendTestMail.rejected, (state, action) => {
        state.testingFor = null;
        state.notice = {
          kind: "error",
          text: (action.payload as string | undefined) ?? "Test mail failed.",
        };
      });
  },
});

export const {
  connectionStarted,
  connectionSucceeded,
  connectionFailed,
  clearProviderError,
  setSmtpDialogOpen,
  setNotice,
} = mailerConnectionSlice.actions;

const selectConnections = (state: RootState) => state.mailerConnection.connections;
export const selectConnectedProviders = createSelector(
  [selectConnections],
  (connections) =>
    (Object.values(connections) as MailProviderConnection[]).filter(
      (c: MailProviderConnection) => c.status === "connected",
    ),
);

export const selectConnectionStatus = (
  state: RootState,
  provider: MailProviderId
): MailConnectionStatus => state.mailerConnection.connections[provider].status;

export default mailerConnectionSlice.reducer;
