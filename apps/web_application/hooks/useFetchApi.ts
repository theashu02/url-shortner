import { useState } from "react";

type ApiError = {
  message?: string;
  value?: unknown;
};

type TreatyLikeResponse<TSuccess, TError extends ApiError = ApiError> = {
  data: TSuccess | TError | null | undefined;
  error: { value?: unknown; message?: string } | null;
};

export function useFetchApi<TSuccess, TError extends ApiError = ApiError>() {
  const [data, setData] = useState<TSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSuccessPayload = (payload: unknown): payload is TSuccess => {
    if (
      payload === null ||
      payload === undefined ||
      typeof payload !== "object"
    ) {
      return false;
    }

    return !("message" in payload);
  };

  const isErrorPayload = (payload: unknown): payload is TError => {
    if (
      payload === null ||
      payload === undefined ||
      typeof payload !== "object"
    ) {
      return false;
    }

    return "message" in payload;
  };

  const execute = async (
    apiCall: () => Promise<TreatyLikeResponse<TSuccess, TError>>,
  ): Promise<TSuccess | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiCall();
      const payload = res.data;

      if (isSuccessPayload(payload)) {
        setData(payload);
        return payload;
      }

      if (isErrorPayload(payload)) {
        setError(String(payload.message ?? "An error occurred"));
        return null;
      }

      if (res.error) {
        let errorMsg = res.error.message || "An error occurred";
        if (res.error.value !== undefined && res.error.value !== null) {
          if (
            typeof res.error.value === "object" &&
            res.error.value !== null &&
            "message" in (res.error.value as Record<string, unknown>)
          ) {
            errorMsg = String(
              (res.error.value as { message: unknown }).message,
            );
          } else if (typeof res.error.value === "string") {
            errorMsg = res.error.value;
          } else {
            errorMsg = JSON.stringify(res.error.value);
          }
        }
        setError(errorMsg);
        return null;
      }

      setError("An error occurred");
      return null;
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while fetching.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { data, error, loading, execute, reset, setData };
}
