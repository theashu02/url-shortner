import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "./scroll-reveal";
import { Eyebrow } from "./eyebrow";

export const faqs = [
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

export function FAQ() {
  return (
    <section aria-label="Frequently asked questions" className="py-20 md:py-24 px-4 md:px-8 bg-mist">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-10">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mt-4 mb-4 tracking-tight leading-tight">
              Frequently asked <span className="text-ember">questions</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about SimpLx.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-card rounded-none p-4 md:p-6 border border-line shadow-sm">
            <Accordion className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <ScrollReveal key={index} delay={index * 80} y={16}>
                  <AccordionItem value={`item-${index}`} className="border border-line rounded-none overflow-hidden bg-card data-[state=open]:shadow-sm transition-shadow">
                    <AccordionTrigger className="text-left font-semibold text-lg tracking-tight text-foreground hover:text-ember-deep transition-colors px-5 py-4 hover:no-underline data-[state=open]:border-b data-[state=open]:border-line">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed px-5 pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </ScrollReveal>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
