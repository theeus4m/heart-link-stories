import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ *
 * Ambient backdrop — living, very discreet particles + soft gradients *
 * ------------------------------------------------------------------ */

function rand(i: number, salt = 1) {
  const x = Math.sin((i + 1) * 12.9898 * salt + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function AmbientBackdrop({
  particles = 18,
  tone = "warm",
  className = "",
}: {
  particles?: number;
  tone?: "warm" | "night";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const dots = useMemo(
    () =>
      Array.from({ length: particles }, (_, i) => ({
        left: rand(i, 1) * 100,
        top: rand(i, 2) * 100,
        size: 1.5 + rand(i, 3) * 3,
        delay: rand(i, 4) * 8,
        duration: 12 + rand(i, 5) * 14,
      })),
    [particles],
  );

  const veil =
    tone === "night"
      ? "bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.14),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(74,26,38,0.55),transparent_65%)]"
      : "bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.16),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(107,39,55,0.16),transparent_60%)]";

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className={`absolute inset-0 ${veil}`} />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")",
        }}
      />
      {!reduce &&
        dots.map((d, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#C9A84C]"
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: d.size,
              height: d.size,
              filter: "blur(0.4px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0], y: [0, -60, -120] }}
            transition={{
              duration: d.duration,
              delay: d.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
    </div>
  );
}

/* ---------------------------------------------- *
 * Progressive image — skeleton shimmer + fade-in  *
 * ---------------------------------------------- */

export function ProgressiveImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-[#E8D8C4] ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#EFE4D2] via-[#E3D3BC] to-[#EFE4D2]" />
      )}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          loaded ? "scale-100 opacity-100 blur-0" : "scale-[1.03] opacity-0 blur-sm"
        } ${imgClassName}`}
      />
    </div>
  );
}

/* ------------------------------- *
 * Elegant lightbox with keyboard  *
 * ------------------------------- */

export type LightboxItem = {
  src: string;
  title?: string;
  date?: string;
  caption?: string;
};

export function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (dir: 1 | -1) => void;
}) {
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft") onNavigate(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, onNavigate]);

  const item = index === null ? null : items[index];

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={item.title || "Foto ampliada"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 grid place-items-center bg-[#2E2520]/88 px-3 py-8 backdrop-blur-md sm:px-4 sm:py-10"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-[#FDFBF7]/15 text-[#FDFBF7] backdrop-blur transition hover:bg-[#FDFBF7]/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C] sm:right-5 sm:top-5"
          >
            <X className="h-5 w-5" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(-1);
                }}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[#FDFBF7]/10 text-[#FDFBF7] backdrop-blur transition hover:bg-[#FDFBF7]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C] sm:grid sm:left-5"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(1);
                }}
                aria-label="Próxima foto"
                className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[#FDFBF7]/10 text-[#FDFBF7] backdrop-blur transition hover:bg-[#FDFBF7]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C] sm:grid sm:right-5"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <motion.figure
            key={index}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            drag={items.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) onNavigate(1);
              else if (info.offset.x > 70) onNavigate(-1);
            }}
            className="relative max-h-[88dvh] w-full max-w-2xl touch-pan-y overflow-y-auto rounded-[6px] bg-[#FDFBF7] p-3.5 pb-8 shadow-[0_50px_90px_-24px_rgba(0,0,0,0.7)] sm:p-5 sm:pb-10"
          >
            <ProgressiveImage
              src={item.src}
              alt={item.title || ""}
              eager
              className="aspect-[4/3] w-full"
              imgClassName="[filter:saturate(0.96)_contrast(1.04)]"
            />
            <figcaption className="mt-4 text-center sm:mt-5">
              {item.title && (
                <p className="font-display text-xl italic text-[#6B2737] sm:text-2xl">
                  {item.title}
                </p>
              )}
              {item.date && (
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.35em] text-[#C4714A] sm:text-[10px]">
                  {item.date}
                </p>
              )}
              {item.caption && (
                <p className="mt-3 text-sm leading-relaxed text-[#2E2520]/75">{item.caption}</p>
              )}
              {items.length > 1 && (
                <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.35em] text-[#2E2520]/40">
                  {index! + 1} / {items.length}
                </p>
              )}
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
