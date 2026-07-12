import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export interface EmailAuthFormState {
  name: string;
  email: string;
  password: string;
}

export function useEmailAuth() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "register" ? "register" : "signin";

  const [form, setForm] = useState<EmailAuthFormState>({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof EmailAuthFormState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const clearError = () => setError(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("email-password", {
        email: form.email,
        password: form.password,
        name: form.name,
        isRegister: mode === "register" ? "true" : "false",
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError(
          mode === "register"
            ? "Registration failed. Email may already be in use."
            : "Invalid email or password. If you signed up with Google, use that instead."
        );
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    mode,
    error,
    loading,
    handleInputChange,
    clearError,
    handleSubmit,
  };
}
