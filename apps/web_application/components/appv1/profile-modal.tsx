"use client";

import { Crown, Loader2, Lock, User as UserIcon } from "lucide-react";
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

const labelClassName = "text-xs uppercase tracking-wider text-foreground";
const inputClassName = "h-12 text-base md:text-base bg-mist dark:bg-mist border-0 rounded-none text-foreground border";
const readOnlyClassName = "h-12 text-base md:text-base border-0 rounded-none";

function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
      {value.length}/{max}
    </span>
  );
}

const SUBSCRIPTION_STYLES = {
  pro: "bg-lime-soft text-on-lime",
  free: "bg-inkband text-on-inkband",
  none: "bg-mist text-muted-foreground",
} as const;

function SubscriptionBadge({ subscription }: { subscription: UserProfile["subscription"] }) {
  const key = subscription ?? "none";
  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider border rounded-none ${SUBSCRIPTION_STYLES[key]}`}
    >
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
    handleClose,
    handleSubmit,
  } = useProfileFormLogic(profile);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-6 sm:grid-cols-[170px_1fr]">
        {/* Photo + subscription */}
        <div className="flex sm:flex-col gap-5">
          <div className="space-y-1.5">
            <Label className={labelClassName}>Photo</Label>
            <div className="h-32 w-32 sm:h-42.5 sm:w-42.5 shrink-0 bg-mist flex items-center justify-center overflow-hidden rounded-none">
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.image} alt="Profile photo" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClassName}>Subscription</Label>
            <SubscriptionBadge subscription={profile.subscription} />
          </div>
        </div>

        {/* Editable + read-only fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profileName" className={labelClassName}>
                Name <span className="text-ember">*</span>
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
              className={inputClassName}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profileHandle" className={labelClassName}>
                Nickname
              </Label>
              <CharCount value={handle} max={50} />
            </div>
            <Input
              id="profileHandle"
              type="text"
              placeholder="unique-nickname"
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50))}
              className={`${inputClassName} font-mono`}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profileBio" className={labelClassName}>
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
              className="min-h-16 max-h-24 overflow-y-auto text-base md:text-base bg-mist dark:bg-mist rounded-none text-foreground border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="profileEmail" className={`${labelClassName} flex items-center gap-1.5`}>
                Email <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input id="profileEmail" type="email" value={profile.email ?? ""} disabled className={readOnlyClassName} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profileProvider" className={`${labelClassName} flex items-center gap-1.5`}>
                Provider <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input
                id="profileProvider"
                type="text"
                value={profile.provider.charAt(0).toUpperCase() + profile.provider.slice(1)}
                disabled
                className={readOnlyClassName}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="px-4 py-2.5 bg-destructive/10 text-destructive rounded-none text-sm font-bold">
          {error}
        </p>
      )}

      <DialogFooter className="gap-3 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={saving}
          className="px-6 text-sm uppercase rounded-none bg-mist text-foreground hover:opacity-80 border"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving || !name.trim()}
          className="px-6 text-sm hover:text-on-ember uppercase rounded-none gap-2 border bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /><span>Saving</span></>
          ) : (
            <span>Save Changes</span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ProfileModal() {
  const {
    open,
    profile,
    loading,
    fetchError,
    handleOpenChange,
    handleRetry,
  } = useProfileModalLogic();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl smokebackground ring-0 p-6 sm:p-8 border">
        <DialogHeader>
          <DialogTitle className="font-display text-4xl font-bold uppercase tracking-tight text-foreground">
            Profile
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Manage your account details.
          </DialogDescription>
        </DialogHeader>

        {profile ? (
          <ProfileForm key={profile.id} profile={profile} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm font-bold text-muted-foreground">Loading profile...</p>
              </>
            ) : (
              <>
                <p className="text-lg text-destructive">
                  {fetchError ?? "Failed to load profile."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetry}
                  className="h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-none border-0 bg-mist"
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
