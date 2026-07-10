import { useState } from "react";

type EdenResponse<T> = {
  data: T | null;
  error: { value?: unknown; message?: string } | null;
};

export function useFetchApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = async (apiCall: () => Promise<EdenResponse<T>>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall();
      if (res.data !== null && res.data !== undefined) {
        setData(res.data);
      } else if (res.error) {
        const errorMsg = res.error.value ? String(res.error.value) : res.error.message || "An error occurred";
        setError(errorMsg);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while fetching.");
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, execute };
}
