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
    if (payload === null || payload === undefined || typeof payload !== "object") {
      return false;
    }

    return !("message" in payload);
  };

  const isErrorPayload = (payload: unknown): payload is TError => {
    if (payload === null || payload === undefined || typeof payload !== "object") {
      return false;
    }

    return "message" in payload;
  };

  const execute = async (apiCall: () => Promise<TreatyLikeResponse<TSuccess, TError>>) => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiCall();
      const payload = res.data;

      if (isSuccessPayload(payload)) {
        setData(payload);
        return;
      }

      if (isErrorPayload(payload)) {
        setError(String(payload.message ?? "An error occurred"));
        return;
      }

      if (res.error) {
        const errorMsg =
          res.error.value !== undefined && res.error.value !== null
            ? String(res.error.value)
            : res.error.message || "An error occurred";
        setError(errorMsg);
        return;
      }

      setError("An error occurred");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while fetching.");
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, execute };
}
