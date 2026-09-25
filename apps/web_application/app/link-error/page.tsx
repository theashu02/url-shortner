import { LinkError } from "@/components/LandingPage/link-error";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const searchParams = await props.searchParams;
  const type = searchParams?.type as string | undefined;

  return <LinkError type={type || "link_not_found"} />;
}
