import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Heart,
  Music,
  Sparkles,
  ArrowRight,
  Mail,
  MapPin,
  Check,
  Star,
  Clock,
  Lock,
  Smartphone,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Testimonials } from "@/components/landing/Testimonials";
import { FaqSection } from "@/components/landing/FaqSection";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chronelo — Presentes digitais inesquecíveis para casais" },
      {
        name: "description",
        content:
          "Quatro experiências românticas em um único link: Carta, Mixtape, Mapa do Amor e Linha do Tempo. Feitas com a delicadeza de uma carta italiana.",
      },
      { property: "og:title", content: "Chronelo — Presentes digitais para casais" },
      {
        property: "og:description",
        content: "Transforme distância em emoção com 4 presentes em 1 link.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://heart-link-stories.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Chronelo — Presentes digitais para casais" },
      {
        name: "twitter:description",
        content: "Transforme distância em emoção com 4 presentes em 1 link.",
      },
    ],
    links: [{ rel: "canonical", href: "https://heart-link-stories.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Chronelo — Presente digital 4 em 1",
          description:
            "Carta, Mixtape, Nossos Momentos e Mapa do Amor em uma única experiência compartilhável por link.",
          brand: { "@type": "Brand", name: "Chronelo" },
          offers: {
            "@type": "Offer",
            price: "20.00",
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            url: "https://heart-link-stories.lovable.app/",
          },
        }),
      },
    ],
  }),
  component: Landing,
});

