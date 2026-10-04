import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { createShortLink, clearError } from "@/store/shorten-slice";
import { toast } from "@/components/ui/toast";
import { urlRegex } from "@/lib/constant";

export function useShortenUrl() {
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const dispatch = useAppDispatch();
  const { loading, errorMsg } = useAppSelector((state) => state.shorten);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!urlRegex.test(url.trim())) {
      toast.add({
        type: "error",
        description: "Please enter a valid URL!",
      });
      return;
    }

    setShortenedUrl("");
    dispatch(clearError());

    try {
      const res = await dispatch(createShortLink(url)).unwrap();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setShortenedUrl(`${origin}/${res}`);
      setUrl("");
      toast.add({
        type: "success",
        description: "Link Shortened Successfully!",
      });
    } catch (err: unknown) {
      console.error("Hero shorten error:", err);
      // The error is already stored in redux state `errorMsg`, 
      // but we can also handle it locally if we want.
    }
  };

  const copyToClipboard = () => {
    if (!shortenedUrl) return;
    navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    url,
    setUrl,
    loading,
    shortenedUrl,
    errorMsg,
    copied,
    handleShorten,
    copyToClipboard,
  };
}
