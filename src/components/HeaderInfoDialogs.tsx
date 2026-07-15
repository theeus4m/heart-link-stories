import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";

export function HeaderInfoDialogs() {
  const { t } = useI18n();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  const faqItems = [1, 2, 3, 4, 5].map((n) => ({
    q: t(`faq.q${n}`),
    a: t(`faq.a${n}`),
  }));

  const triggerClass =
    "text-xs uppercase tracking-[0.22em] text-plum/80 hover:text-vinho transition-colors duration-300 px-2 py-1.5";

  return (
    <>
      {/* Sobre Nós */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogTrigger className={triggerClass}>{t("nav.about")}</DialogTrigger>
        <DialogContent className="max-w-lg rounded-sm border border-gold/30 bg-cream/85 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(107,39,55,0.35)] px-8 py-10">
          <DialogHeader className="space-y-3 text-left">
            <span className="eyebrow">{t("about.eyebrow")}</span>
            <DialogTitle className="font-display text-3xl text-plum leading-tight">
              {t("about.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-nero/85 font-light">
            <p>{t("about.p1")}</p>
            <p>{t("about.p2")}</p>
            <div className="pt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold">
              <span className="h-px w-8 bg-gold/50" />
              {t("about.tag")}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogTrigger className={triggerClass}>{t("nav.faq")}</DialogTrigger>
        <DialogContent className="max-w-xl rounded-sm border border-gold/30 bg-cream/85 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(107,39,55,0.35)] px-8 py-10">
          <DialogHeader className="space-y-3 text-left">
            <span className="eyebrow">{t("faq.eyebrow")}</span>
            <DialogTitle className="font-display text-3xl text-plum leading-tight">
              {t("faq.title")}
            </DialogTitle>
          </DialogHeader>
          <Accordion type="single" collapsible className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-gold/20 last:border-0"
              >
                <AccordionTrigger className="text-left font-display text-lg text-plum hover:text-vinho hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] leading-relaxed text-nero/80 font-light pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </DialogContent>
      </Dialog>
    </>
  );
}
