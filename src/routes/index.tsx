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
  Quote,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

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
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

const gifts = [
  {
    icon: Mail,
    n: "I",
    title: "La Lettera",
    sub: "Carta Romântica",
    desc: "Abertura com chuva de pétalas, galeria de fotos e trilha que envolve cada palavra.",
  },
  {
    icon: Music,
    n: "II",
    title: "La Mixtape",
    sub: "Nossa Trilha",
    desc: "Rádio retrô em forma de fita cassete — até cinco músicas escolhidas a dois.",
  },
  {
    icon: Sparkles,
    n: "III",
    title: "I Momenti",
    sub: "Nossos Momentos",
    desc: "Linha do tempo do casal revelada com a ternura de um pequeno guardião.",
  },
  {
    icon: MapPin,
    n: "IV",
    title: "La Mappa",
    sub: "Mapa do Amor",
    desc: "Globo interativo que mede em quilômetros a distância — e em batimentos o amor.",
  },
];

const benefits = [
  { icon: Clock, title: "Pronto em 5 minutos", desc: "Editor guiado, templates prontos, zero complicação." },
  { icon: Heart, title: "Inteiramente seu", desc: "Suas fotos, suas músicas, suas palavras." },
  { icon: Smartphone, title: "Abre em qualquer tela", desc: "Um link basta. Sem app, sem cadastro pra quem recebe." },
  { icon: Lock, title: "Para sempre guardado", desc: "Link único e exclusivo, salvo na nuvem." },
];

const steps = [
  { n: "I", title: "Personalize", desc: "Escolha fotos, escreva sua mensagem, monte sua trilha." },
  { n: "II", title: "Pré-visualize", desc: "Veja exatamente o que ele(a) vai receber." },
  { n: "III", title: "Envie o link", desc: "Compartilhe pelo WhatsApp, e-mail ou imprima um QR." },
];

