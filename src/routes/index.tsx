import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Heart,
  Music,
  Sparkles,
  ArrowRight,
  Mail,
  MapPin,
  Gift,
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
      { title: "Love Link — Presentes digitais inesquecíveis para casais" },
      {
        name: "description",
        content:
          "4 experiências românticas em um único link: Carta, Mixtape, Mapa do Amor e Linha do Tempo. Crie em minutos, surpreenda para sempre.",
      },
      { property: "og:title", content: "Love Link — Presentes digitais para casais" },
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
    title: "Carta Romântica",
    desc: "Animação de abertura com chuva de rosas, galeria de fotos e música.",
    color: "from-coral to-violet",
  },
  {
    icon: Music,
    title: "Nossa Mixtape",
    desc: "Rádio retrô com fita cassete e até 5 músicas do YouTube.",
    color: "from-violet to-plum",
  },
  {
    icon: Sparkles,
    title: "Nossos Momentos",
    desc: "Linha do tempo do casal revelada por um ursinho fofo.",
    color: "from-coral to-plum",
  },
  {
    icon: MapPin,
    title: "Mapa do Amor",
    desc: "Mapa interativo com a distância entre vocês em forma de coração.",
    color: "from-plum to-violet",
  },
];

const benefits = [
  { icon: Clock, title: "Pronto em 5 minutos", desc: "Editor guiado e templates prontos. Sem complicação." },
  { icon: Heart, title: "100% personalizável", desc: "Suas fotos, suas músicas, suas palavras." },
  { icon: Smartphone, title: "Abre em qualquer celular", desc: "Basta um link. Sem app, sem cadastro pra quem recebe." },
  { icon: Lock, title: "Pra sempre guardado", desc: "Link único e exclusivo, salvo na nuvem." },
];

const steps = [
  { n: "1", title: "Personalize", desc: "Escolha fotos, escreva sua mensagem, monte sua mixtape." },
  { n: "2", title: "Pré-visualize", desc: "Veja exatamente o que ele(a) vai receber." },
  { n: "3", title: "Envie o link", desc: "Compartilhe pelo WhatsApp, e-mail ou imprima um QR." },
];

