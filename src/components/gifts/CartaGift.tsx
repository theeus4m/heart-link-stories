import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { Heart } from "lucide-react";

export type CartaData = {
  recipient: string;
  message: string;
  signature: string;
  photos?: string[];
  song?: string;
};

// Rose SVG — soft, elegant, romantic
function Rose({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id="rg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#F4B6B0" />
          <stop offset="55%" stopColor="#C4714A" />
          <stop offset="100%" stopColor="#6B2737" />
        </radialGradient>
      </defs>
      <g>
        <path
          d="M16 6c4 0 7 3 7 6.5 0 2-1 3.5-2.6 4.4 2.2.6 3.6 2.4 3.6 4.6 0 3-2.7 5-6 5-1.6 0-3-.5-4-1.3-1 .8-2.4 1.3-4 1.3-3.3 0-6-2-6-5 0-2.2 1.4-4 3.6-4.6C6 16 5 14.5 5 12.5 5 9 8 6 12 6c.7 0 1.4.1 2 .3.6-.2 1.3-.3 2-.3z"
          fill="url(#rg)"
        />
        <path
          d="M16 11c2 0 3.5 1.4 3.5 3.2 0 1.6-1.2 2.8-2.8 3 1.3.3 2.3 1.3 2.3 2.6 0 1.6-1.4 2.7-3 2.7s-3-1.1-3-2.7c0-1.3 1-2.3 2.3-2.6-1.6-.2-2.8-1.4-2.8-3C12.5 12.4 14 11 16 11z"
          fill="#6B2737"
          opacity="0.55"
        />
      </g>
    </svg>
  );
}

