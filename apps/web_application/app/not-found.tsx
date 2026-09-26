import { LinkError } from "@/components/LandingPage/link-error";

export default function NotFound() {
  const type = "not found";
  return <LinkError type={type} />;
}
