import { cn } from "@/lib/utils";
import { buildVCard } from "@/server/lib/vcard";
import { asString, isHttpUrl } from "./blockUtils";
import type { BlockProps } from "./rowTypes";
import { LinkShell } from "./LinkShell";

export function ContactBlock({ props, blockKey, text, subtle, row, accent, compact, interactive, hidden, onLinkClick }: BlockProps) {
  const name = asString(props["name"]);
  const title = asString(props["title"]);
  const company = asString(props["company"]);
  const email = asString(props["email"]);
  const phone = asString(props["phone"]);
  const website = asString(props["website"]);
  const buttonLabel =
    asString(props["buttonLabel"]).length > 0
      ? asString(props["buttonLabel"])
      : "Save contact";
  const websiteHref = isHttpUrl(website) ? website : null;
  const vcardHref =
    "data:text/vcard;charset=utf-8," + encodeURIComponent(buildVCard(props));
  const notifyClick = (href: string) => onLinkClick?.(blockKey, href);
  const chipClass = cn(
    "rounded-full font-medium",
    compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs",
    interactive && "transition-opacity hover:opacity-80"
  );
  const chipStyle = { backgroundColor: accent, color: "#FFFFFF" };
  return (
    <div
      className="flex w-full flex-col items-center gap-1.5 rounded-lg px-3 py-3 text-center"
      style={{ backgroundColor: row }}
      aria-hidden={hidden}
    >
      <span
        className={cn("font-bold", compact ? "text-sm" : "text-base")}
        style={{ color: text }}
      >
        {name}
      </span>
      {(title.length > 0 || company.length > 0) && (
        <span
          className={cn(compact ? "text-xs" : "text-sm")}
          style={{ color: subtle }}
        >
          {[title, company].filter((part) => part.length > 0).join(" \u00B7 ")}
        </span>
      )}
      <span
        className={cn(
          "flex flex-wrap items-center justify-center",
          compact ? "gap-1" : "gap-1.5"
        )}
      >
        {email.length > 0 && (
          <LinkShell
            href={"mailto:" + email}
            interactive={interactive}
            label={"Email " + name}
            onPress={notifyClick}
            className={chipClass}
            style={chipStyle}
          >
            Email
          </LinkShell>
        )}
        {phone.length > 0 && (
          <LinkShell
            href={"tel:" + phone.replace(/\s+/g, "")}
            interactive={interactive}
            label={"Call " + name}
            onPress={notifyClick}
            className={chipClass}
            style={chipStyle}
          >
            Call
          </LinkShell>
        )}
        {websiteHref && (
          <LinkShell
            href={websiteHref}
            interactive={interactive}
            label={"Visit " + name}
            onPress={notifyClick}
            className={chipClass}
            style={chipStyle}
          >
            Website
          </LinkShell>
        )}
        {interactive ? (
          <a
            href={vcardHref}
            download={(name || "contact") + ".vcf"}
            onClick={() => notifyClick("vcard:download")}
            className={chipClass}
            style={chipStyle}
          >
            {buttonLabel}
          </a>
        ) : (
          <span className={chipClass} style={chipStyle}>
            {buttonLabel}
          </span>
        )}
      </span>
    </div>
  );
}
