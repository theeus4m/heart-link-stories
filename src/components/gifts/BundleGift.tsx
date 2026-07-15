import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { Heart, ChevronRight, ChevronLeft, Sparkles, Play, Pause, Music } from "lucide-react";
import { CartaGift, type CartaData } from "./CartaGift";
import { MusicaGift, type MusicaData } from "./MusicaGift";
import { MomentosGift, type MomentosData } from "./MomentosGift";
import { MapaGift, type MapaData } from "./MapaGift";
import { MusicPlayerProvider, useMusicPlayer } from "./MusicPlayerContext";

export type BundleData = {
  recipient?: string;
  intro?: string;
  carta: CartaData;
  musica: MusicaData;
  momentos: MomentosData;
  mapa: MapaData;
};

// Each chapter has its own ambient palette so transitions feel cinematic —
// the whole environment shifts, not just the content.
const CHAPTERS = [
  {
    idx: "I",
    key: "musica",
    eyebrow: "Capitolo I",
    title: "La Mixtape",
    subtitle: "A trilha sonora desta história começa aqui.",
    ambient: {
      base: "#141014",
      top: "rgba(201,168,76,0.22)",
      bottom: "rgba(74,26,38,0.65)",
      accent: "rgba(196,113,74,0.14)",
    },
  },
  {
    idx: "II",
    key: "carta",
    eyebrow: "Capitolo II",
    title: "La Lettera",
    subtitle: "Onde tudo se traduz em palavras.",
    ambient: {
      base: "#1a0f14",
      top: "rgba(201,168,76,0.18)",
      bottom: "rgba(107,39,55,0.55)",
      accent: "rgba(196,113,74,0.12)",
    },
  },
  {
    idx: "III",
    key: "momentos",
    eyebrow: "Capitolo III",
    title: "I Momenti",
    subtitle: "As lembranças que guardamos no peito.",
    ambient: {
      base: "#181112",
      top: "rgba(196,113,74,0.22)",
      bottom: "rgba(46,37,32,0.7)",
      accent: "rgba(201,168,76,0.08)",
    },
  },
  {
    idx: "IV",
    key: "mapa",
    eyebrow: "Capitolo IV",
    title: "La Mappa",
    subtitle: "O lugar onde o tempo parou por nós.",
    ambient: {
      base: "#0d1218",
      top: "rgba(88,120,168,0.20)",
      bottom: "rgba(30,20,32,0.75)",
      accent: "rgba(201,168,76,0.10)",
    },
  },
] as const;

// stages: -1 = cover, 0..3 = chapter, 4 = closing
type Stage = number;

const EASE = [0.22, 1, 0.36, 1] as const;

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
      transition={{ duration: 0.9, ease: EASE }}
      className="relative z-10 mx-auto flex min-h-[100dvh] max-w-3xl flex-col items-center justify-center px-6 text-center"
    >
      <motion.span
        initial={{ opacity: 0, y: 40, filter: "blur(12px)", scale: 0.9 }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
        transition={{ duration: 1.3, ease: EASE }}
        className="font-display text-8xl italic text-gold/70 md:text-9xl"
      >
        {idx}
      </motion.span>
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.2em" }}
        animate={{ opacity: 1, letterSpacing: "0.5em" }}
        transition={{ duration: 1.1, delay: 0.25 }}
        className="mt-4 text-[10px] uppercase tracking-[0.5em] text-gold"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, delay: 0.4, ease: EASE }}
        className="mt-3 font-display text-5xl italic text-cream md:text-7xl"
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.1, delay: 0.7 }}
        className="mt-6 h-px w-24 origin-center bg-gold/60"
      />
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="mt-6 max-w-xl font-display text-lg italic text-cream/80 md:text-xl"
      >
        {subtitle}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.2 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="group relative mt-12 inline-flex items-center gap-3 overflow-hidden rounded-full border border-gold/60 bg-gold/10 px-8 py-3 text-[11px] uppercase tracking-[0.4em] text-gold backdrop-blur transition hover:bg-gold/20"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        Entrar no capítulo
        <ChevronRight className="h-4 w-4" />
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1.4, delay: 1.6 }}
        className="mt-10 hidden text-[9px] uppercase tracking-[0.5em] text-cream/50 md:block"
      >
        ← → · espaço · deslize
      </motion.p>
    </motion.div>
  );
}

