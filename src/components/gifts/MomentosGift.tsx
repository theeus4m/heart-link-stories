import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X, ChevronLeft, ChevronRight } from "lucide-react";

export type MomentosData = {
  intro: string;
  moments: Array<{ date: string; title: string; caption: string; photo?: string }>;
  outro: string;
};

// Deterministic pseudo-random based on index — so polaroid tilts are stable
function seeded(i: number, salt = 1) {
  const x = Math.sin((i + 1) * 9301 * salt + 49297) * 233280;
  return x - Math.floor(x);
}

function WashiTape({ tone = "gold" }: { tone?: "gold" | "rose" | "wine" }) {
  const palette = {
    gold: "from-[#C9A84C]/55 via-[#E8C97A]/35 to-[#C9A84C]/55",
    rose: "from-[#C4714A]/45 via-[#E8B49A]/35 to-[#C4714A]/45",
    wine: "from-[#6B2737]/40 via-[#9B3344]/30 to-[#6B2737]/40",
  }[tone];
  return (
    <div
      className={`absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 bg-gradient-to-r ${palette} shadow-[0_2px_6px_rgba(46,37,32,0.18)]`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg,rgba(255,255,255,.25) 0 2px,transparent 2px 6px)",
      }}
    >
      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/15 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black/15 to-transparent" />
    </div>
  );
}

function PolaroidCorner({ pos }: { pos: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`absolute ${pos} h-4 w-4 text-[#C9A84C]/60`}
      aria-hidden="true"
    >
      <path d="M2 2 L22 2 L22 6 L6 6 L6 22 L2 22 Z" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function Polaroid({
  src,
  caption,
  date,
  index,
  onOpen,
}: {
  src: string;
  caption?: string;
  date?: string;
  index: number;
  onOpen: () => void;
}) {
  const rot = (seeded(index) - 0.5) * 10; // -5° → +5°
  const tone = (["gold", "rose", "wine"] as const)[index % 3];
  return (
    <motion.button
      onClick={onOpen}
      layoutId={`polaroid-${index}`}
      initial={{ opacity: 0, y: 28, rotate: rot, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, rotate: rot, scale: 1 }}
      whileHover={{ rotate: 0, scale: 1.04, y: -6 }}
      whileTap={{ scale: 0.97, rotate: 0, y: -2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.06 }}
      viewport={{ once: true, margin: "-40px" }}
      className="group relative block w-full max-w-[260px] cursor-pointer rounded-[2px] bg-[#FDFBF7] p-2.5 pb-10 text-left shadow-[0_18px_30px_-12px_rgba(46,37,32,0.35),0_4px_10px_-4px_rgba(46,37,32,0.25)] outline-none transition-shadow hover:shadow-[0_30px_50px_-16px_rgba(46,37,32,0.5)] focus-visible:ring-2 focus-visible:ring-[#C9A84C] sm:p-3 sm:pb-12"
      style={{ willChange: "transform" }}
      aria-label="Ampliar foto"
    >

      <WashiTape tone={tone} />
      <PolaroidCorner pos="left-1 top-1" />
      <PolaroidCorner pos="right-1 top-1 rotate-90" />
      <PolaroidCorner pos="left-1 bottom-9 -rotate-90" />
      <PolaroidCorner pos="right-1 bottom-9 rotate-180" />

      <div className="relative aspect-square overflow-hidden bg-[#E8D8C4]">
        <img
          src={src}
          alt={caption || ""}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] [filter:saturate(0.92)_contrast(1.05)_sepia(0.08)]"
        />
        {/* vintage warmth overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#C4714A]/10 via-transparent to-[#6B2737]/15 mix-blend-multiply" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(46,37,32,0.25)_100%)]" />
        {/* gloss sweep on hover */}
        <div className="pointer-events-none absolute -inset-y-6 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100" />
      </div>

      <div className="mt-2.5 px-1 text-center sm:mt-3">
        <p className="line-clamp-2 font-display text-sm italic leading-tight text-[#6B2737] sm:text-base">
          {caption || "—"}
        </p>
        {date && (
          <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.3em] text-[#2E2520]/55 sm:text-[10px]">
            {date}
          </p>
        )}
      </div>

    </motion.button>
  );
}

