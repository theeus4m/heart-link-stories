import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
import { AmbientBackdrop, Lightbox, ProgressiveImage, type LightboxItem } from "./shared";

export type MomentosData = {
  intro: string;
  moments: Array<{ date: string; title: string; caption: string; photo?: string }>;
  outro: string;
};

type Moment = MomentosData["moments"][number];

// Deterministic pseudo-random based on index — so polaroid tilts are stable
function seeded(i: number, salt = 1) {
  const x = Math.sin((i + 1) * 9301 * salt + 49297) * 233280;
  return x - Math.floor(x);
}

function periodOf(date?: string) {
  const m = (date || "").match(/(19|20)\d{2}/);
  return m ? m[0] : "Sempre";
}

function WashiTape({ tone = "gold" }: { tone?: "gold" | "rose" | "wine" }) {
  const palette = {
    gold: "from-[#C9A84C]/55 via-[#E8C97A]/35 to-[#C9A84C]/55",
    rose: "from-[#C4714A]/45 via-[#E8B49A]/35 to-[#C4714A]/45",
    wine: "from-[#6B2737]/40 via-[#9B3344]/30 to-[#6B2737]/40",
  }[tone];
  return (
    <div
      aria-hidden
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
    <svg viewBox="0 0 24 24" className={`absolute ${pos} h-4 w-4 text-[#C9A84C]/60`} aria-hidden="true">
      <path d="M2 2 L22 2 L22 6 L6 6 L6 22 L2 22 Z" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function Polaroid({
  moment,
  index,
  onOpen,
}: {
  moment: Moment;
  index: number;
  onOpen: () => void;
}) {
  const rot = (seeded(index) - 0.5) * 8;
  const tone = (["gold", "rose", "wine"] as const)[index % 3];
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 26, rotate: rot, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, rotate: rot, scale: 1 }}
      whileHover={{ rotate: 0, scale: 1.035, y: -6 }}
      whileTap={{ scale: 0.975, rotate: 0, y: -2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.07 }}
      viewport={{ once: true, margin: "-40px" }}
      className="group relative block w-full max-w-[280px] cursor-pointer rounded-[3px] bg-[#FDFBF7] p-2.5 pb-10 text-left shadow-[0_18px_30px_-12px_rgba(46,37,32,0.35),0_4px_10px_-4px_rgba(46,37,32,0.25)] outline-none transition-shadow hover:shadow-[0_34px_56px_-18px_rgba(46,37,32,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A84C] sm:p-3 sm:pb-12"
      style={{ willChange: "transform" }}
      aria-label={`Ampliar foto: ${moment.title || "momento"}`}
    >
      <WashiTape tone={tone} />
      <PolaroidCorner pos="left-1 top-1" />
      <PolaroidCorner pos="right-1 top-1 rotate-90" />
      <PolaroidCorner pos="left-1 bottom-9 -rotate-90" />
      <PolaroidCorner pos="right-1 bottom-9 rotate-180" />

      <div className="relative">
        <ProgressiveImage
          src={moment.photo!}
          alt={moment.title || "Momento"}
          className="aspect-square w-full"
          imgClassName="group-hover:scale-[1.06] [filter:saturate(0.92)_contrast(1.05)_sepia(0.08)]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#C4714A]/10 via-transparent to-[#6B2737]/15 mix-blend-multiply" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(46,37,32,0.25)_100%)]" />
        <div className="pointer-events-none absolute -inset-y-6 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100" />
      </div>

      <div className="mt-2.5 px-1 text-center sm:mt-3">
        <p className="line-clamp-2 font-display text-sm italic leading-tight text-[#6B2737] sm:text-base">
          {moment.title || "—"}
        </p>
        {moment.date && (
          <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.3em] text-[#2E2520]/55 sm:text-[10px]">
            {moment.date}
          </p>
        )}
      </div>
    </motion.button>
  );
}

function TextMoment({ moment }: { moment: Moment }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[280px] rounded-[10px] border border-[#C9A84C]/30 bg-[#FDFBF7]/80 p-5 shadow-[0_18px_34px_-20px_rgba(46,37,32,0.5)] transition-shadow hover:shadow-[0_30px_50px_-20px_rgba(46,37,32,0.55)]"
    >
      {moment.date && (
        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#C4714A]">
          {moment.date}
        </p>
      )}
      <h3 className="mt-2 font-display text-xl italic text-[#6B2737]">{moment.title}</h3>
      {moment.caption && (
        <p className="mt-2 text-sm leading-relaxed text-[#2E2520]/70">{moment.caption}</p>
      )}
    </motion.article>
  );
}

