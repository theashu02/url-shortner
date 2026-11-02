export function formatCreated(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return "Created " + date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatUpdatedRelative(value: string): string {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "updated recently";
  const diffDays = Math.max(0, Math.round((Date.now() - time) / 86400000));
  if (diffDays <= 0) return "Updated today";
  if (diffDays === 1) return "Updated yesterday";
  if (diffDays < 30) return "Updated " + diffDays + " days ago";
  return "Updated " + new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function pluralize(count: number, singular: string): string {
  return count + " " + (count === 1 ? singular : singular + "s");
}
