import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "Can I use my own custom domain?",
      answer: "Yes! On our Pro plan, you can easily connect your own domain (e.g., l.yourbrand.com) to maintain brand consistency across all your shortened links."
    },
    {
      question: "What kind of analytics do you provide?",
      answer: "We provide comprehensive, real-time analytics. You can track total clicks, unique visitors, geographic location (country/city), referring domains, device types, browsers, and operating systems."
    },
    {
      question: "Is there an API available for developers?",
      answer: "Absolutely. Our REST API allows you to programmatically create, manage, and retrieve analytics for your links. It's secured via API keys and is available on the Pro plan."
    },
    {
      question: "How do the dynamic QR codes work?",
      answer: "When you shorten a link, a dynamic QR code is automatically generated. 'Dynamic' means you can change the destination URL of the short link at any time without having to reprint or update the QR code itself."
    },
    {
      question: "How secure are my links?",
      answer: "We take security seriously. SimpLx includes built-in rate limiting, DDoS protection, and automatic malware scanning. You can also add password protection to specific links for sensitive content."
    }
  ];

  return (
    <section className="py-24 px-4 md:px-6">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="bg-card/45 backdrop-blur-md border border-border/40 rounded-none p-6 md:p-8 shadow-sm">
          <Accordion className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-heading text-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-xs">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