export function BundleGift({ data, title }: { data: BundleData; title: string }) {
  const [stage, setStage] = useState<Stage>(-1);
  const [showIntro, setShowIntro] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);

  const totalChapters = CHAPTERS.length;

  // Ambient interpolation per stage
  const ambient = useMemo(() => {
    if (stage < 0 || stage >= totalChapters) {
      return {
        base: "#1a0f14",
        top: "rgba(201,168,76,0.15)",
        bottom: "rgba(107,39,55,0.5)",
        accent: "rgba(196,113,74,0.10)",
      };
    }
    return CHAPTERS[stage].ambient;
  }, [stage, totalChapters]);

  const goToChapter = useCallback((n: number, dir: 1 | -1 = 1) => {
    setDirection(dir);
    setStage(n);
    setShowIntro(true);
  }, []);

  const enterContent = useCallback(() => setShowIntro(false), []);

  const nextChapter = useCallback(() => {
    setDirection(1);
    if (stage === -1) {
      goToChapter(0, 1);
    } else if (stage < totalChapters - 1) {
      goToChapter(stage + 1, 1);
    } else if (stage === totalChapters - 1) {
      setStage(totalChapters);
    }
  }, [stage, totalChapters, goToChapter]);

  const prevChapter = useCallback(() => {
    setDirection(-1);
    if (stage >= totalChapters) {
      goToChapter(totalChapters - 1, -1);
    } else if (stage > 0) {
      goToChapter(stage - 1, -1);
    } else if (stage === 0) {
      setStage(-1);
      setShowIntro(true);
    }
  }, [stage, totalChapters, goToChapter]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        if (showIntro && stage >= 0 && stage < totalChapters) {
          e.preventDefault();
          enterContent();
        } else {
          e.preventDefault();
          nextChapter();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevChapter();
      } else if (e.key >= "1" && e.key <= "4") {
        const n = parseInt(e.key, 10) - 1;
        goToChapter(n, n > stage ? 1 : -1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, showIntro, totalChapters, nextChapter, prevChapter, enterContent, goToChapter]);

  // Reset scroll on stage change
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [stage, showIntro]);

  // Swipe gestures for mobile (horizontal drag on ambient overlay)
  const dragX = useMotionValue(0);
  const dragHint = useTransform(dragX, [-120, 0, 120], [1, 0, 1]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const offset = info.offset.x;
      const velocity = info.velocity.x;
      if (offset < -80 || velocity < -500) {
        if (showIntro && stage >= 0 && stage < totalChapters) enterContent();
        else nextChapter();
      } else if (offset > 80 || velocity > 500) {
        prevChapter();
      }
      dragX.set(0);
    },
    [dragX, showIntro, stage, totalChapters, enterContent, nextChapter, prevChapter],
  );

  const progress =
    stage < 0 ? 0 : stage >= totalChapters ? 1 : (stage + (showIntro ? 0.15 : 0.65)) / totalChapters;

  const currentChapter = stage >= 0 && stage < totalChapters ? CHAPTERS[stage] : null;

  // Cinematic slide transition variants (subtle horizontal + blur + scale)
  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir * 60,
      scale: 0.98,
      filter: "blur(10px)",
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir * -60,
      scale: 1.02,
      filter: "blur(10px)",
    }),
  };

  return (
    <div
      className="relative min-h-[100dvh] overflow-x-hidden text-cream transition-colors duration-1000"
      style={{ backgroundColor: ambient.base }}
    >
      {/* Ambient backdrop — smoothly cross-fades between chapters */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <motion.div
          key={`amb-top-${stage}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse at top, ${ambient.top}, transparent 55%)`,
          }}
        />
        <motion.div
          key={`amb-bot-${stage}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.1 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse at bottom, ${ambient.bottom}, transparent 60%)`,
          }}
        />
        <motion.div
          key={`amb-acc-${stage}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: EASE, delay: 0.2 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, ${ambient.accent}, transparent 50%)`,
          }}
        />
        {/* subtle grain */}
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,rgba(245,240,232,0.6)_1px,transparent_0)] [background-size:28px_28px]" />
        {/* vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      {/* Progress bar */}
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
              transition={{ duration: 1, ease: EASE }}
              className="h-full bg-gradient-to-r from-gold via-gold to-coral"
              style={{ boxShadow: "0 0 12px rgba(201,168,76,0.5)" }}
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
            <div className="flex items-center gap-3 rounded-full border border-gold/30 bg-black/30 px-4 py-2 backdrop-blur-md">
              {CHAPTERS.map((c, i) => (
                <button
                  key={c.key}
                  onClick={() => goToChapter(i, i > stage ? 1 : -1)}
                  className="group flex items-center gap-2"
                  aria-label={`Ir para ${c.title}`}
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === stage
                        ? "w-6 bg-gold"
                        : i < stage
                          ? "w-1.5 bg-gold/60"
                          : "w-1.5 bg-cream/25 group-hover:bg-cream/45"
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side arrows (desktop only) */}
      <AnimatePresence>
        {stage >= 0 && stage < totalChapters && (
          <>
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: EASE }}
              onClick={prevChapter}
              className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 items-center justify-center rounded-full border border-cream/15 bg-black/30 p-3 text-cream/60 backdrop-blur-md transition hover:border-gold/50 hover:text-gold md:flex"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.6, ease: EASE }}
              onClick={() => (showIntro ? enterContent() : nextChapter())}
              className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-gold/10 p-3 text-gold backdrop-blur-md transition hover:border-gold hover:bg-gold/20 md:flex"
              aria-label="Próximo"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Swipe-capture layer (mobile) — sits behind all content but catches drags */}
      <motion.div
        className="fixed inset-0 z-10 md:hidden"
        style={{ x: dragX, touchAction: "pan-y" }}
        drag="x"
        dragElastic={0.15}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
      />
      <motion.div
        style={{ opacity: dragHint }}
        className="pointer-events-none fixed inset-x-0 bottom-8 z-30 text-center text-[9px] uppercase tracking-[0.5em] text-gold/70 md:hidden"
      >
        deslize
      </motion.div>

      <AnimatePresence mode="wait" custom={direction}>
        {/* COVER */}
        {stage === -1 && (
          <motion.section
            key="cover"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1, ease: EASE }}
            className="relative z-20 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: EASE }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="grid h-20 w-20 place-items-center rounded-full border border-gold/40 bg-gold/10 backdrop-blur"
                style={{ boxShadow: "0 0 40px rgba(201,168,76,0.3)" }}
              >
                <Heart className="h-8 w-8 fill-gold text-gold" />
              </motion.div>
              <p className="mt-8 text-[10px] uppercase tracking-[0.6em] text-gold">
                Uma história em quatro capítulos
              </p>
              <h1 className="mt-4 font-display text-5xl italic text-cream md:text-7xl">{title}</h1>
              {data.recipient && (
                <p className="mt-4 font-display text-2xl italic text-cream/80">para {data.recipient}</p>
              )}
              {data.intro && (
                <p className="mx-auto mt-8 max-w-xl font-display text-lg italic text-cream/70 md:text-xl">
                  &ldquo;{data.intro}&rdquo;
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goToChapter(0, 1)}
                className="group relative mt-12 inline-flex items-center gap-3 overflow-hidden rounded-full border border-gold/60 bg-gold/10 px-10 py-3.5 text-sm uppercase tracking-[0.35em] text-gold backdrop-blur transition hover:bg-gold/20"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                <Sparkles className="h-4 w-4" />
                Começar a jornada
              </motion.button>

              <p className="mt-10 hidden text-[9px] uppercase tracking-[0.5em] text-cream/40 md:block">
                Use ← → · espaço · ou deslize
              </p>
            </motion.div>
          </motion.section>
        )}

        {/* CHAPTER INTRO */}
        {currentChapter && showIntro && (
          <motion.div
            key={`intro-wrap-${stage}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.9, ease: EASE }}
            className="relative z-20"
          >
            <ChapterIntro
              idx={currentChapter.idx}
              eyebrow={currentChapter.eyebrow}
              title={currentChapter.title}
              subtitle={currentChapter.subtitle}
              onContinue={enterContent}
            />
          </motion.div>
        )}

        {/* CHAPTER CONTENT */}
        {currentChapter && !showIntro && (
          <motion.div
            key={`content-${stage}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.9, ease: EASE }}
            className="relative z-20"
          >
            <div className="mx-auto overflow-hidden">
              {stage === 0 && (
                <MusicaGift title={data.musica?.mixtapeName || title} data={data.musica} />
              )}
              {stage === 1 && (
                <CartaGift
                  title={data.carta?.recipient ? `Para ${data.carta.recipient}` : title}
                  data={data.carta}
                />
              )}
              {stage === 2 && <MomentosGift title={title} data={data.momentos} />}
              {stage === 3 && <MapaGift title={data.mapa?.coupleNames || title} data={data.mapa} />}
            </div>

            {/* Chapter navigation footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative z-20 mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center"
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
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.1, ease: EASE }}
            className="relative z-20 mx-auto flex min-h-[100dvh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center"
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

              <div className="mt-10 flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={prevChapter}
                  className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/[0.03] px-5 py-2.5 text-[10px] uppercase tracking-[0.4em] text-cream/70 backdrop-blur transition hover:border-gold/40 hover:text-gold"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setDirection(-1);
                    setStage(-1);
                    setShowIntro(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-7 py-2.5 text-[10px] uppercase tracking-[0.4em] text-gold/80 backdrop-blur transition hover:bg-gold/15"
                >
                  Reviver a história
                </motion.button>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