export function MomentosGift({ data, title }: { data: MomentosData; title: string }) {
  const [revealed, setRevealed] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  const items = useMemo(
    () => (data.moments || []).filter((m) => m.photo),
    [data.moments],
  );

  const go = useCallback(
    (dir: 1 | -1) =>
      setActive((a) => (a === null ? a : (a + dir + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, go]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#F5EFE4]">

      {/* atmospheric backdrop matching Chronelo palette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.16),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(107,39,55,0.18),transparent_60%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")",
        }}
      />

      <AnimatePresence>
        {!revealed && (
          <motion.div
            key="cover"
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-20 grid place-items-center px-5 sm:px-6"
          >
            <div className="text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-[#C4714A] sm:text-[10px]">
                ★ Álbum Chronelo ★
              </p>
              <h1 className="mt-4 font-display text-4xl italic text-[#6B2737] sm:text-5xl md:text-6xl">
                {title}
              </h1>
              <p className="mx-auto mt-4 max-w-md font-display text-base italic text-[#2E2520]/70 sm:text-lg">
                {data.intro || "Memórias guardadas com a delicadeza de uma página de álbum."}
              </p>
              <button
                onClick={() => setRevealed(true)}
                className="mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#C9A84C] bg-[#FDFBF7] px-6 py-3 font-display text-base italic text-[#6B2737] shadow-[0_10px_30px_-12px_rgba(107,39,55,0.4)] transition hover:bg-[#C9A84C] hover:text-[#FDFBF7] active:scale-95 sm:mt-10 sm:px-7"
              >
                Abrir o álbum
                <Heart className="h-3.5 w-3.5 fill-[#C4714A] text-[#C4714A]" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {revealed && (
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-[#C4714A]">
              Nossa Linha do Tempo
            </p>
            <h1 className="mt-3 font-display text-4xl italic text-[#6B2737] sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <div className="mx-auto mt-5 flex items-center justify-center gap-3 text-[#C9A84C]">
              <span className="h-px w-10 bg-[#C9A84C]/40" />
              <Heart className="h-3 w-3 fill-current" />
              <span className="h-px w-10 bg-[#C9A84C]/40" />
            </div>
            {data.intro && (
              <p className="mx-auto mt-5 max-w-xl font-display text-lg italic leading-relaxed text-[#2E2520]/70">
                {data.intro}
              </p>
            )}
          </motion.div>

          {items.length === 0 ? (
            <p className="mt-16 text-center text-[#2E2520]/60">
              Ainda não há fotos neste álbum.
            </p>
          ) : (
            <div className="mt-10 grid grid-cols-1 place-items-center gap-x-5 gap-y-10 min-[420px]:grid-cols-2 sm:mt-14 md:grid-cols-3 md:gap-x-8 md:gap-y-14 lg:grid-cols-4">
              {items.map((m, i) => (
                <Polaroid
                  key={i}
                  index={i}
                  src={m.photo!}
                  caption={m.title}
                  date={m.date}
                  onOpen={() => setActive(i)}
                />
              ))}
            </div>
          )}

          {/* captions for moments without photos — timeline along the golden thread */}
          {data.moments?.some((m) => !m.photo) && (
            <div className="relative mx-auto mt-14 max-w-2xl pl-8 sm:mt-16 sm:pl-12">
              <span className="pointer-events-none absolute bottom-2 left-3 top-2 w-px bg-gradient-to-b from-transparent via-[#C9A84C]/60 to-transparent sm:left-4" />
              <div className="space-y-5 sm:space-y-6">
                {data.moments
                  .filter((m) => !m.photo)
                  .map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="relative rounded-sm border border-[#C9A84C]/30 bg-[#FDFBF7]/70 p-4 shadow-[0_14px_28px_-18px_rgba(46,37,32,0.5)] sm:p-5"
                    >
                      <span className="absolute -left-[1.35rem] top-6 h-2 w-2 rounded-full bg-[#C9A84C] shadow-[0_0_10px_rgba(201,168,76,0.8)] sm:-left-[2.1rem]" />
                      <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#C4714A] sm:text-[10px]">
                        {m.date}
                      </p>
                      <h3 className="mt-2 font-display text-xl italic text-[#6B2737] sm:text-2xl">
                        {m.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#2E2520]/70 sm:text-base">{m.caption}</p>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}


          {data.outro && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto mt-16 max-w-2xl rounded-[6px] border border-[#C9A84C]/40 bg-[#FDFBF7] p-6 text-center shadow-[0_30px_60px_-20px_rgba(107,39,55,0.4)] sm:mt-20 sm:p-10"
            >
              <div className="pointer-events-none absolute inset-3 rounded-[4px] border border-[#C9A84C]/25" />
              <Heart className="mx-auto h-6 w-6 fill-[#C4714A] text-[#C4714A]" />
              <p className="relative mt-4 font-display text-xl italic text-[#6B2737] sm:text-2xl">
                {data.outro}
              </p>

            </motion.div>
          )}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && items[active] && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 grid place-items-center bg-[#2E2520]/85 px-4 py-10 backdrop-blur-md"
            onClick={() => setActive(null)}
          >
            <button
              onClick={() => setActive(null)}
              aria-label="Fechar"
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-[#FDFBF7]/15 text-[#FDFBF7] backdrop-blur transition hover:bg-[#FDFBF7]/25"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              layoutId={`polaroid-${active}`}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl rounded-[3px] bg-[#FDFBF7] p-5 pb-16 shadow-[0_50px_80px_-20px_rgba(0,0,0,0.7)]"
            >
              <WashiTape tone="gold" />
              <div className="relative aspect-[4/3] overflow-hidden bg-[#E8D8C4]">
                <img
                  src={items[active].photo!}
                  alt={items[active].title || ""}
                  className="h-full w-full object-cover [filter:saturate(0.95)_contrast(1.04)_sepia(0.05)]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#C4714A]/10 via-transparent to-[#6B2737]/15 mix-blend-multiply" />
              </div>
              <div className="mt-5 text-center">
                <p className="font-display text-2xl italic text-[#6B2737]">
                  {items[active].title}
                </p>
                {items[active].date && (
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.35em] text-[#C4714A]">
                    {items[active].date}
                  </p>
                )}
                {items[active].caption && (
                  <p className="mt-3 text-sm leading-relaxed text-[#2E2520]/75">
                    {items[active].caption}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