const testimonials = [
  { name: "—", text: "Espaço reservado para o primeiro depoimento real do seu Chronelo." },
  { name: "—", text: "Espaço para depoimento — talvez um print de WhatsApp, talvez uma frase escrita à mão." },
  { name: "—", text: "Espaço para uma história real — conte como o presente emocionou." },
];

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-coral ${className}`}>
      <span className="h-px w-10 bg-coral/40" />
      <Heart className="h-3 w-3 fill-coral text-coral" />
      <span className="h-px w-10 bg-coral/40" />
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO — editorial */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--blush)_70%,transparent),transparent_60%)]" />
        <div className="mx-auto max-w-5xl px-6 pt-20 pb-24 text-center lg:pt-28 lg:pb-32">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="eyebrow">Atelier de memórias · Est. 2026</p>
            <Ornament className="mt-4" />
            <h1 className="mt-6 font-display text-[3.25rem] leading-[0.95] text-plum sm:text-7xl lg:text-[6rem]">
              Cada momento
              <br />
              merece ser <em className="text-coral">eterno.</em>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Quatro presentes feitos à mão, costurados em um único link. Carta, Mixtape,
              Linha do Tempo e Mapa do Amor — quem recebe escolhe por onde começar a se emocionar.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-plum px-7 text-cream hover:bg-coral border-0 shadow-romance"
              >
                <Link to="/auth">
                  Criar meu presente <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full px-7 text-plum hover:text-coral underline-offset-4 hover:underline"
              >
                <a href="#como-funciona">Come funziona</a>
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-coral text-coral" />
                  ))}
                </div>
                <span className="font-medium text-plum">5.0</span> de casais apaixonados
              </div>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <div>
                <strong className="text-plum">+2.000</strong> presentes enviados
              </div>
            </div>
          </motion.div>

          {/* floating petals */}
          <div className="pointer-events-none">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: `${5 + i * 16}%`, top: `${20 + (i % 3) * 15}%` }}
                animate={{ y: [-8, 8, -8], rotate: [0, 8, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.4 }}
              >
                <Heart className="h-3 w-3 fill-blush text-coral" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAMPLES — discreet previews of each gift */}
      <section className="relative border-t border-border/40 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Anteprime</p>
            <h2 className="mt-4 font-display text-4xl text-plum lg:text-5xl">
              Veja como cada presente <em className="text-coral">ganha vida</em>
            </h2>
            <div className="mx-auto mt-5 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-coral/40" />
              <Heart className="h-3 w-3 fill-coral text-coral" />
              <span className="h-px w-10 bg-coral/40" />
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "La Lettera",
                desc: "Envelope selado em lacre, pétalas e palavras que abrem devagar.",
                preview: (
                  <div className="relative grid h-full place-items-center">
                    <div className="relative h-16 w-24 rounded-sm bg-gradient-to-br from-[#FDFBF7] to-[#E8D8C4] shadow-[0_8px_14px_-6px_rgba(107,39,55,0.35)]">
                      <div className="absolute inset-1 rounded-sm border border-[#C9A84C]/50" />
                      <svg viewBox="0 0 96 64" className="absolute inset-0">
                        <path d="M0 0 H96 V12 L48 56 L0 12 Z" fill="#FDFBF7" stroke="#C9A84C" strokeOpacity="0.5" />
                      </svg>
                      <span className="absolute left-1/2 top-[58%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#9B3344] to-[#3F1620] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)] ring-1 ring-[#C9A84C]/40" />
                    </div>
                  </div>
                ),
              },
              {
                title: "La Mixtape",
                desc: "Toca-discos com vinil que gira e trilha escolhida a dois.",
                preview: (
                  <div className="relative grid h-full place-items-center">
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-[#1a0a10] via-[#0d0508] to-black shadow-[0_8px_14px_-6px_rgba(0,0,0,0.6)]">
                      <div className="absolute inset-1 rounded-full border border-white/5" />
                      <div className="absolute inset-3 rounded-full border border-white/5" />
                      <div className="absolute inset-5 rounded-full border border-white/5" />
                      <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#9B3344] to-[#6B2737] ring-1 ring-[#C9A84C]/60" />
                      <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A84C]" />
                    </div>
                  </div>
                ),
              },
              {
                title: "I Momenti",
                desc: "Polaroids inclinadas sobre a mesa, álbum de memórias revelado.",
                preview: (
                  <div className="relative grid h-full place-items-center">
                    <div className="relative h-20 w-20">
                      <div className="absolute left-1 top-2 h-16 w-14 -rotate-6 rounded-sm bg-[#FDFBF7] p-1 pb-3 shadow-[0_6px_12px_-4px_rgba(46,37,32,0.4)]">
                        <div className="h-full w-full bg-gradient-to-br from-[#C4714A]/40 to-[#6B2737]/30" />
                      </div>
                      <div className="absolute right-1 top-1 h-16 w-14 rotate-6 rounded-sm bg-[#FDFBF7] p-1 pb-3 shadow-[0_6px_12px_-4px_rgba(46,37,32,0.4)]">
                        <div className="h-full w-full bg-gradient-to-br from-[#E8B49A]/50 to-[#C4714A]/30" />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                title: "La Mappa",
                desc: "Mapa do amor com a distância em batimentos e quilômetros.",
                preview: (
                  <div className="relative grid h-full place-items-center">
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-[#F5EFE4] to-[#E8D8C4] shadow-[inset_0_2px_6px_rgba(107,39,55,0.15)]">
                      <svg viewBox="0 0 80 80" className="absolute inset-0">
                        <path d="M40 12 C 28 24, 28 38, 40 48 C 52 38, 52 24, 40 12 Z" fill="#6B2737" opacity="0.18" />
                        <circle cx="40" cy="32" r="3" fill="#C4714A" />
                        <circle cx="40" cy="32" r="6" fill="none" stroke="#C9A84C" strokeOpacity="0.6" />
                      </svg>
                    </div>
                  </div>
                ),
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group rounded-sm border border-[#C9A84C]/25 bg-cream/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C9A84C]/50 hover:shadow-[0_18px_30px_-15px_rgba(107,39,55,0.25)]"
              >
                <div className="h-28">{card.preview}</div>
                <h3 className="mt-4 font-display text-xl italic text-plum">{card.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed tracking-wide text-muted-foreground">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GIFTS — magazine editorial */}
      <section id="presentes" className="relative border-t border-border/40 bg-cream/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">I quattro doni</p>
            <h2 className="mt-4 font-display text-5xl text-plum lg:text-6xl">
              Quatro formas de dizer <em className="text-coral">ti amo</em>
            </h2>
            <Ornament className="mt-6" />
          </div>

          <div className="mt-16 grid gap-x-12 gap-y-16 md:grid-cols-2">
            {gifts.map((g, i) => (
              <motion.article
                key={g.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
                className="group relative"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-5xl italic text-coral/60">{g.n}</span>
                  <span className="h-px flex-1 bg-border" />
                  <g.icon className="h-5 w-5 text-coral" />
                </div>
                <h3 className="mt-5 font-display text-4xl text-plum">{g.title}</h3>
                <p className="mt-1 text-sm uppercase tracking-[0.3em] text-muted-foreground">{g.sub}</p>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{g.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Perché Chronelo</p>
            <h2 className="mt-4 font-display text-5xl text-plum">
              Feito para <em className="text-coral">emocionar</em> de verdade
            </h2>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-coral/30 text-coral">
                  <b.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-2xl text-plum">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="relative border-y border-border/40 bg-cream/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">In tre passi</p>
            <h2 className="mt-4 font-display text-5xl text-plum">
              Mais fácil que escrever <em className="text-coral">à mão</em>
            </h2>
          </div>
          <div className="mt-14 grid gap-12 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <span className="font-display text-7xl italic text-coral/70">{s.n}</span>
                <h3 className="mt-3 font-display text-3xl text-plum">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Chi ha provato, si è commosso</p>
            <h2 className="mt-4 font-display text-5xl text-plum">Histórias reais</h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure key={i} className="relative rounded-sm border border-border/60 bg-card p-8">
                <Quote className="h-6 w-6 text-coral/40" />
                <blockquote className="mt-4 font-display text-xl italic leading-relaxed text-plum">
                  "{t.text}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4">
                  <div className="h-9 w-9 rounded-full bg-blush" />
                  <div>
                    <p className="text-sm font-medium text-plum">{t.name}</p>
                    <div className="mt-0.5 flex">
                      {[...Array(5)].map((_, k) => (
                        <Star key={k} className="h-3 w-3 fill-coral text-coral" />
                      ))}
                    </div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="relative border-t border-border/40 bg-cream/40 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Il prezzo</p>
            <h2 className="mt-4 font-display text-5xl text-plum">
              Um valor único. <em className="text-coral">Tudo incluído.</em>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sem assinatura. Sem letrinha miúda. Pague uma vez — o presente fica para sempre.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto mt-12 max-w-md overflow-hidden rounded-sm border border-coral/30 bg-card p-10 shadow-romance"
          >
            <div className="absolute right-0 top-0 bg-plum px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-cream">
              Più scelto
            </div>
            <p className="eyebrow">Il pacchetto completo</p>
            <h3 className="mt-3 font-display text-3xl text-plum">Os 4 presentes em um</h3>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-sm text-muted-foreground line-through">R$ 97</span>
              <span className="font-display text-7xl text-plum">R$ 40</span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-coral">Pagamento único · oferta de lançamento</p>

            <ul className="mt-7 space-y-3 text-sm text-plum">
              {[
                "Carta Romântica com fotos e música",
                "Nossa Mixtape com até 5 músicas",
                "Linha do tempo Nossos Momentos",
                "Mapa do Amor com distância em tempo real",
                "Link exclusivo, abre em qualquer celular",
                "Edição ilimitada e armazenamento pra sempre",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="mt-8 w-full rounded-full bg-plum text-cream hover:bg-coral border-0">
              <Link to="/auth">
                Criar meu presente <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Garantia de satisfação · pagamento 100% seguro
            </p>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <div className="relative overflow-hidden rounded-sm border border-coral/20 bg-plum p-14 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--coral)_30%,transparent),transparent_60%)]" />
          <div className="relative">
            <Heart className="mx-auto h-6 w-6 fill-coral text-coral animate-heartbeat" />
            <h2 className="mt-5 font-display text-5xl text-cream lg:text-6xl">
              Pronto para <em className="text-blush">emocionar?</em>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-cream/80">
              Em cinco minutos você cria um presente que ele(a) vai lembrar para sempre.
            </p>
            <Button asChild size="lg" className="mt-8 rounded-full bg-cream text-plum hover:bg-blush">
              <Link to="/auth">
                Começar meu presente <Heart className="h-4 w-4 fill-coral text-coral" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-10 text-center">
        <p className="font-display italic text-coral">amore · sempre</p>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Chronelo · Atelier digitale
        </p>
      </footer>
    </div>
  );
}
