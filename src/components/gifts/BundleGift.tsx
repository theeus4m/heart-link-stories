import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Mail, Music, Sparkles, MapPin, Heart } from "lucide-react";
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

type GiftKey = "carta" | "musica" | "momentos" | "mapa";

const ITEMS: Array<{
  key: GiftKey;
  label: string;
  tagline: string;
  icon: typeof Mail;
  accent: string;
}> = [
  { key: "carta", label: "Carta Romântica", tagline: "Abra e leia minhas palavras", icon: Mail, accent: "from-coral to-violet" },
  { key: "musica", label: "Nossa Mixtape", tagline: "Aperte play e lembre de nós", icon: Music, accent: "from-violet to-plum" },
  { key: "momentos", label: "Nossos Momentos", tagline: "Reviva nossa história", icon: Sparkles, accent: "from-coral to-plum" },
  { key: "mapa", label: "Mapa do Amor", tagline: "Conte os km entre nós", icon: MapPin, accent: "from-plum to-violet" },
];

export function BundleGift({ data, title }: { data: BundleData; title: string }) {
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState<GiftKey | null>(null);
  const [visited, setVisited] = useState<Set<GiftKey>>(new Set());

  function open(key: GiftKey) {
    setActive(key);
    setVisited((prev) => new Set(prev).add(key));
  }

  if (active) {
    return (
      <div className="relative">
        <button
          onClick={() => setActive(null)}
          className="fixed left-4 top-4 z-[60] inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-plum shadow-romance backdrop-blur transition hover:scale-105 hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao menu
        </button>
        {active === "carta" && <CartaGift title={data.carta?.recipient ? `Para ${data.carta.recipient}` : title} data={data.carta} />}
        {active === "musica" && <MusicaGift title={data.musica?.mixtapeName || title} data={data.musica} />}
        {active === "momentos" && <MomentosGift title={title} data={data.momentos} />}
        {active === "mapa" && <MapaGift title={data.mapa?.coupleNames || title} data={data.mapa} />}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 gradient-romance opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.25),transparent_60%)]" />
      {/* floating hearts */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${(i * 73) % 100}%`, top: `${(i * 41) % 100}%` }}
            animate={{ y: [-8, 8, -8], opacity: [0.25, 0.7, 0.25] }}
            transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
          >
            <Heart className="h-4 w-4 fill-white/40 text-white/40" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 py-16">
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.button
              key="closed"
              onClick={() => setOpened(true)}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="group relative aspect-[4/3] w-full max-w-md rounded-3xl bg-cream p-10 text-center shadow-2xl"
            >
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="mx-auto grid h-24 w-24 place-items-center rounded-full gradient-romance shadow-romance"
              >
                <Heart className="h-12 w-12 fill-white text-white" />
              </motion.div>
              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-violet">Você recebeu um presente</p>
              <h1 className="mt-2 font-display text-4xl text-plum">{title}</h1>
              {data.recipient && (
                <p className="mt-2 font-display text-xl italic text-coral">para {data.recipient}</p>
              )}
              <p className="mt-6 text-sm text-muted-foreground">Toque para abrir 💌</p>
            </motion.button>
          ) : (
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <div className="text-center text-cream">
                <p className="text-xs uppercase tracking-[0.4em] opacity-80">Para você</p>
                <h1 className="mt-3 font-display text-5xl drop-shadow-md md:text-6xl">{title}</h1>
                {data.intro && (
                  <p className="mx-auto mt-4 max-w-xl font-display text-xl italic opacity-90">
                    "{data.intro}"
                  </p>
                )}
                <p className="mt-6 text-sm opacity-75">
                  Eu preparei <strong>4 surpresas</strong> para você. Abra na ordem que quiser.
                </p>
              </div>

              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {ITEMS.map((it, i) => {
                  const Icon = it.icon;
                  const seen = visited.has(it.key);
                  return (
                    <motion.button
                      key={it.key}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => open(it.key)}
                      className="group relative overflow-hidden rounded-3xl bg-white/95 p-7 text-left shadow-2xl backdrop-blur transition"
                    >
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${it.accent}`} />
                      <div className="flex items-start gap-4">
                        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${it.accent} text-white shadow-romance transition group-hover:scale-110`}>
                          <Icon className="h-6 w-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-2xl text-plum">{it.label}</h3>
                            {seen && (
                              <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-coral">
                                Visto
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{it.tagline}</p>
                          <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-coral">
                            {seen ? "Abrir de novo" : "Abrir agora"}
                            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>→</motion.span>
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <p className="mt-10 text-center text-xs text-cream/70">
                Feito com <Heart className="inline h-3 w-3 fill-current" /> no Chronelo
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
