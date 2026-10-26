"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { appendLinkToPage, fetchPickerPages, resetPagePicker } from "@/store/pages-slice";
import type { LinkItem } from "./types";

function defaultLabel(url: string): string {
  return url.replace(/^https?:\/\//, "").slice(0, 80);
}

export function useAddToPageDialog(link: LinkItem) {
  const dispatch = useAppDispatch();
  const pages = useAppSelector((state) => state.pages.pickerPages);
  const loading = useAppSelector((state) => state.pages.pickerLoading);
  const pickerError = useAppSelector((state) => state.pages.pickerError);
  const saving = useAppSelector((state) => state.pages.appending);
  const appendError = useAppSelector((state) => state.pages.appendError);
  const savedPageId = useAppSelector((state) => state.pages.appendedPageId);
  const [pageId, setPageId] = useState("");
  const [label, setLabel] = useState(() => defaultLabel(link.url));

  useEffect(() => {
    dispatch(resetPagePicker());
    dispatch(fetchPickerPages());
  }, [dispatch]);

  const selectedPageId = pageId || pages[0]?._id || "";
  const error = pickerError ?? appendError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPageId || label.trim().length === 0 || saving) return;
    dispatch(
      appendLinkToPage({
        pageId: selectedPageId,
        label: label.trim(),
        url: link.url,
        shortCode: link.shortCode,
      })
    )
      .unwrap()
      .then(() => {
        toast.add({
          title: "Added to page",
          description: "The link was appended to your page draft.",
          type: "success",
        });
      })
      .catch(() => {});
  };

  return {
    pages,
    loading,
    error,
    saving,
    savedPageId,
    pageId: selectedPageId,
    setPageId,
    label,
    setLabel,
    handleSubmit,
  };
}