export function CartaGift({ data, title }: { data: CartaData; title: string }) {
  const [open, setOpen] = useState(false);

  // Stable random petals (so they don't reshuffle each render)
  const petals = useMemo(
    () =>
      [...Array(36)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 7 + Math.random() * 6,
        size: 18 + Math.random() * 28,
        rotate: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
        sway: 30 + Math.random() * 80,
      })),
    [],
  );

  const burst = useMemo(
    () =>
      [...Array(14)].map((_, i) => ({
        id: i,
        angle: (i / 14) * Math.PI * 2,
        distance: 180 + Math.random() * 120,
        size: 22 + Math.random() * 18,
        delay: Math.random() * 0.15,
      })),
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F0E8]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,113,74,0.18),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(107,39,55,0.22),transparent_55%)]" />

      {/* Initial burst from envelope */}
      <AnimatePresence>
        {open && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-0 w-0">
            {burst.map((p) => (
              <motion.div
                key={`b-${p.id}`}
                className="absolute"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: 0 }}
                animate={{
                  x: Math.cos(p.angle) * p.distance,
                  y: Math.sin(p.angle) * p.distance,
                  opacity: [0, 1, 0],
                  scale: [0.4, 1.1, 0.7],
                  rotate: 360,
                }}
                transition={{ duration: 1.6, delay: p.delay, ease: "easeOut" }}
                style={{ marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
              >
                <Rose className="drop-shadow-[0_6px_10px_rgba(107,39,55,0.35)]" style={{ width: p.size, height: p.size } as never} />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Falling rose rain */}
      {open && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {petals.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{ left: `${p.left}%`, top: "-12%", width: p.size, height: p.size }}
              initial={{ y: -80, x: 0, rotate: 0, opacity: 0 }}
              animate={{
                y: "115vh",
                x: [0, p.sway, -p.sway, 0],
                rotate: p.rotate,
                opacity: [0, 1, 1, 0.85, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeIn",
                times: [0, 0.1, 0.5, 0.85, 1],
              }}
            >
              <Rose className="h-full w-full drop-shadow-[0_4px_8px_rgba(107,39,55,0.25)]" />
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 mx-auto grid min-h-screen max-w-3xl place-items-center px-5 py-12">
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.button
              key="envelope"
              onClick={() => setOpen(true)}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: [0, -6, 0],
              }}
              transition={{
                opacity: { duration: 0.8 },
                scale: { duration: 0.8, ease: "easeOut" },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
              exit={{ scale: 1.15, opacity: 0, transition: { duration: 0.6 } }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="group relative aspect-[7/5] w-full max-w-md"
              style={{ perspective: 1400 }}
              aria-label="Abrir carta"
            >
              {/* Envelope body */}
              <div className="absolute inset-0 overflow-hidden rounded-[14px] bg-gradient-to-br from-[#FDFBF7] via-[#F5EDE2] to-[#E8D8C4] shadow-[0_30px_60px_-20px_rgba(107,39,55,0.45),0_10px_25px_-10px_rgba(46,37,32,0.3)]">
                {/* Inner texture */}
                <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_10%,#6B2737,transparent_40%),radial-gradient(circle_at_80%_90%,#C4714A,transparent_40%)]" />

                {/* Decorative border */}
                <div className="absolute inset-3 rounded-[10px] border border-[#C9A84C]/40" />

                {/* Monogram */}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <p className="font-display text-[11px] uppercase tracking-[0.45em] text-[#6B2737]/60">
                      Para você
                    </p>
                    <p className="mt-3 font-display text-3xl italic text-[#6B2737] md:text-4xl">
                      {data.recipient || "Meu amor"}
                    </p>
                    <div className="mx-auto mt-4 h-px w-16 bg-[#C9A84C]/70" />
                    <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-[#2E2520]/55">
                      Toque para abrir
                    </p>
                  </div>
                </div>
              </div>

              {/* Envelope flap (top triangle) */}
              <div
                className="absolute inset-x-0 top-0 origin-top transition-transform duration-500 group-hover:-rotate-x-12"
                style={{ transformStyle: "preserve-3d" }}
              >
                <svg viewBox="0 0 700 260" className="block w-full drop-shadow-[0_8px_12px_rgba(107,39,55,0.25)]">
                  <defs>
                    <linearGradient id="flap" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#FDFBF7" />
                      <stop offset="100%" stopColor="#E8D8C4" />
                    </linearGradient>
                  </defs>
                  <path d="M0 0 L700 0 L700 30 L350 240 L0 30 Z" fill="url(#flap)" />
                  <path d="M0 30 L350 240 L700 30" fill="none" stroke="#C9A84C" strokeOpacity="0.4" strokeWidth="1.2" />
                </svg>
              </div>

              {/* Wax seal */}
              <motion.div
                className="absolute left-1/2 top-[58%] z-10 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-[#8B2F3F] via-[#6B2737] to-[#3F1620] shadow-[0_8px_20px_rgba(107,39,55,0.55),inset_0_2px_4px_rgba(255,255,255,0.25),inset_0_-3px_6px_rgba(0,0,0,0.4)]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-6 w-6 fill-[#C9A84C] text-[#C9A84C]" />
              </motion.div>
            </motion.button>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 60, rotateX: -15, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1200 }}
              className="relative w-full"
            >
              {/* Paper */}
              <div className="relative overflow-hidden rounded-[6px] bg-[#FDFBF7] p-8 shadow-[0_40px_80px_-20px_rgba(107,39,55,0.45),0_15px_30px_-15px_rgba(46,37,32,0.35)] md:p-14">
                {/* Paper grain */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_30%_20%,#2E2520,transparent_60%),radial-gradient(circle_at_70%_80%,#6B2737,transparent_60%)]" />
                {/* Gold corner flourishes */}
                <div className="pointer-events-none absolute left-4 top-4 h-10 w-10 border-l border-t border-[#C9A84C]/60" />
                <div className="pointer-events-none absolute right-4 top-4 h-10 w-10 border-r border-t border-[#C9A84C]/60" />
                <div className="pointer-events-none absolute bottom-4 left-4 h-10 w-10 border-b border-l border-[#C9A84C]/60" />
                <div className="pointer-events-none absolute bottom-4 right-4 h-10 w-10 border-b border-r border-[#C9A84C]/60" />

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="text-center text-[11px] uppercase tracking-[0.5em] text-[#C4714A]"
                >
                  Para
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.25, duration: 0.9 }}
                  className="mt-2 text-center font-display text-4xl italic text-[#6B2737] md:text-6xl"
                >
                  {data.recipient || "Meu amor"}
                </motion.h1>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="mx-auto my-7 h-px w-40 origin-center bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent"
                />

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7, duration: 1.2 }}
                  className="whitespace-pre-wrap text-center font-display text-xl italic leading-relaxed text-[#2E2520] md:text-2xl"
                >
                  {data.message}
                </motion.p>

                {data.signature && (
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.2, duration: 0.9 }}
                    className="mt-10 text-right font-display text-xl italic text-[#6B2737]"
                  >
                    — {data.signature}
                  </motion.p>
                )}

                {data.photos && data.photos.filter(Boolean).length > 0 && (
                  <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {data.photos.filter(Boolean).map((src, i) => (
                      <motion.img
                        key={i}
                        src={src}
                        alt=""
                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 2.4 + i * 0.12, duration: 0.7 }}
                        className="aspect-square w-full rounded-sm object-cover shadow-[0_10px_20px_-10px_rgba(46,37,32,0.4)] ring-1 ring-[#C9A84C]/30"
                      />
                    ))}
                  </div>
                )}

                {data.song && data.song.includes("spotify.com") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.6, duration: 0.8 }}
                    className="mt-8 overflow-hidden rounded-xl"
                  >
                    <iframe
                      src={data.song.replace("/track/", "/embed/track/")}
                      width="100%"
                      height="80"
                      allow="encrypted-media"
                      className="border-0"
                    />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.8, duration: 0.6 }}
                  className="mt-12 flex justify-center"
                >
                  <Heart className="h-6 w-6 animate-heartbeat fill-[#C4714A] text-[#C4714A]" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
