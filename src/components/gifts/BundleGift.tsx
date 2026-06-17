import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
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

// -1 = cover, 0..3 = chapter index, 4 = closing
type Stage = number;

function ChapterIntro({
  idx,
  eyebrow,
  title,
  subtitle,
  onContinue,
}: {
  idx: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  onContinue: () => void;
}) {
  return (
    <motion.div
      key={`intro-${idx}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center"
    >
      <motion.span
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-7xl italic text-gold/70 md:text-8xl"
      >
        {idx}
      </motion.span>
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.2em" }}
        animate={{ opacity: 1, letterSpacing: "0.5em" }}
        transition={{ duration: 1.1, delay: 0.2 }}
        className="mt-4 text-[10px] uppercase tracking-[0.5em] text-gold"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 font-display text-4xl text-cream md:text-6xl"
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-6 h-px w-24 origin-center bg-gold/60"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-6 max-w-xl font-display text-lg italic text-cream/80 md:text-xl"
      >
        {subtitle}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.1 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="group relative mt-12 inline-flex items-center gap-3 overflow-hidden rounded-full border border-gold/60 bg-gold/10 px-8 py-3 text-[11px] uppercase tracking-[0.4em] text-gold backdrop-blur transition hover:bg-gold/20"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        Entrar no capítulo
        <ChevronRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}

export function BundleGift({ data, title }: { data: BundleData; title: string }) {
  // -2 = cover, -1..3 = (intro of chapter n, content of chapter n), 4 = closing
  // We use two booleans: stage index + whether intro or content
  const [stage, setStage] = useState<Stage>(-1); // -1 cover, 0..3 chapter, 4 closing
  const [showIntro, setShowIntro] = useState(true);

  const totalChapters = CHAPTERS.length;

  const goToChapter = useCallback((n: number) => {
    setStage(n);
    setShowIntro(true);
  }, []);

  const enterContent = useCallback(() => setShowIntro(false), []);

  const nextChapter = useCallback(() => {
    if (stage < totalChapters - 1) {
      goToChapter(stage + 1);
    } else {
      setStage(totalChapters); // closing
    }
  }, [stage, totalChapters, goToChapter]);

  const prevChapter = useCallback(() => {
    if (stage > 0) goToChapter(stage - 1);
    else if (stage === 0) {
      setStage(-1);
      setShowIntro(true);
    }
  }, [stage, goToChapter]);

  // Scroll to top on stage change
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [stage, showIntro]);

  const progress = stage < 0 ? 0 : stage >= totalChapters ? 1 : (stage + (showIntro ? 0 : 0.5)) / totalChapters;

  const currentChapter = stage >= 0 && stage < totalChapters ? CHAPTERS[stage] : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#1a0f14] text-cream">
      {/* ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(107,39,55,0.5),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,rgba(245,240,232,0.6)_1px,transparent_0)] [background-size:28px_28px]" />
      </div>

      {/* progress bar */}
      <AnimatePresence>
        {stage >= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-cream/10"
          >
            <motion.div
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-gradient-to-r from-gold via-gold to-coral"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter dots (top center) */}
      <AnimatePresence>
        {stage >= 0 && stage < totalChapters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-5 z-40 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-full border border-gold/30 bg-[#1a0f14]/70 px-4 py-2 backdrop-blur-md">
              {CHAPTERS.map((c, i) => (
                <button
                  key={c.key}
                  onClick={() => goToChapter(i)}
                  className="group flex items-center gap-2"
                  aria-label={`Ir para ${c.title}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      i === stage
                        ? "w-6 bg-gold"
                        : i < stage
                          ? "bg-gold/60"
                          : "bg-cream/25 group-hover:bg-cream/45"
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* COVER */}
        {stage === -1 && (
          <motion.section
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
          >
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
              <p className="mt-8 text-[10px] uppercase tracking-[0.6em] text-gold">
                Uma história em quatro capítulos
              </p>
              <h1 className="mt-4 font-display text-5xl text-cream md:text-7xl">{title}</h1>
              {data.recipient && (
                <p className="mt-4 font-display text-2xl italic text-cream/80">para {data.recipient}</p>
              )}
              {data.intro && (
                <p className="mx-auto mt-8 max-w-xl font-display text-lg italic text-cream/70 md:text-xl">
                  "{data.intro}"
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goToChapter(0)}
                className="group relative mt-12 inline-flex items-center gap-3 overflow-hidden rounded-full border border-gold/60 bg-gold/10 px-10 py-3.5 text-sm uppercase tracking-[0.35em] text-gold backdrop-blur transition hover:bg-gold/20"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                <Sparkles className="h-4 w-4" />
                Começar a jornada
              </motion.button>
            </motion.div>
          </motion.section>
        )}

        {/* CHAPTER INTRO */}
        {currentChapter && showIntro && (
          <ChapterIntro
            key={`intro-${stage}`}
            idx={currentChapter.idx}
            eyebrow={currentChapter.eyebrow}
            title={currentChapter.title}
            subtitle={currentChapter.subtitle}
            onContinue={enterContent}
          />
        )}

        {/* CHAPTER CONTENT */}
        {currentChapter && !showIntro && (
          <motion.div
            key={`content-${stage}`}
            initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(6px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <div className="mx-auto overflow-hidden">
              {stage === 0 && (
                <CartaGift
                  title={data.carta?.recipient ? `Para ${data.carta.recipient}` : title}
                  data={data.carta}
                />
              )}
              {stage === 1 && <MomentosGift title={title} data={data.momentos} />}
              {stage === 2 && <MapaGift title={data.mapa?.coupleNames || title} data={data.mapa} />}
              {stage === 3 && (
                <MusicaGift title={data.musica?.mixtapeName || title} data={data.musica} />
              )}
            </div>

            {/* Chapter navigation footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center"
            >
              <div className="h-px w-24 bg-gold/40" />
              <p className="text-[10px] uppercase tracking-[0.5em] text-gold/70">
                {stage < totalChapters - 1
                  ? `Próximo · ${CHAPTERS[stage + 1].title}`
                  : "Encerramento"}
              </p>

              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={prevChapter}
                  className="group inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/[0.03] px-5 py-2.5 text-[11px] uppercase tracking-[0.35em] text-cream/70 backdrop-blur transition hover:border-gold/40 hover:text-gold"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={nextChapter}
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-gold/60 bg-gradient-to-br from-gold/20 to-gold/5 px-7 py-3 text-[11px] uppercase tracking-[0.4em] text-gold backdrop-blur transition hover:from-gold/30 hover:to-gold/10"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  {stage < totalChapters - 1 ? "Próximo capítulo" : "Encerrar jornada"}
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* CLOSING */}
        {stage >= totalChapters && (
          <motion.section
            key="closing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-24 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-10 w-10 fill-gold text-gold" />
              </motion.div>
              <p className="mt-8 text-[10px] uppercase tracking-[0.6em] text-gold">
                Fim do capítulo, não da história
              </p>
              <h3 className="mt-4 font-display text-4xl italic text-cream md:text-5xl">
                O tempo passa.
                <br />
                O elo fica.
              </h3>
              <div className="mt-8 h-px w-16 bg-gold/50" />
              <p className="mt-8 text-xs text-cream/60">Feito com amor no Chronelo</p>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setStage(-1);
                  setShowIntro(true);
                }}
                className="mt-10 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-7 py-2.5 text-[10px] uppercase tracking-[0.4em] text-gold/80 backdrop-blur transition hover:bg-gold/15"
              >
                Reviver a história
              </motion.button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
