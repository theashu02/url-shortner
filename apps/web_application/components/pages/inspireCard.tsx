import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface InspireCardProps {
  title: string;
  text: string;
  image: string;
  imageAlt: string;
}

export function InspireCard({ title, text, image, imageAlt }: InspireCardProps) {
  return (
    <article className="grid grid-cols-1 overflow-hidden border border-border bg-card sm:grid-cols-2">
      <div className="flex flex-col justify-center gap-1.5 p-4 sm:p-5">
        <h3 className="text-lg font-extrabold text-foreground sm:text-xl">
          {title}
        </h3>
        <p className="text-sm text-foreground/75">{text}</p>
        <Link
          href="#"
          className="mt-1 inline-flex cursor-not-allowed items-center gap-1.5 text-md text-ember"
          title="Page builder is coming soon"
        >
          Get started
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="relative aspect-16/10 w-full sm:aspect-auto sm:min-h-60">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </article>
  );
}
