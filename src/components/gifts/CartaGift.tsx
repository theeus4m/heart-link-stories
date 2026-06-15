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

// Ornate gold flourish divider
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
  const [open, setOpen] = useState(false);

  const petals = useMemo(
    () =>
      [...Array(34)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 7,
        size: 16 + Math.random() * 30,
        rotate: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
        sway: 30 + Math.random() * 90,
      })),
    [],
  );

  const burst = useMemo(
    () =>
      [...Array(18)].map((_, i) => ({
        id: i,
        angle: (i / 18) * Math.PI * 2 + Math.random() * 0.3,
        distance: 200 + Math.random() * 160,
        size: 22 + Math.random() * 22,
        delay: Math.random() * 0.2,
      })),
    [],
  );

  const sparkles = useMemo(
    () =>
      [...Array(28)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 3,
      })),
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5EFE4]">
      {/* Layered ambient glow — warm romantic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.18),transparent_55%),radial-gradient(ellipse_at_center,rgba(196,113,74,0.14),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(107,39,55,0.28),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(46,37,32,0.35)_100%)]" />

      {/* Ambient golden dust — always present, subtle */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {sparkles.map((s) => (
          <motion.div
            key={`s-${s.id}`}
            className="absolute rounded-full bg-[#C9A84C]"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              boxShadow: "0 0 8px rgba(201,168,76,0.85)",
            }}
            animate={{
              opacity: [0, 0.9, 0],
              scale: [0.4, 1.2, 0.4],
              y: [0, -18, 0],
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

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
                  scale: [0.4, 1.15, 0.7],
                  rotate: 360,
                }}
                transition={{ duration: 1.8, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
                style={{ marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
              >
                <Rose
                  className="drop-shadow-[0_6px_12px_rgba(107,39,55,0.45)]"
                  style={{ width: p.size, height: p.size }}
                />
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
              <Rose className="h-full w-full drop-shadow-[0_4px_8px_rgba(107,39,55,0.3)]" />
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
                y: [0, -8, 0],
              }}
              transition={{
                opacity: { duration: 0.9 },
                scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
              }}
              exit={{ scale: 1.18, opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
              whileHover={{ scale: 1.035 }}
              whileTap={{ scale: 0.98 }}
              className="group relative aspect-[7/5] w-full max-w-md cursor-pointer"
              style={{ perspective: 1600 }}
              aria-label="Abrir carta"
            >
              {/* Golden halo behind envelope */}
              <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.35),transparent_65%)] blur-2xl" />

              {/* Envelope body */}
              <div className="absolute inset-0 overflow-hidden rounded-[14px] bg-gradient-to-br from-[#FDFBF7] via-[#F5EDE2] to-[#E2CFB6] shadow-[0_40px_70px_-20px_rgba(107,39,55,0.55),0_15px_30px_-12px_rgba(46,37,32,0.4),inset_0_1px_0_rgba(255,255,255,0.7)]">
                {/* Inner texture */}
                <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_20%_10%,#6B2737,transparent_40%),radial-gradient(circle_at_80%_90%,#C4714A,transparent_40%)]" />
                {/* Decorative double border */}
                <div className="absolute inset-3 rounded-[10px] border border-[#C9A84C]/45" />
                <div className="absolute inset-[14px] rounded-[8px] border border-[#C9A84C]/20" />

                {/* Monogram content */}
                <div className="absolute inset-0 grid place-items-center px-6">
                  <div className="text-center">
                    <p className="font-display text-[11px] uppercase tracking-[0.5em] text-[#6B2737]/65">
                      Para você
                    </p>
                    <p className="mt-3 font-display text-3xl italic leading-tight text-[#6B2737] md:text-4xl">
                      {data.recipient || "Meu amor"}
                    </p>
                    <Flourish className="mx-auto mt-4 h-4 w-40 opacity-80" />
                    <p className="mt-3 text-[10px] uppercase tracking-[0.45em] text-[#2E2520]/55">
                      Toque para abrir
                    </p>
                  </div>
                </div>
              </div>

              {/* Envelope flap */}
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
                  <path
                    d="M0 30 L350 240 L700 30"
                    fill="none"
                    stroke="#C9A84C"
                    strokeOpacity="0.5"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>

              {/* Wax seal */}
              <motion.div
                className="absolute left-1/2 top-[58%] z-10 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-[#9B3344] via-[#6B2737] to-[#3F1620] shadow-[0_10px_28px_rgba(107,39,55,0.6),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-4px_8px_rgba(0,0,0,0.45)]"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-1 rounded-full border border-[#C9A84C]/40" />
                <Heart className="h-7 w-7 fill-[#C9A84C] text-[#C9A84C] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
              </motion.div>

              {/* Shimmer pass over envelope */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]">
                <motion.div
                  className="absolute -inset-y-4 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ["0%", "420%"] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
                />
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 70, rotateX: -18, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              transition={{ delay: 0.7, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1400 }}
              className="relative w-full"
            >
              {/* Soft golden halo behind paper */}
              <div className="absolute -inset-8 rounded-[12px] bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.3),transparent_70%)] blur-2xl" />

              {/* Paper */}
              <div className="relative overflow-hidden rounded-[6px] bg-[#FDFBF7] p-8 shadow-[0_50px_100px_-20px_rgba(107,39,55,0.55),0_20px_40px_-15px_rgba(46,37,32,0.4)] md:p-16">
                {/* Paper grain & vignette */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_30%_20%,#2E2520,transparent_60%),radial-gradient(circle_at_70%_80%,#6B2737,transparent_60%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(107,39,55,0.08)_100%)]" />

                {/* Gold corner flourishes */}
                <div className="pointer-events-none absolute left-4 top-4 h-12 w-12 border-l border-t border-[#C9A84C]/60" />
                <div className="pointer-events-none absolute right-4 top-4 h-12 w-12 border-r border-t border-[#C9A84C]/60" />
                <div className="pointer-events-none absolute bottom-4 left-4 h-12 w-12 border-b border-l border-[#C9A84C]/60" />
                <div className="pointer-events-none absolute bottom-4 right-4 h-12 w-12 border-b border-r border-[#C9A84C]/60" />

                {/* Monogram watermark */}
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <Heart className="h-72 w-72 fill-[#6B2737] text-[#6B2737] opacity-[0.025]" />
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.9 }}
                  className="relative text-center text-[11px] uppercase tracking-[0.55em] text-[#C4714A]"
                >
                  Para
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 14, letterSpacing: "0.1em" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
                  transition={{ delay: 1.45, duration: 1 }}
                  className="relative mt-3 text-center font-display text-4xl italic text-[#6B2737] md:text-6xl"
                >
                  {data.recipient || "Meu amor"}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.7, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative mx-auto my-8 flex justify-center"
                >
                  <Flourish className="h-5 w-56" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.95, duration: 1.4 }}
                  className="relative whitespace-pre-wrap text-center font-display text-xl italic leading-relaxed text-[#2E2520] md:text-2xl"
                >
                  {data.message}
                </motion.p>

                {data.signature && (
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.5, duration: 1 }}
                    className="relative mt-10 text-right font-display text-2xl italic text-[#6B2737]"
                  >
                    — {data.signature}
                  </motion.p>
                )}

                {data.photos && data.photos.filter(Boolean).length > 0 && (
                  <div className="relative mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {data.photos.filter(Boolean).map((src, i) => (
                      <motion.img
                        key={i}
                        src={src}
                        alt=""
                        initial={{ opacity: 0, scale: 0.9, y: 14 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 2.7 + i * 0.14, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="aspect-square w-full rounded-sm object-cover shadow-[0_12px_24px_-10px_rgba(46,37,32,0.5)] ring-1 ring-[#C9A84C]/40"
                      />
                    ))}
                  </div>
                )}

                {data.song && data.song.includes("spotify.com") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.9, duration: 0.9 }}
                    className="relative mt-8 overflow-hidden rounded-xl ring-1 ring-[#C9A84C]/30"
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
                  transition={{ delay: 3.1, duration: 0.7 }}
                  className="relative mt-12 flex justify-center"
                >
                  <Heart className="h-7 w-7 animate-heartbeat fill-[#C4714A] text-[#C4714A] drop-shadow-[0_2px_6px_rgba(196,113,74,0.4)]" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