const easeOut = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-coral ${className}`}>
      <span className="h-px w-10 bg-coral/40" />
      <Heart className="h-3 w-3 fill-coral text-coral" />
      <span className="h-px w-10 bg-coral/40" />
    </div>
  );
}

/** Discrete editorial clock — gold hairlines, slow hands. Background, never the focus. */
function HeroClock({ className = "" }: { className?: string }) {
  const ticks = Array.from({ length: 12 });
  return (
    <div
      className={`pointer-events-none absolute inset-0 grid place-items-center ${className}`}
      aria-hidden="true"
    >
      <div className="relative aspect-square w-[min(78vw,560px)]">
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="clockGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.10" />
              <stop offset="60%" stopColor="var(--gold)" stopOpacity="0.04" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="98" fill="url(#clockGlow)" />
          <circle cx="100" cy="100" r="92" fill="none" stroke="var(--gold)" strokeOpacity="0.32" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--gold)" strokeOpacity="0.18" strokeWidth="0.4" />
          {ticks.map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const isMajor = i % 3 === 0;
            const r1 = 86;
            const r2 = isMajor ? 78 : 82;
            const x1 = +(100 + Math.sin(angle) * r1).toFixed(4);
            const y1 = +(100 - Math.cos(angle) * r1).toFixed(4);
            const x2 = +(100 + Math.sin(angle) * r2).toFixed(4);
            const y2 = +(100 - Math.cos(angle) * r2).toFixed(4);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--gold)"
                strokeOpacity={isMajor ? 0.55 : 0.28}
                strokeWidth={isMajor ? 0.9 : 0.5}
                strokeLinecap="round"
              />
            );

          })}
        </svg>

        <motion.div
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{ width: 1.5, height: "26%", marginLeft: -0.75, marginTop: "-26%" }}
          initial={{ rotate: -20 }}
          animate={{ rotate: -10 }}
          transition={{ duration: 60, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        >
          <div className="h-full w-full rounded-full bg-vinho/60" />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{ width: 1, height: "34%", marginLeft: -0.5, marginTop: "-34%" }}
          initial={{ rotate: 8 }}
          animate={{ rotate: 368 }}
          transition={{ duration: 90, ease: "linear", repeat: Infinity }}
        >
          <div className="h-full w-full rounded-full bg-plum/60" />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{ width: 0.6, height: "38%", marginLeft: -0.3, marginTop: "-38%" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        >
          <div className="h-full w-full rounded-full bg-gold/80" />
        </motion.div>

        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_0_2px_color-mix(in_oklab,var(--cream)_70%,transparent)]" />
      </div>
    </div>
  );
}

function Landing() {
  const { t } = useI18n();

  const gifts = [
    { icon: Mail, n: "I", title: "La Lettera", sub: t("gifts.lettera.sub"), desc: t("gifts.lettera.desc") },
    { icon: Music, n: "II", title: "La Mixtape", sub: t("gifts.mixtape.sub"), desc: t("gifts.mixtape.desc") },
    { icon: Sparkles, n: "III", title: "I Momenti", sub: t("gifts.momenti.sub"), desc: t("gifts.momenti.desc") },
    { icon: MapPin, n: "IV", title: "La Mappa", sub: t("gifts.mappa.sub"), desc: t("gifts.mappa.desc") },
  ];

  const benefits = [
    { icon: Clock, title: t("benefits.b1.t"), desc: t("benefits.b1.d") },
    { icon: Heart, title: t("benefits.b2.t"), desc: t("benefits.b2.d") },
    { icon: Smartphone, title: t("benefits.b3.t"), desc: t("benefits.b3.d") },
    { icon: Lock, title: t("benefits.b4.t"), desc: t("benefits.b4.d") },
  ];

  const steps = [
    { n: "I", title: t("how.s1.t"), desc: t("how.s1.d") },
    { n: "II", title: t("how.s2.t"), desc: t("how.s2.d") },
    { n: "III", title: t("how.s3.t"), desc: t("how.s3.d") },
  ];

  const previews = [
    {
      title: "La Lettera",
      desc: t("previews.lettera.desc"),
      art: (
        <div className="relative h-16 w-24 rounded-md bg-gradient-to-br from-[#FDFBF7] to-[#E8D8C4] shadow-[0_10px_18px_-8px_rgba(107,39,55,0.35)]">
          <div className="absolute inset-1 rounded-sm border border-[#C9A84C]/50" />
          <svg viewBox="0 0 96 64" className="absolute inset-0">
            <path d="M0 0 H96 V12 L48 56 L0 12 Z" fill="#FDFBF7" stroke="#C9A84C" strokeOpacity="0.5" />
          </svg>
          <span className="absolute left-1/2 top-[58%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#9B3344] to-[#3F1620] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)] ring-1 ring-[#C9A84C]/40" />
        </div>
      ),
    },
    {
      title: "La Mixtape",
      desc: t("previews.mixtape.desc"),
      art: (
        <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-[#1a0a10] via-[#0d0508] to-black shadow-[0_12px_20px_-10px_rgba(0,0,0,0.65)]">
          <div className="absolute inset-1 rounded-full border border-white/5" />
          <div className="absolute inset-3 rounded-full border border-white/5" />
          <div className="absolute inset-5 rounded-full border border-white/5" />
          <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#9B3344] to-[#6B2737] ring-1 ring-[#C9A84C]/60" />
          <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A84C]" />
        </div>
      ),
    },
    {
      title: "I Momenti",
      desc: t("previews.momenti.desc"),
      art: (
        <div className="relative h-20 w-20">
          <div className="absolute left-1 top-2 h-16 w-14 -rotate-6 rounded-sm bg-[#FDFBF7] p-1 pb-3 shadow-[0_8px_16px_-6px_rgba(46,37,32,0.4)]">
            <div className="h-full w-full bg-gradient-to-br from-[#C4714A]/40 to-[#6B2737]/30" />
          </div>
          <div className="absolute right-1 top-1 h-16 w-14 rotate-6 rounded-sm bg-[#FDFBF7] p-1 pb-3 shadow-[0_8px_16px_-6px_rgba(46,37,32,0.4)]">
            <div className="h-full w-full bg-gradient-to-br from-[#E8B49A]/50 to-[#C4714A]/30" />
          </div>
        </div>
      ),
    },
    {
      title: "La Mappa",
      desc: t("previews.mappa.desc"),
      art: (
        <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-[#F5EFE4] to-[#E8D8C4] shadow-[inset_0_2px_6px_rgba(107,39,55,0.15)]">
          <svg viewBox="0 0 80 80" className="absolute inset-0">
            <path d="M40 12 C 28 24, 28 38, 40 48 C 52 38, 52 24, 40 12 Z" fill="#6B2737" opacity="0.18" />
            <circle cx="40" cy="32" r="3" fill="#C4714A" />
            <circle cx="40" cy="32" r="6" fill="none" stroke="#C9A84C" strokeOpacity="0.6" />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 section-veil" />
          <HeroClock className="-z-[1] opacity-90" />
          <div className="relative mx-auto max-w-5xl px-5 pb-24 pt-20 text-center sm:px-6 lg:pb-32 lg:pt-28">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeOut }}
            >
              <p className="eyebrow text-gold/90">{t("hero.eyebrow")}</p>
              <h1 className="display-1 mt-6 text-vinho">
                {t("hero.title1")} <em className="not-italic text-gold">{t("hero.title2")}</em>
              </h1>
              <p className="mx-auto mt-7 max-w-xl font-display text-lg italic leading-relaxed text-muted-foreground lg:text-xl">
                {t("hero.subtitle")}
              </p>

              <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-plum px-8 uppercase tracking-[0.18em] text-cream hover:bg-vinho-escuro"
                >
                  <Link to="/auth">
                    {t("hero.cta.primary")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-plum/25 px-8 uppercase tracking-[0.18em] text-plum"
                >
                  <a href="#como-funciona">{t("hero.cta.secondary")}</a>
                </Button>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="flex" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                    ))}
                  </span>
                  <span className="font-medium text-plum">5.0</span> {t("hero.rating")}
                </div>
                <div className="hidden h-4 w-px bg-border sm:block" />
                <div className="text-plum">{t("hero.delivered")}</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PREVIEWS */}
        <section className="relative border-t border-gold/15 bg-background">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">{t("previews.eyebrow")}</p>
              <h2 className="h1 mt-4 text-plum">
                {t("previews.title.a")} <em className="text-coral">{t("previews.title.b")}</em>
              </h2>
              <Ornament className="mt-5" />
            </div>

            <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {previews.map((card, i) => (
                <Reveal key={card.title} delay={i * 0.08}>
                  <article className="surface-card surface-card-hover h-full p-6">
                    <div className="grid h-28 place-items-center">{card.art}</div>
                    <h3 className="mt-4 font-display text-xl italic text-plum">{card.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed tracking-wide text-muted-foreground">
                      {card.desc}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* GIFTS */}
        <section id="presentes" className="relative border-t border-gold/15 bg-cream/40">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">{t("gifts.eyebrow")}</p>
              <h2 className="h1 mt-4 text-plum">
                {t("gifts.title.a")} <em className="text-coral">{t("gifts.title.b")}</em>
              </h2>
              <Ornament className="mt-6" />
            </div>

            <div className="mt-16 grid gap-x-12 gap-y-14 md:grid-cols-2">
              {gifts.map((g, i) => (
                <Reveal key={g.title} delay={i * 0.07}>
                  <article className="group relative h-full">
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-5xl italic text-coral/60">{g.n}</span>
                      <span className="h-px flex-1 bg-gold/25" />
                      <g.icon className="h-5 w-5 shrink-0 text-coral" aria-hidden="true" />
                    </div>
                    <h3 className="h2 mt-5 text-plum">{g.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">{g.sub}</p>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">{g.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="border-t border-gold/15 bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">{t("benefits.eyebrow")}</p>
              <h2 className="h1 mt-4 text-plum">
                {t("benefits.title.a")} <em className="text-coral">{t("benefits.title.b")}</em>{" "}
                {t("benefits.title.c")}
              </h2>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b, i) => (
                <Reveal key={b.title} delay={i * 0.06}>
                  <div className="surface-card surface-card-hover h-full p-7 text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold/35 bg-cream/60 text-coral">
                      <b.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-display text-2xl text-plum">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="como-funciona" className="relative border-t border-gold/15 bg-cream/40 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">{t("how.eyebrow")}</p>
              <h2 className="h1 mt-4 text-plum">
                {t("how.title.a")} <em className="text-coral">{t("how.title.b")}</em>
              </h2>
            </div>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.1} className="text-center">
                  <div>
                    <span className="font-display text-7xl italic text-coral/70">{s.n}</span>
                    <h3 className="mt-3 font-display text-3xl text-plum">{s.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Testimonials />
        <FaqSection />

        {/* PRICING */}
        <section id="precos" className="relative border-t border-gold/15 bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-5 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">{t("price.eyebrow")}</p>
              <h2 className="h1 mt-4 text-plum">
                {t("price.title.a")} <em className="text-coral">{t("price.title.b")}</em>
              </h2>
              <p className="mt-4 text-muted-foreground">{t("price.sub")}</p>
            </div>

            <Reveal className="mx-auto mt-12 max-w-md">
              <div className="surface-card relative overflow-hidden p-8 shadow-[var(--shadow-lg)] sm:p-10">
                <div className="absolute right-0 top-0 rounded-bl-xl bg-plum px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-cream">
                  {t("price.badge")}
                </div>
                <p className="eyebrow">{t("price.kicker")}</p>
                <h3 className="mt-3 font-display text-3xl text-plum">{t("price.name")}</h3>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="text-sm text-muted-foreground line-through">R$ 97</span>
                  <span className="font-display text-6xl text-plum sm:text-7xl">R$ 20</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-coral">{t("price.cycle")}</p>

                <ul className="mt-7 space-y-3 text-sm text-plum">
                  {[t("price.f1"), t("price.f2"), t("price.f3"), t("price.f4"), t("price.f5"), t("price.f6")].map(
                    (f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-coral" aria-hidden="true" />
                        <span>{f}</span>
                      </li>
                    ),
                  )}
                </ul>

                <Button asChild size="lg" className="mt-8 w-full rounded-full">
                  <Link to="/auth">
                    {t("price.cta")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="mt-4 text-center text-xs text-muted-foreground">{t("price.guarantee")}</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-4xl px-5 py-20 sm:px-6 sm:py-24">
          <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-plum p-10 text-center shadow-[var(--shadow-xl)] sm:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--coral)_30%,transparent),transparent_60%)]" />
            <div className="relative">
              <Heart className="mx-auto h-6 w-6 animate-heartbeat fill-coral text-coral" aria-hidden="true" />
              <h2 className="h1 mt-5 text-cream">
                {t("final.title.a")} <em className="text-blush">{t("final.title.b")}</em>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-cream/80">{t("final.sub")}</p>
              <Button
                asChild
                size="lg"
                className="mt-8 rounded-full bg-cream text-plum hover:bg-blush hover:text-vinho"
              >
                <Link to="/auth">
                  {t("final.cta")} <Heart className="h-4 w-4 fill-coral text-coral" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
