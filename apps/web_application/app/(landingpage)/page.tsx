import type { Metadata } from "next";
import { Hero } from "@/components/LandingPage/hero";
import { Marquee } from "@/components/LandingPage/marquee";
import { Features } from "@/components/LandingPage/features";
import { SpeedMatrix } from "@/components/LandingPage/speed-matrix";
import { Pricing } from "@/components/LandingPage/pricing";
import { FAQ, faqs } from "@/components/LandingPage/faq";
import { CTA } from "@/components/LandingPage/cta";

export const metadata: Metadata = {
  title: "SimpLx — Short Links, Big Impact | Fast URL Shortener with Analytics",
  description:
    "SimpLx is a blazing-fast URL shortener with real-time analytics, custom domains, QR codes, and a developer-friendly API. Shorten your first link in seconds — free forever plan available.",
  keywords: [
    "url shortener",
    "link shortener",
    "short links",
    "shorten url",
    "link analytics",
    "click tracking",
    "custom short links",
    "branded short links",
    "qr code generator",
    "link management",
    "link management platform",
    "branded links",
    "custom domain short links",
    "free url shortener",
    "url shortener with analytics",
    "best url shortener",
    "SimpLx",
  ],
  authors: [{ name: "SimpLx" }],
  creator: "SimpLx",
  publisher: "SimpLx",
  category: "Technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SimpLx",
    title: "SimpLx — Short Links, Big Impact | Free URL Shortener",
    description:
      "Shorten links in seconds. Track every click with real-time analytics, custom domains, QR codes, and a developer API. Free plan — no credit card required.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "SimpLx — Short Links, Big Impact",
    description:
      "Shorten links in seconds. Track every click with real-time analytics, custom domains, and QR codes. Free forever plan.",
    creator: "@simplx",
  },
};

function JsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SimpLx",
    url: "https://simplx.co",
    logo: "https://simplx.co/favicon.ico",
    sameAs: [],
    description:
      "Enterprise-grade URL shortening platform with real-time analytics, custom domains, and developer API.",
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SimpLx",
    url: "https://simplx.co",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://simplx.co/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SimpLx",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Fast URL shortener with real-time analytics, custom domains, QR codes, and a developer API.",
    featureList: [
      "Lightning fast redirection with Redis edge caching",
      "Real-time click analytics with geographic tracking",
      "Custom branded domains",
      "Dynamic QR code generation",
      "Developer REST API",
      "Enterprise-grade security with rate limiting and DDoS protection",
    ],
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
        description: "Free plan with 25 links per month, standard analytics.",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "12",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "12",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
        description:
          "Pro plan with 5,000 links/month, advanced analytics, custom domains, and API access.",
      },
    ],
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

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://simplx.co",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}

export default function Page() {
  return (
    <>
      <JsonLd />
      <Hero />
      <Marquee />
      <Features />
      <SpeedMatrix />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
