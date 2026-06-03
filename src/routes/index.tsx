import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, Music, Sparkles, ArrowRight, Mail } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Love Link — Presentes virtuais para casais" },
      { name: "description", content: "Crie cartas românticas, playlists e linhas do tempo personalizadas e envie por um link exclusivo para quem você ama." },
      { property: "og:title", content: "Love Link — Presentes virtuais para casais" },
      { property: "og:description", content: "Transforme mensagens em experiências digitais inesquecíveis." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

const gifts = [
  { icon: Mail, title: "Carta Romântica", desc: "Animação de abertura com chuva de rosas e galeria de fotos do casal.", to: "carta" },
  { icon: Music, title: "Nossa Música", desc: "Player elegante com a música de vocês e contador em tempo real.", to: "musica" },
  { icon: Sparkles, title: "Nossos Momentos", desc: "Um ursinho revela a linha do tempo do relacionamento.", to: "momentos" },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO — Split screen */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-xs font-medium text-violet">
            <Heart className="h-3 w-3 fill-violet" /> Para o amor à distância
          </span>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] text-plum lg:text-7xl">
            Um presente que <span className="text-gradient-romance italic">se abre</span> com saudade.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Crie cartas, playlists e linhas do tempo personalizáveis. Envie por um link único — e
            transforme distância em emoção.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gradient-romance border-0 text-primary-foreground shadow-romance hover:opacity-90">
              <Link to="/auth">Criar meu presente <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#presentes">Ver exemplos</a>
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div><strong className="text-plum">100%</strong> personalizável</div>
            <div><strong className="text-plum">Link</strong> exclusivo</div>
            <div><strong className="text-plum">Para sempre</strong> guardado</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative aspect-square w-full max-w-md justify-self-center"
        >
          {/* Decorative envelope */}
          <div className="absolute inset-0 rounded-[2rem] gradient-romance shadow-romance" />
          <div className="absolute inset-6 rounded-[1.5rem] bg-cream/95 p-8 backdrop-blur">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="grid h-20 w-20 place-items-center rounded-full gradient-romance shadow-romance"
              >
                <Heart className="h-9 w-9 fill-white text-white" />
              </motion.div>
              <p className="mt-6 font-display text-2xl text-plum">Para você, meu amor</p>
              <p className="mt-2 text-sm italic text-muted-foreground">
                "Cada dia ao seu lado é um presente que eu escolho de novo."
              </p>
              <div className="mt-6 h-px w-24 bg-gradient-to-r from-transparent via-coral to-transparent" />
              <p className="mt-3 text-xs uppercase tracking-widest text-violet">Toque para abrir</p>
            </div>
          </div>
          {/* floating hearts */}
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
      </section>

      {/* GIFTS */}
      <section id="presentes" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet">Os presentes</p>
          <h2 className="mt-3 font-display text-4xl text-plum lg:text-5xl">Três formas de dizer eu te amo</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {gifts.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition hover:shadow-romance"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-romance text-white shadow-romance">
                <g.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-2xl text-plum">{g.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{g.desc}</p>
              <Link to="/auth" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-coral hover:gap-2 transition-all">
                Criar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl gradient-romance p-12 text-center shadow-romance">
          <h2 className="font-display text-4xl text-white lg:text-5xl">Pronto para emocionar?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/90">
            Crie em poucos minutos e envie pelo link. Sem complicação, só amor.
          </p>
          <Button asChild size="lg" className="mt-7 bg-white text-plum hover:bg-white/90">
            <Link to="/auth">Começar meu presente <Heart className="h-4 w-4 fill-coral text-coral" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Feito com <Heart className="inline h-4 w-4 fill-coral text-coral" /> por Love Link
      </footer>
    </div>
  );
}
