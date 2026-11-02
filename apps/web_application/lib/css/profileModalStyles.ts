import { cva } from "class-variance-authority";

export const profileModalStyles = {
  label: "text-xs uppercase tracking-wider text-foreground",
  input: "h-12 text-base md:text-base bg-mist dark:bg-mist border-0 rounded-none text-foreground border",
  readOnlyInput: "h-12 text-base md:text-base border-0 rounded-none",
  charCount: "text-[11px] font-bold text-muted-foreground tabular-nums",
  
  form: "space-y-5",
  formGrid: "grid gap-6 sm:grid-cols-[174px_1fr]",
  photoAndSub: "flex sm:flex-col gap-5",
  fieldGroup: "space-y-1.5",
  photoContainer: "relative h-32 w-32 sm:h-42.5 sm:w-42.5 shrink-0 bg-mist flex items-center justify-center overflow-hidden rounded-2xl border border-border/50 group transition-all duration-300 hover:border-primary/50 hover:shadow-md",
  photoImage: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
  photoIcon: "h-12 w-12 text-muted-foreground",
  
  fieldsContainer: "space-y-4",
  fieldHeader: "flex items-center justify-between",
  requiredStar: "text-ember",
  handleInput: "font-mono",
  textarea: "min-h-16 max-h-24 overflow-y-auto text-base md:text-base bg-mist dark:bg-mist rounded-none text-foreground border",
  
  twoColGrid: "grid grid-cols-2 gap-4",
  labelWithIcon: "flex items-center gap-1.5",
  lockIcon: "h-3 w-3 text-muted-foreground",
  
  errorAlert: "px-4 py-2.5 bg-destructive/10 text-destructive rounded-none text-sm font-bold",
  
  footer: "gap-3 sm:gap-3",
  cancelButton: "px-6 text-sm uppercase rounded-none bg-mist text-foreground hover:opacity-80 border",
  saveButton: "px-6 text-sm hover:text-on-ember uppercase rounded-none gap-2 border bg-primary text-primary-foreground hover:bg-primary/90",
  loaderIcon: "h-4 w-4 animate-spin",
  
  modalContent: "sm:max-w-2xl smokebackground ring-0 p-6 sm:p-8 border",
  modalTitle: "font-display text-4xl font-bold uppercase tracking-tight text-foreground",
  modalDescription: "text-sm text-muted-foreground",
  
  loadingContainer: "flex flex-col items-center justify-center gap-3 py-10",
  loadingSpinner: "h-6 w-6 animate-spin text-muted-foreground",
  loadingText: "text-sm font-bold text-muted-foreground",
  errorText: "text-lg text-destructive",
  retryButton: "h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-none border-0 bg-mist",
};

export const subscriptionBadgeStyles = cva(
  "inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider border rounded-none",
  {
    variants: {
      subscription: {
        pro: "bg-lime-soft text-on-lime",
        free: "bg-inkband text-on-inkband",
        none: "bg-mist text-muted-foreground",
      },
    },
    defaultVariants: {
      subscription: "none",
    },
  }
);
