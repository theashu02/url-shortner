"use client";

import Image from "next/image";
import { Camera, Crown, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type UserProfile } from "@/store/profile-slice";
import { useProfileFormLogic, useProfileModalLogic } from "./useProfileLogic";
import {
  profileModalStyles as styles,
  subscriptionBadgeStyles,
} from "@/lib/css/profileModalStyles";

function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <span className={styles.charCount}>
      {value.length}/{max}
    </span>
  );
}

function SubscriptionBadge({ subscription }: { subscription: UserProfile["subscription"] }) {
  const key = subscription ?? "none";
  return (
    <span className={subscriptionBadgeStyles({ subscription: key })}>
      {subscription === "pro" && <Crown className="h-4 w-4" />}
      {subscription ?? "None"}
    </span>
  );
}

function ProfileForm({ profile }: { profile: UserProfile }) {
  const {
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
  } = useProfileFormLogic(profile);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.photoAndSub}>
          <div className={styles.fieldGroup}>
            <div className="flex justify-between items-center mb-2">
              <Label className={`${styles.label} mb-0`}>Photo</Label>
              {profile.image && !uploadingImage && (
                <button 
                  type="button" 
                  onClick={handleRemoveImage}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <div 
              className={`${styles.photoContainer} ${uploadingImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => {
                if (!uploadingImage) {
                  document.getElementById("profile-image-upload")?.click();
                }
              }}
            >
              {uploadingImage ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin w-8 h-8 text-primary mb-2" />
                  <span className="text-xs font-medium text-muted-foreground">Uploading...</span>
                </div>
              ) : profile.image ? (
                <>
                  <Image
                    src={profile.image}
                    alt="Profile photo"
                    width={170}
                    height={170}
                    className={styles.photoImage}
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="w-8 h-8 text-white mb-2" />
                    <span className="text-white text-xs font-medium">Change Photo</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-xs font-medium">Upload Photo</span>
                </div>
              )}
            </div>
            <Input 
              id="profile-image-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
              disabled={uploadingImage}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Label className={styles.label}>Subscription</Label>
            <SubscriptionBadge subscription={profile.subscription} />
          </div>
        </div>

        {/* Editable + read-only fields */}
        <div className={styles.fieldsContainer}>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldHeader}>
              <Label htmlFor="profileName" className={styles.label}>
                Name <span className={styles.requiredStar}>*</span>
              </Label>
              <CharCount value={name} max={50} />
            </div>
            <Input
              id="profileName"
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 50))}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.fieldHeader}>
              <Label htmlFor="profileHandle" className={styles.label}>
                Nickname
              </Label>
              <CharCount value={handle} max={50} />
            </div>
            <Input
              id="profileHandle"
              type="text"
              placeholder="unique-nickname"
              value={handle}
              onChange={(e) =>
                setHandle(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50))
              }
              className={`${styles.input} ${styles.handleInput}`}
            />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.fieldHeader}>
              <Label htmlFor="profileBio" className={styles.label}>
                Bio
              </Label>
              <CharCount value={bio} max={500} />
            </div>
            <Textarea
              id="profileBio"
              placeholder="Tell the world about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              rows={2}
              className={styles.textarea}
            />
          </div>

          <div className={styles.twoColGrid}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="profileEmail" className={`${styles.label} ${styles.labelWithIcon}`}>
                Email <Lock className={styles.lockIcon} />
              </Label>
              <Input
                id="profileEmail"
                type="email"
                value={profile.email ?? ""}
                disabled
                className={styles.readOnlyInput}
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label
                htmlFor="profileProvider"
                className={`${styles.label} ${styles.labelWithIcon}`}
              >
                Provider <Lock className={styles.lockIcon} />
              </Label>
              <Input
                id="profileProvider"
                type="text"
                value={profile.provider.charAt(0).toUpperCase() + profile.provider.slice(1)}
                disabled
                className={styles.readOnlyInput}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className={styles.errorAlert}>
          {error}
        </p>
      )}

      <DialogFooter className={styles.footer}>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={saving}
          className={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !name.trim()} className={styles.saveButton}>
          {saving ? (
            <>
              <Loader2 className={styles.loaderIcon} />
              <span>Saving</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ProfileModal() {
  const { open, profile, loading, fetchError, handleOpenChange, handleRetry } =
    useProfileModalLogic();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={styles.modalContent}>
        <DialogHeader>
          <DialogTitle className={styles.modalTitle}>Profile</DialogTitle>
          <DialogDescription className={styles.modalDescription}>
            Manage your account details.
          </DialogDescription>
        </DialogHeader>

        {profile ? (
          <ProfileForm key={profile.id} profile={profile} />
        ) : (
          <div className={styles.loadingContainer}>
            {loading ? (
              <>
                <Loader2 className={styles.loadingSpinner} />
                <p className={styles.loadingText}>Loading profile...</p>
              </>
            ) : (
              <>
                <p className={styles.errorText}>{fetchError ?? "Failed to load profile."}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetry}
                  className={styles.retryButton}
                >
                  Retry
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
