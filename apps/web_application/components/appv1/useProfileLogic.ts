import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchProfile,
  updateProfile,
  setProfileModalOpen,
  type UserProfile,
} from "@/store/profile-slice";
import { toast } from "@/components/ui/toast";

export function useProfileFormLogic(profile: UserProfile) {
  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.profile.saving);

  const [name, setName] = useState(profile.name ?? "");
  const [handle, setHandle] = useState(profile.handle ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!saving) dispatch(setProfileModalOpen(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setError(null);
    const result = await dispatch(
      updateProfile({
        name: name.trim(),
        handle: handle.trim(),
        bio: bio.trim(),
      }),
    );

    if (updateProfile.fulfilled.match(result)) {
      toast.add({
        type: "success",
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      dispatch(setProfileModalOpen(false));
    } else {
      setError(result.error.message ?? "An error occurred");
    }
  };

  return {
    name,
    setName,
    handle,
    setHandle,
    bio,
    setBio,
    error,
    saving,
    handleClose,
    handleSubmit,
  };
}

export function useProfileModalLogic() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.profile.isModalOpen);
  const profile = useAppSelector((s) => s.profile.profile);
  const loading = useAppSelector((s) => s.profile.loading);
  const saving = useAppSelector((s) => s.profile.saving);
  const fetchError = useAppSelector((s) => s.profile.error);

  useEffect(() => {
    if (open) dispatch(fetchProfile());
  }, [open, dispatch]);

  const handleOpenChange = (next: boolean) => {
    if (!saving) dispatch(setProfileModalOpen(next));
  };

  const handleRetry = () => {
    dispatch(fetchProfile());
  };

  return {
    open,
    profile,
    loading,
    saving,
    fetchError,
    handleOpenChange,
    handleRetry,
  };
}
