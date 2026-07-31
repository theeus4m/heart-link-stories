import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";

export function FaqSection() {
  const { t } = useI18n();
  const items = [1, 2, 3, 4, 5].map((n) => ({ q: t(`faq.q${n}`), a: t(`faq.a${n}`) }));

  return (
    <section id="faq" className="border-t border-gold/15 bg-cream/40 py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        <div className="min-w-0">
          <p className="eyebrow">{t("faq.eyebrow")}</p>
          <h2 className="h1 mt-4 text-plum">{t("faq.title")}</h2>
        </div>
        <Accordion type="single" collapsible className="min-w-0">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-b border-gold/20 last:border-0">
              <AccordionTrigger className="py-5 text-left font-display text-lg text-plum hover:text-vinho hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] font-light leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