export function MomentosGift({ data, title }: { data: MomentosData; title: string }) {
  const [revealed, setRevealed] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  const moments = useMemo(() => data.moments || [], [data.moments]);

  // photos in original order — lightbox indexes map to these
  const photos = useMemo<LightboxItem[]>(
    () =>
      moments
        .filter((m) => m.photo)
        .map((m) => ({ src: m.photo!, title: m.title, date: m.date, caption: m.caption })),
    [moments],
  );

  const photoIndexOf = useCallback(
    (m: Moment) => photos.findIndex((p) => p.src === m.photo),
    [photos],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Moment[]>();
    for (const m of moments) {
      const key = periodOf(m.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [moments]);

  const go = useCallback(
    (dir: 1 | -1) =>
      setActive((a) => (a === null ? a : (a + dir + photos.length) % photos.length)),
    [photos.length],
  );

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#F5EFE4]">
      <AmbientBackdrop particles={16} />

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
                className="mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#C9A84C] bg-[#FDFBF7] px-6 py-3 font-display text-base italic text-[#6B2737] shadow-[0_10px_30px_-12px_rgba(107,39,55,0.4)] transition hover:bg-[#C9A84C] hover:text-[#FDFBF7] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A84C] sm:mt-10 sm:px-7"
              >
                Abrir o álbum
                <Heart className="h-3.5 w-3.5 fill-[#C4714A] text-[#C4714A]" aria-hidden />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {revealed && (
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <motion.header
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
            <div className="mx-auto mt-5 flex items-center justify-center gap-3 text-[#C9A84C]" aria-hidden>
              <span className="h-px w-10 bg-[#C9A84C]/40" />
              <Heart className="h-3 w-3 fill-current" />
              <span className="h-px w-10 bg-[#C9A84C]/40" />
            </div>
            {data.intro && (
              <p className="mx-auto mt-5 max-w-xl font-display text-lg italic leading-relaxed text-[#2E2520]/70">
                {data.intro}
              </p>
            )}
          </motion.header>

          {moments.length === 0 ? (
            <p className="mt-16 text-center text-[#2E2520]/60">Ainda não há momentos neste álbum.</p>
          ) : (
            <div className="relative mt-12 sm:mt-16">
              {/* golden timeline rail */}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-4 left-[13px] top-4 w-px bg-gradient-to-b from-transparent via-[#C9A84C]/55 to-transparent sm:left-[15px] md:left-1/2 md:-translate-x-1/2"
              />

              <div className="space-y-14 sm:space-y-20">
                {groups.map(([period, list], gi) => (
                  <section key={period} className="relative pl-10 sm:pl-12 md:pl-0">
                    {/* period marker */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="relative mb-7 flex items-center gap-3 md:justify-center"
                    >
                      <span
                        aria-hidden
                        className="absolute -left-[2.15rem] h-2.5 w-2.5 rounded-full bg-[#C9A84C] shadow-[0_0_12px_rgba(201,168,76,0.9)] sm:-left-[2.4rem] md:static md:hidden"
                      />
                      <h2 className="rounded-full border border-[#C9A84C]/40 bg-[#FDFBF7]/85 px-5 py-1.5 font-mono text-[10px] uppercase tracking-[0.4em] text-[#6B2737] shadow-[0_10px_24px_-16px_rgba(46,37,32,0.6)] backdrop-blur">
                        {period}
                      </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 place-items-center gap-x-6 gap-y-10 min-[430px]:grid-cols-2 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
                      {list.map((m, i) =>
                        m.photo ? (
                          <Polaroid
                            key={`${gi}-${i}`}
                            moment={m}
                            index={gi * 7 + i}
                            onOpen={() => setActive(photoIndexOf(m))}
                          />
                        ) : (
                          <TextMoment key={`${gi}-${i}`} moment={m} />
                        ),
                      )}
                    </div>
                  </section>
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
              className="relative mx-auto mt-16 max-w-2xl rounded-[14px] border border-[#C9A84C]/40 bg-[#FDFBF7] p-6 text-center shadow-[0_30px_60px_-20px_rgba(107,39,55,0.4)] sm:mt-24 sm:p-10"
            >
              <div className="pointer-events-none absolute inset-3 rounded-[10px] border border-[#C9A84C]/25" />
              <Heart className="mx-auto h-6 w-6 fill-[#C4714A] text-[#C4714A]" aria-hidden />
              <p className="relative mt-4 font-display text-xl italic text-[#6B2737] sm:text-2xl">
                {data.outro}
              </p>
            </motion.div>
          )}
        </div>
      )}

      <Lightbox items={photos} index={active} onClose={() => setActive(null)} onNavigate={go} />
    </div>
  );
}
