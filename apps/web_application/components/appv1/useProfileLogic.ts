import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  setProfileModalOpen,
  type UserProfile,
} from "@/store/profile-slice";
import { toast } from "@/components/ui/toast";

export function useProfileFormLogic(profile: UserProfile) {
  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.profile.saving);
  const uploadingImage = useAppSelector((s) => s.profile.uploadingImage);

  const [name, setName] = useState(profile.name ?? "");
  const [handle, setHandle] = useState(profile.handle ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB.");
        return;
      }
      setError(null);
      
      const result = await dispatch(uploadProfileImage(file));
      if (uploadProfileImage.fulfilled.match(result)) {
        toast.add({
          type: "success",
          title: "Image updated",
          description: "Your profile photo has been updated.",
        });
      } else {
        setError(result.error.message ?? "Failed to upload image.");
      }
    }
  };

  const handleRemoveImage = async () => {
    setError(null);
    const result = await dispatch(deleteProfileImage());
    if (deleteProfileImage.fulfilled.match(result)) {
      toast.add({
        type: "success",
        title: "Image removed",
        description: "Your profile photo has been removed.",
      });
    } else {
      setError(result.error.message ?? "Failed to remove image.");
    }
  };

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
      })
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
    uploadingImage,
    handleFileChange,
    handleRemoveImage,
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
