export function buildVCard(props: Record<string, unknown>): string {
  const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const esc = (v: string) =>
    v
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  const name = text(props["name"]);
  if (name) lines.push(`FN:${esc(name)}`);
  const company = text(props["company"]);
  if (company) lines.push(`ORG:${esc(company)}`);
  const title = text(props["title"]);
  if (title) lines.push(`TITLE:${esc(title)}`);
  const email = text(props["email"]);
  if (email) lines.push(`EMAIL:${esc(email)}`);
  const phone = text(props["phone"]);
  if (phone) lines.push(`TEL;TYPE=CELL:${esc(phone)}`);
  const website = text(props["website"]);
  if (website) lines.push(`URL:${esc(website)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}
