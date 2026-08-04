import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { AmbientBackdrop, ProgressiveImage, Lightbox, type LightboxItem } from "./shared";

export type CartaData = {
  recipient: string;
  message: string;
  signature: string;
  photos?: string[];
  song?: string;
};

/* Ornate gold flourish divider */
function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 24" className={className} aria-hidden="true">
      <g fill="none" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round">
        <path d="M4 12 H92" opacity="0.55" />
        <path d="M148 12 H236" opacity="0.55" />
        <path d="M96 12 q8 -8 16 0 t16 0 t16 0" opacity="0.9" />
        <circle cx="120" cy="12" r="2.6" fill="#C9A84C" stroke="none" />
        <circle cx="96" cy="12" r="1.4" fill="#C9A84C" stroke="none" opacity="0.7" />
        <circle cx="144" cy="12" r="1.4" fill="#C9A84C" stroke="none" opacity="0.7" />
      </g>
    </svg>
  );
}

export function CartaGift({ data, title: _title }: { data: CartaData; title: string }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [zoom, setZoom] = useState<number | null>(null);

  const photos = useMemo(() => (data.photos ?? []).filter(Boolean), [data.photos]);
  const lightboxItems: LightboxItem[] = useMemo(
    () => photos.map((src) => ({ src, title: data.recipient })),
    [photos, data.recipient],
  );

  const message = data.message ?? "";
  const done = typed.length >= message.length;

  /* Typewriter reveal after the letter unfolds */
  useEffect(() => {
    if (!open || !message) return;
    if (reduce) {
      setTyped(message);
      return;
    }
    setTyped("");
    let i = 0;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setTyped(message.slice(0, i));
        if (i >= message.length && interval) window.clearInterval(interval);
      }, 26);
    }, 1900);
    return () => {
      window.clearTimeout(start);
      if (interval) window.clearInterval(interval);
    };
  }, [open, message, reduce]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#F5EFE4]">
      <AmbientBackdrop particles={16} tone="warm" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgba(46,37,32,0.3)_100%)]" />

      <div className="relative z-30 mx-auto grid min-h-[100dvh] max-w-3xl place-items-center px-4 py-10 sm:px-6 sm:py-12">
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.button
              key="envelope"
              onClick={() => setOpen(true)}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: reduce ? 0 : [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.9 },
                scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
              }}
              exit={{ scale: 1.18, opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
              whileHover={{ scale: 1.035 }}
              whileTap={{ scale: 0.98 }}
              className="group relative aspect-[7/5] w-[min(92vw,28rem)] cursor-pointer rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#C9A84C]"
              style={{ perspective: 1600 }}
              aria-label={`Abrir carta para ${data.recipient || "você"}`}
            >
              <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.35),transparent_65%)] blur-2xl" />

              {/* Envelope body */}
              <div className="absolute inset-0 overflow-hidden rounded-[14px] bg-gradient-to-br from-[#FDFBF7] via-[#F5EDE2] to-[#E2CFB6] shadow-[0_40px_70px_-20px_rgba(107,39,55,0.55),0_15px_30px_-12px_rgba(46,37,32,0.4),inset_0_1px_0_rgba(255,255,255,0.7)]">
                <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_20%_10%,#6B2737,transparent_40%),radial-gradient(circle_at_80%_90%,#C4714A,transparent_40%)]" />
                <div className="absolute inset-3 rounded-[10px] border border-[#C9A84C]/45" />
                <div className="absolute inset-[14px] rounded-[8px] border border-[#C9A84C]/20" />

                <div className="absolute inset-0 grid place-items-center px-6">
                  <div className="text-center">
                    <p className="font-display text-[11px] uppercase tracking-[0.5em] text-[#6B2737]/65">
                      Para você
                    </p>
                    <p className="mt-3 font-display text-2xl italic leading-tight text-[#6B2737] sm:text-3xl md:text-4xl">
                      {data.recipient || "Meu amor"}
                    </p>
                    <Flourish className="mx-auto mt-4 h-4 w-40 opacity-80" />
                    <p className="mt-3 text-[10px] uppercase tracking-[0.45em] text-[#2E2520]/55">
                      Toque para abrir
                    </p>
                  </div>
                </div>
              </div>

              {/* Flap */}
              <div
                className="absolute inset-x-0 top-0 origin-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[transform:rotateX(-18deg)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <svg viewBox="0 0 700 260" className="block w-full drop-shadow-[0_10px_18px_rgba(107,39,55,0.3)]">
                  <defs>
                    <linearGradient id="flap" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#FDFBF7" />
                      <stop offset="100%" stopColor="#E2CFB6" />
                    </linearGradient>
                  </defs>
                  <path d="M0 0 L700 0 L700 30 L350 240 L0 30 Z" fill="url(#flap)" />
                  <path d="M0 30 L350 240 L700 30" fill="none" stroke="#C9A84C" strokeOpacity="0.5" strokeWidth="1.2" />
                </svg>
              </div>

              {/* Wax seal */}
              <motion.div
                className="absolute left-1/2 top-[58%] z-10 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-[#9B3344] via-[#6B2737] to-[#3F1620] shadow-[0_10px_28px_rgba(107,39,55,0.6),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-4px_8px_rgba(0,0,0,0.45)] sm:h-20 sm:w-20"
                animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-1 rounded-full border border-[#C9A84C]/40" />
                <Heart className="h-6 w-6 fill-[#C9A84C] text-[#C9A84C] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] sm:h-7 sm:w-7" />
              </motion.div>

              {!reduce && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]">
                  <motion.div
                    className="absolute -inset-y-4 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ["0%", "420%"] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
                  />
                </div>
              )}
            </motion.button>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 70, rotateX: -18, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1400 }}
              className="relative w-full"
            >
              <div className="absolute -inset-8 rounded-[12px] bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.3),transparent_70%)] blur-2xl" />

              {/* Paper */}
              <div className="relative max-h-[84dvh] overflow-y-auto overscroll-contain rounded-[8px] bg-[#FDFBF7] p-5 shadow-[0_50px_100px_-20px_rgba(107,39,55,0.55),0_20px_40px_-15px_rgba(46,37,32,0.4)] sm:p-8 md:max-h-none md:p-16">
                {/* Grain, fold creases & vignette */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.045]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.85'/></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>\")",
                  }}
                />
                <div className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-[#2E2520]/12 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-gradient-to-r from-transparent via-[#2E2520]/10 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(107,39,55,0.08)_100%)]" />

                {/* Gold corners */}
                <div className="pointer-events-none absolute left-3 top-3 h-9 w-9 border-l border-t border-[#C9A84C]/60 sm:left-4 sm:top-4 sm:h-12 sm:w-12" />
                <div className="pointer-events-none absolute right-3 top-3 h-9 w-9 border-r border-t border-[#C9A84C]/60 sm:right-4 sm:top-4 sm:h-12 sm:w-12" />
                <div className="pointer-events-none absolute bottom-3 left-3 h-9 w-9 border-b border-l border-[#C9A84C]/60 sm:bottom-4 sm:left-4 sm:h-12 sm:w-12" />
                <div className="pointer-events-none absolute bottom-3 right-3 h-9 w-9 border-b border-r border-[#C9A84C]/60 sm:bottom-4 sm:right-4 sm:h-12 sm:w-12" />

                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <Heart className="h-48 w-48 fill-[#6B2737] text-[#6B2737] opacity-[0.025] sm:h-72 sm:w-72" />
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.9 }}
                  className="relative text-center text-[11px] uppercase tracking-[0.55em] text-[#C4714A]"
                >
                  Para
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.25, duration: 1 }}
                  className="relative mt-3 text-center font-display text-3xl italic text-[#6B2737] sm:text-5xl md:text-6xl"
                >
                  {data.recipient || "Meu amor"}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.45, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative mx-auto my-6 flex justify-center sm:my-8"
                >
                  <Flourish className="h-4 w-40 sm:h-5 sm:w-56" />
                </motion.div>

                <p className="relative whitespace-pre-wrap text-center font-display text-lg italic leading-relaxed text-[#2E2520] sm:text-xl md:text-2xl">
                  <span className="sr-only">{message}</span>
                  <span aria-hidden>{typed}</span>
                  {!done && (
                    <span aria-hidden className="ml-0.5 -mb-1 inline-block h-[1em] w-[2px] animate-pulse bg-[#6B2737]/60" />
                  )}
                </p>

                {!done && message && (
                  <div className="relative mt-5 flex justify-center">
                    <button
                      onClick={() => setTyped(message)}
                      className="rounded-full border border-[#C9A84C]/50 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#6B2737]/70 transition hover:bg-[#C9A84C]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]"
                    >
                      Ler tudo
                    </button>
                  </div>
                )}

                {data.signature && (
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.3, duration: 1 }}
                    className="relative mt-10 text-right font-display text-2xl italic text-[#6B2737] sm:text-3xl"
                  >
                    — {data.signature}
                  </motion.p>
                )}

                {photos.length > 0 && (
                  <div className="relative mt-8 grid grid-cols-2 gap-2.5 sm:mt-10 sm:grid-cols-3 sm:gap-3">
                    {photos.map((src, i) => (
                      <motion.button
                        key={src + i}
                        type="button"
                        onClick={() => setZoom(i)}
                        aria-label={`Ampliar foto ${i + 1}`}
                        initial={{ opacity: 0, scale: 0.94, y: 14 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ delay: 2.5 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-[4px] shadow-[0_12px_24px_-10px_rgba(46,37,32,0.5)] ring-1 ring-[#C9A84C]/40 transition-shadow hover:shadow-[0_22px_36px_-12px_rgba(46,37,32,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]"
                      >
                        <ProgressiveImage src={src} alt="" className="h-full w-full" />
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2E2520]/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      </motion.button>
                    ))}
                  </div>
                )}

                {data.song && data.song.includes("spotify.com") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.8, duration: 0.9 }}
                    className="relative mt-8 overflow-hidden rounded-xl ring-1 ring-[#C9A84C]/30"
                  >
                    <iframe
                      title="Música da carta"
                      src={data.song.replace("/track/", "/embed/track/")}
                      width="100%"
                      height="80"
                      loading="lazy"
                      allow="encrypted-media"
                      className="border-0"
                    />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 3, duration: 0.7 }}
                  className="relative mt-12 flex justify-center"
                >
                  <Heart className="h-7 w-7 animate-heartbeat fill-[#C4714A] text-[#C4714A] drop-shadow-[0_2px_6px_rgba(196,113,74,0.4)]" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Lightbox
        items={lightboxItems}
        index={zoom}
        onClose={() => setZoom(null)}
        onNavigate={(dir) =>
          setZoom((i) => (i === null ? null : (i + dir + lightboxItems.length) % lightboxItems.length))
        }
      />
    </div>
  );
}
