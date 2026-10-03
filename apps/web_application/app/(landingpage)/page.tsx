import type { Metadata } from "next";
import { Hero } from "@/components/LandingPage/hero";
import { Features } from "@/components/LandingPage/features";
import { SpeedMatrix } from "@/components/LandingPage/speed-matrix";
import { Pricing } from "@/components/LandingPage/pricing";
import { FAQ, faqs } from "@/components/LandingPage/faq";

export const metadata: Metadata = {
  title: "SimpLx — Short Links, Big Impact | Fast URL Shortener with Analytics",
  description:
    "SimpLx is a blazing-fast URL shortener with real-time analytics, custom domains, QR codes, and a developer-friendly API. Shorten your first link in seconds — free forever plan.",
  keywords: [
    "url shortener",
    "link shortener",
    "short links",
    "link analytics",
    "custom short links",
    "qr code generator",
    "link management",
    "branded links",
    "SimpLx",
  ],
  authors: [{ name: "SimpLx" }],
  creator: "SimpLx",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "SimpLx",
    title: "SimpLx — Short Links, Big Impact",
    description:
      "Shorten links in seconds. Track every click with real-time analytics, custom domains, and QR codes.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "SimpLx — Short Links, Big Impact",
    description:
      "Shorten links in seconds. Track every click with real-time analytics, custom domains, and QR codes.",
  },
};

function JsonLd() {
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SimpLx",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Fast URL shortener with real-time analytics, custom domains, QR codes, and a developer API.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free plan with 25 links per month.",
    },
  };
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}

export default function Page() {
  return (
    <>
      <JsonLd />
      <Hero />
      <Features />
      <SpeedMatrix />
      <Pricing />
      <FAQ />
    </>
  );
}
