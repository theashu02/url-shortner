import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "./scroll-reveal";

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
    <section aria-label="Frequently asked questions" className="py-32 px-4 md:px-8 bg-mist">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2 className="font-display font-bold text-5xl md:text-8xl text-foreground mb-6 uppercase tracking-tighter leading-[0.9]">
              FREQUENTLY ASKED<br />
              <span className="text-ember">QUESTIONS</span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-card rounded-none p-6 md:p-10 border-4 border-line">
            <Accordion className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-4 border-line rounded-none overflow-hidden bg-card data-[state=open]:bg-lake/10 transition-colors">
                  <AccordionTrigger className="text-left font-display font-bold text-xl md:text-2xl uppercase tracking-wider text-foreground hover:text-ember-deep transition-colors p-6 hover:no-underline data-[state=open]:border-b-4 data-[state=open]:border-line">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-bold leading-relaxed text-lg p-6 bg-lake/5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
