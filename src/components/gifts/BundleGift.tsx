import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "motion/react";
import { Heart, ChevronDown } from "lucide-react";
import { CartaGift, type CartaData } from "./CartaGift";
import { MusicaGift, type MusicaData } from "./MusicaGift";
import { MomentosGift, type MomentosData } from "./MomentosGift";
import { MapaGift, type MapaData } from "./MapaGift";

export type BundleData = {
  recipient?: string;
  intro?: string;
  carta: CartaData;
  musica: MusicaData;
  momentos: MomentosData;
  mapa: MapaData;
};

const CHAPTERS = [
  { idx: "I", key: "carta", eyebrow: "Capítulo I", title: "Carta de Amor", subtitle: "Onde tudo começa — em palavras." },
  { idx: "II", key: "momentos", eyebrow: "Capítulo II", title: "Nossos Momentos", subtitle: "As lembranças que guardamos no peito." },
  { idx: "III", key: "mapa", eyebrow: "Capítulo III", title: "Mapa do Amor", subtitle: "O lugar onde o tempo parou por nós." },
  { idx: "IV", key: "musica", eyebrow: "Capítulo IV", title: "Nossa Mixtape", subtitle: "A trilha sonora desta história." },
] as const;

function Chapter({
  idx,
  eyebrow,
  title,
  subtitle,
  children,
  isLast,
}: {
  idx: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.18 });

  return (
    <section ref={ref} className="relative">
      {/* fio do tempo */}
      {!isLast && (
        <div className="pointer-events-none absolute left-1/2 bottom-0 z-0 h-32 w-px -translate-x-1/2 translate-y-1/2 bg-gradient-to-b from-gold/60 via-gold/30 to-transparent" />
      )}

      {/* chapter intro */}
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-7xl italic text-gold/70 md:text-8xl"
        >
          {idx}
        </motion.span>
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={inView ? { opacity: 1, letterSpacing: "0.5em" } : {}}
          transition={{ duration: 1.1, delay: 0.15 }}
          className="mt-4 text-[10px] uppercase tracking-[0.5em] text-gold"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 font-display text-4xl text-cream md:text-6xl"
        >
          {title}
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.55 }}
          className="mt-6 h-px w-24 origin-center bg-gold/60"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-6 max-w-xl font-display text-lg italic text-cream/80 md:text-xl"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* chapter content */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </section>
  );
}

export function BundleGift({ data, title }: { data: BundleData; title: string }) {
  const [started, setStarted] = useState(false);
  const journeyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ["start start", "end end"] });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    if (started) {
      // Smooth scroll into the journey
      requestAnimationFrame(() => {
        journeyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [started]);

  return (
    <div className="relative min-h-screen bg-[#1a0f14] text-cream">
      {/* ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(107,39,55,0.5),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,rgba(245,240,232,0.6)_1px,transparent_0)] [background-size:28px_28px]" />
      </div>

      {/* progress bar */}
      <AnimatePresence>
        {started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-cream/10"
          >
            <motion.div style={{ width: progressWidth }} className="h-full bg-gradient-to-r from-gold via-gold to-coral" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="grid h-20 w-20 place-items-center rounded-full border border-gold/40 bg-gold/10 backdrop-blur"
          >
            <Heart className="h-8 w-8 fill-gold text-gold" />
          </motion.div>
          <p className="mt-8 text-[10px] uppercase tracking-[0.6em] text-gold">Uma história em quatro capítulos</p>
          <h1 className="mt-4 font-display text-5xl text-cream md:text-7xl">{title}</h1>
          {data.recipient && (
            <p className="mt-4 font-display text-2xl italic text-cream/80">para {data.recipient}</p>
          )}
          {data.intro && (
            <p className="mx-auto mt-8 max-w-xl font-display text-lg italic text-cream/70 md:text-xl">"{data.intro}"</p>
          )}

          {!started ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStarted(true)}
              className="mt-12 inline-flex items-center gap-3 rounded-full border border-gold/60 bg-gold/10 px-8 py-3 text-sm uppercase tracking-[0.35em] text-gold backdrop-blur transition hover:bg-gold/20"
            >
              Começar a jornada
            </motion.button>
          ) : (
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-12 flex flex-col items-center gap-2 text-gold/70"
            >
              <span className="text-[10px] uppercase tracking-[0.4em]">role para descobrir</span>
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Journey */}
      <AnimatePresence>
        {started && (
          <motion.div
            ref={journeyRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <Chapter idx="I" eyebrow={CHAPTERS[0].eyebrow} title={CHAPTERS[0].title} subtitle={CHAPTERS[0].subtitle}>
              <div className="mx-auto overflow-hidden">
                <CartaGift title={data.carta?.recipient ? `Para ${data.carta.recipient}` : title} data={data.carta} />
              </div>
            </Chapter>

            <Chapter idx="II" eyebrow={CHAPTERS[1].eyebrow} title={CHAPTERS[1].title} subtitle={CHAPTERS[1].subtitle}>
              <div className="mx-auto overflow-hidden">
                <MomentosGift title={title} data={data.momentos} />
              </div>
            </Chapter>

            <Chapter idx="III" eyebrow={CHAPTERS[2].eyebrow} title={CHAPTERS[2].title} subtitle={CHAPTERS[2].subtitle}>
              <div className="mx-auto overflow-hidden">
                <MapaGift title={data.mapa?.coupleNames || title} data={data.mapa} />
              </div>
            </Chapter>

            <Chapter idx="IV" eyebrow={CHAPTERS[3].eyebrow} title={CHAPTERS[3].title} subtitle={CHAPTERS[3].subtitle} isLast>
              <div className="mx-auto overflow-hidden">
                <MusicaGift title={data.musica?.mixtapeName || title} data={data.musica} />
              </div>
            </Chapter>

            {/* Closing */}
            <section className="relative z-10 mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.2 }}
                className="flex flex-col items-center"
              >
                <Heart className="h-10 w-10 fill-gold text-gold" />
                <p className="mt-8 text-[10px] uppercase tracking-[0.6em] text-gold">Fim do capítulo, não da história</p>
                <h3 className="mt-4 font-display text-4xl italic text-cream md:text-5xl">
                  O tempo passa.<br />O elo fica.
                </h3>
                <div className="mt-8 h-px w-16 bg-gold/50" />
                <p className="mt-8 text-xs text-cream/60">Feito com amor no Chronelo</p>
              </motion.div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
