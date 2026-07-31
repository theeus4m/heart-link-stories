import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Testimonials() {
  const { t } = useI18n();
  const items = [1, 2, 3].map((n) => ({
    quote: t(`testi.${n}.q`),
    name: t(`testi.${n}.name`),
    role: t(`testi.${n}.role`),
  }));

  return (
    <section id="depoimentos" className="border-t border-gold/15 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t("testi.eyebrow")}</p>
          <h2 className="h1 mt-4 text-plum">
            {t("testi.title.a")} <em className="text-coral">{t("testi.title.b")}</em>
          </h2>
        </div>

        <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="surface-card surface-card-hover w-[85vw] shrink-0 snap-center p-7 sm:w-auto"
            >
              <Quote className="h-6 w-6 text-gold/60" aria-hidden="true" />
              <blockquote className="mt-4 font-display text-xl italic leading-relaxed text-plum">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-gold/15 pt-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream font-display text-lg text-plum">
                  {item.name.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-plum">{item.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.role}</span>
                </span>
                <span className="ml-auto flex shrink-0" aria-label="5/5">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="h-3 w-3 fill-gold text-gold" aria-hidden="true" />
                  ))}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