const testimonials = [
  { name: "—", text: "Espaço para depoimento real. Preencha depois de receber os primeiros pedidos." },
  { name: "—", text: "Espaço para depoimento real. Use prints de WhatsApp ou avaliações." },
  { name: "—", text: "Espaço para depoimento real. Conte como o presente emocionou." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-xs font-medium text-violet">
              <Gift className="h-3 w-3" /> 4 presentes em 1 link
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] text-plum lg:text-7xl">
              Um presente que <span className="text-gradient-romance italic">se abre</span> com saudade.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Carta, Mixtape, Linha do Tempo e Mapa do Amor — quem recebe escolhe por onde começar.
              Crie em minutos, surpreenda para sempre.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gradient-romance border-0 text-primary-foreground shadow-romance hover:opacity-90">
                <Link to="/auth">
                  Criar meu presente <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#como-funciona">Como funciona</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-coral text-coral" />
                  ))}
                </div>
                <span className="ml-1 font-medium text-plum">5.0</span> de casais apaixonados
              </div>
              <div>
                <strong className="text-plum">+2.000</strong> presentes enviados
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-square w-full max-w-md justify-self-center"
          >
            <div className="absolute inset-0 rounded-[2rem] gradient-romance shadow-romance" />
            <div className="absolute inset-6 rounded-[1.5rem] bg-cream/95 p-6 backdrop-blur">
              <div className="flex h-full flex-col">
                <p className="text-center text-xs uppercase tracking-[0.3em] text-violet">Você recebeu</p>
                <p className="mt-1 text-center font-display text-2xl text-plum">Para você, meu amor</p>
                <div className="mt-4 grid flex-1 grid-cols-2 gap-3">
                  {gifts.map((g, i) => (
                    <motion.div
                      key={g.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className={`flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${g.color} p-3 text-center text-white shadow-soft`}
                    >
                      <g.icon className="h-6 w-6" />
                      <p className="mt-2 text-[11px] font-medium leading-tight">{g.title}</p>
                    </motion.div>
                  ))}
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">Toque qualquer um para abrir 💌</p>
              </div>
            </div>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: `${10 + i * 25}%`, top: `${80 - i * 5}%` }}
                animate={{ y: [-10, -200], opacity: [0, 1, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6 }}
              >
                <Heart className="h-4 w-4 fill-coral text-coral" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* GIFTS DEMO */}
      <section id="presentes" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet">Os 4 presentes</p>
          <h2 className="mt-3 font-display text-4xl text-plum lg:text-5xl">
            Quatro formas de dizer <span className="text-gradient-romance italic">eu te amo</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Todos vêm juntos. Quem recebe escolhe por qual começar — e pode voltar a qualquer momento.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {gifts.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-romance"
            >
              <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${g.color} text-white shadow-romance`}>
                <g.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-2xl text-plum">{g.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{g.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-violet">Por que Love Link</p>
            <h2 className="mt-3 font-display text-4xl text-plum">Feito para emocionar de verdade</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl bg-card p-6 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-xl gradient-romance text-white">
                  <b.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl text-plum">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet">Em 3 passos</p>
          <h2 className="mt-3 font-display text-4xl text-plum">Mais fácil que escrever um bilhete</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-border bg-card p-7"
            >
              <span className="font-display text-6xl text-gradient-romance leading-none">{s.n}</span>
              <h3 className="mt-3 font-display text-2xl text-plum">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-violet">Quem usou, se emocionou</p>
            <h2 className="mt-3 font-display text-4xl text-plum">Histórias reais</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl bg-card p-7 shadow-soft">
                <Quote className="h-7 w-7 text-coral/50" />
                <p className="mt-3 font-display text-lg italic text-plum">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-romance" />
                  <div>
                    <p className="text-sm font-semibold text-plum">{t.name}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, k) => (
                        <Star key={k} className="h-3 w-3 fill-coral text-coral" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="mx-auto max-w-4xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet">Preço</p>
          <h2 className="mt-3 font-display text-4xl text-plum">Um valor único. Tudo incluído.</h2>
          <p className="mt-3 text-muted-foreground">
            Sem assinatura. Sem letrinha miúda. Pague uma vez e o presente fica pra sempre.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto mt-10 max-w-md overflow-hidden rounded-3xl border-2 border-coral/30 bg-card p-8 shadow-romance"
        >
          <span className="absolute right-5 top-5 rounded-full gradient-romance px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-romance">
            Mais escolhido
          </span>
          <p className="text-sm uppercase tracking-widest text-violet">Presente Completo</p>
          <h3 className="mt-1 font-display text-3xl text-plum">Os 4 presentes em 1</h3>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground line-through">R$ 97</span>
            <span className="font-display text-6xl text-plum">R$ 50</span>
            <span className="text-sm text-muted-foreground">pagamento único</span>
          </div>
          <p className="mt-1 text-xs font-medium text-coral">Oferta de lançamento — por tempo limitado</p>

          <ul className="mt-6 space-y-3 text-sm text-plum">
            {[
              "Carta Romântica com fotos e música",
              "Nossa Mixtape com até 5 músicas",
              "Linha do tempo Nossos Momentos",
              "Mapa do Amor com distância em tempo real",
              "Link exclusivo, abre em qualquer celular",
              "Edição ilimitada e armazenamento pra sempre",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Button asChild size="lg" className="mt-7 w-full gradient-romance border-0 text-primary-foreground shadow-romance">
            <Link to="/auth">
              Criar meu presente <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Garantia de satisfação · pagamento 100% seguro
          </p>
        </motion.div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl gradient-romance p-12 text-center shadow-romance">
          <Heart className="mx-auto h-8 w-8 fill-white text-white animate-heartbeat" />
          <h2 className="mt-4 font-display text-4xl text-white lg:text-5xl">Pronto para emocionar?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/90">
            Em 5 minutos você cria um presente que ele(a) vai lembrar pra sempre.
          </p>
          <Button asChild size="lg" className="mt-7 bg-white text-plum hover:bg-white/90">
            <Link to="/auth">
              Começar meu presente <Heart className="h-4 w-4 fill-coral text-coral" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Feito com <Heart className="inline h-4 w-4 fill-coral text-coral" /> por Love Link
      </footer>
    </div>
  );
}
