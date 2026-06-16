import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "pt" | "en" | "es";

type Dict = Record<string, string>;

const translations: Record<Lang, Dict> = {
  pt: {
    "nav.gifts": "Meus presentes",
    "nav.signout": "Sair",
    "nav.signin": "Entrar",
    "nav.create": "Criar presente",
    "hero.eyebrow": "Presentes digitais para casais",
    "hero.title1": "O tempo passa.",
    "hero.title2": "O elo fica.",
    "hero.subtitle": "Transforme momentos, fotos e datas em uma retrospectiva viva — uma timeline só de vocês dois, pronta para presentear.",
    "hero.cta.primary": "Criar minha timeline",
    "hero.cta.secondary": "Ver demonstração",
    "hero.rating": "avaliações",
    "hero.delivered": "300+ presentes entregues",
    "previews.eyebrow": "Anteprime",
    "previews.title.a": "Veja como cada presente",
    "previews.title.b": "ganha vida",
    "previews.lettera.desc": "Envelope selado em lacre, pétalas e palavras que abrem devagar.",
    "previews.mixtape.desc": "Toca-discos com vinil que gira e trilha escolhida a dois.",
    "previews.momenti.desc": "Polaroids inclinadas sobre a mesa, álbum de memórias revelado.",
    "previews.mappa.desc": "Mapa do amor com a distância em batimentos e quilômetros.",
    "gifts.eyebrow": "I quattro doni",
    "gifts.title.a": "Quatro formas de dizer",
    "gifts.title.b": "ti amo",
    "gifts.lettera.sub": "Carta Romântica",
    "gifts.lettera.desc": "Abertura com chuva de pétalas, galeria de fotos e trilha que envolve cada palavra.",
    "gifts.mixtape.sub": "Nossa Trilha",
    "gifts.mixtape.desc": "Rádio retrô em forma de fita cassete — até cinco músicas escolhidas a dois.",
    "gifts.momenti.sub": "Nossos Momentos",
    "gifts.momenti.desc": "Linha do tempo do casal revelada com a ternura de um pequeno guardião.",
    "gifts.mappa.sub": "Mapa do Amor",
    "gifts.mappa.desc": "Globo interativo que mede em quilômetros a distância — e em batimentos o amor.",
    "benefits.eyebrow": "Perché Chronelo",
    "benefits.title.a": "Feito para",
    "benefits.title.b": "emocionar",
    "benefits.title.c": "de verdade",
    "benefits.b1.t": "Pronto em 5 minutos",
    "benefits.b1.d": "Editor guiado, templates prontos, zero complicação.",
    "benefits.b2.t": "Inteiramente seu",
    "benefits.b2.d": "Suas fotos, suas músicas, suas palavras.",
    "benefits.b3.t": "Abre em qualquer tela",
    "benefits.b3.d": "Um link basta. Sem app, sem cadastro pra quem recebe.",
    "benefits.b4.t": "Para sempre guardado",
    "benefits.b4.d": "Link único e exclusivo, salvo na nuvem.",
    "how.eyebrow": "In tre passi",
    "how.title.a": "Mais fácil que escrever",
    "how.title.b": "à mão",
    "how.s1.t": "Personalize",
    "how.s1.d": "Escolha fotos, escreva sua mensagem, monte sua trilha.",
    "how.s2.t": "Pré-visualize",
    "how.s2.d": "Veja exatamente o que ele(a) vai receber.",
    "how.s3.t": "Envie o link",
    "how.s3.d": "Compartilhe pelo WhatsApp, e-mail ou imprima um QR.",
    "lang.label": "Idioma",
  },
  en: {
    "nav.gifts": "My gifts",
    "nav.signout": "Sign out",
    "nav.signin": "Sign in",
    "nav.create": "Create gift",
    "hero.eyebrow": "Digital gifts for couples",
    "hero.title1": "Time goes by.",
    "hero.title2": "The bond remains.",
    "hero.subtitle": "Turn moments, photos and dates into a living retrospective — a timeline made just for the two of you, ready to gift.",
    "hero.cta.primary": "Create my timeline",
    "hero.cta.secondary": "See demo",
    "hero.rating": "reviews",
    "hero.delivered": "300+ gifts delivered",
    "previews.eyebrow": "Previews",
    "previews.title.a": "See how each gift",
    "previews.title.b": "comes alive",
    "previews.lettera.desc": "A wax-sealed envelope, petals and words that open slowly.",
    "previews.mixtape.desc": "A spinning vinyl turntable and a soundtrack chosen together.",
    "previews.momenti.desc": "Tilted polaroids on the table — your shared album revealed.",
    "previews.mappa.desc": "A love map with distance in heartbeats and kilometers.",
    "gifts.eyebrow": "The four gifts",
    "gifts.title.a": "Four ways to say",
    "gifts.title.b": "I love you",
    "gifts.lettera.sub": "Romantic Letter",
    "gifts.lettera.desc": "Opens with a rain of petals, a photo gallery and a soundtrack wrapping every word.",
    "gifts.mixtape.sub": "Our Soundtrack",
    "gifts.mixtape.desc": "A retro radio in cassette form — up to five songs picked together.",
    "gifts.momenti.sub": "Our Moments",
    "gifts.momenti.desc": "Your couple's timeline revealed with the tenderness of a small keeper.",
    "gifts.mappa.sub": "Love Map",
    "gifts.mappa.desc": "Interactive globe that measures distance in kilometers — and love in heartbeats.",
    "benefits.eyebrow": "Why Chronelo",
    "benefits.title.a": "Built to",
    "benefits.title.b": "move",
    "benefits.title.c": "you, truly",
    "benefits.b1.t": "Ready in 5 minutes",
    "benefits.b1.d": "Guided editor, ready-made templates, zero hassle.",
    "benefits.b2.t": "Entirely yours",
    "benefits.b2.d": "Your photos, your music, your words.",
    "benefits.b3.t": "Opens on any screen",
    "benefits.b3.d": "Just a link. No app, no signup for whoever receives it.",
    "benefits.b4.t": "Kept forever",
    "benefits.b4.d": "A unique, private link safely saved in the cloud.",
    "how.eyebrow": "In three steps",
    "how.title.a": "Easier than writing",
    "how.title.b": "by hand",
    "how.s1.t": "Personalize",
    "how.s1.d": "Pick photos, write your message, build the soundtrack.",
    "how.s2.t": "Preview",
    "how.s2.d": "See exactly what they will receive.",
    "how.s3.t": "Send the link",
    "how.s3.d": "Share via WhatsApp, email or print a QR code.",
    "lang.label": "Language",
  },
  es: {
    "nav.gifts": "Mis regalos",
    "nav.signout": "Salir",
    "nav.signin": "Entrar",
    "nav.create": "Crear regalo",
    "hero.eyebrow": "Regalos digitales para parejas",
    "hero.title1": "El tiempo pasa.",
    "hero.title2": "El vínculo queda.",
    "hero.subtitle": "Convierte momentos, fotos y fechas en una retrospectiva viva — una línea de tiempo solo de ustedes dos, lista para regalar.",
    "hero.cta.primary": "Crear mi línea de tiempo",
    "hero.cta.secondary": "Ver demostración",
    "hero.rating": "valoraciones",
    "hero.delivered": "300+ regalos entregados",
    "previews.eyebrow": "Anteprime",
    "previews.title.a": "Mira cómo cada regalo",
    "previews.title.b": "cobra vida",
    "previews.lettera.desc": "Sobre sellado con lacre, pétalos y palabras que se abren despacio.",
    "previews.mixtape.desc": "Tocadiscos con vinilo que gira y una banda sonora elegida juntos.",
    "previews.momenti.desc": "Polaroids inclinadas sobre la mesa, álbum de recuerdos revelado.",
    "previews.mappa.desc": "Mapa del amor con la distancia en latidos y kilómetros.",
    "gifts.eyebrow": "Los cuatro regalos",
    "gifts.title.a": "Cuatro formas de decir",
    "gifts.title.b": "te amo",
    "gifts.lettera.sub": "Carta Romántica",
    "gifts.lettera.desc": "Apertura con lluvia de pétalos, galería de fotos y banda sonora que envuelve cada palabra.",
    "gifts.mixtape.sub": "Nuestra Banda Sonora",
    "gifts.mixtape.desc": "Radio retro en forma de casete — hasta cinco canciones elegidas a dúo.",
    "gifts.momenti.sub": "Nuestros Momentos",
    "gifts.momenti.desc": "La línea de tiempo de la pareja revelada con la ternura de un pequeño guardián.",
    "gifts.mappa.sub": "Mapa del Amor",
    "gifts.mappa.desc": "Globo interactivo que mide la distancia en kilómetros — y el amor en latidos.",
    "benefits.eyebrow": "Por qué Chronelo",
    "benefits.title.a": "Hecho para",
    "benefits.title.b": "emocionar",
    "benefits.title.c": "de verdad",
    "benefits.b1.t": "Listo en 5 minutos",
    "benefits.b1.d": "Editor guiado, plantillas listas, cero complicación.",
    "benefits.b2.t": "Totalmente tuyo",
    "benefits.b2.d": "Tus fotos, tu música, tus palabras.",
    "benefits.b3.t": "Se abre en cualquier pantalla",
    "benefits.b3.d": "Basta un enlace. Sin app, sin registro para quien lo recibe.",
    "benefits.b4.t": "Guardado para siempre",
    "benefits.b4.d": "Enlace único y exclusivo, guardado en la nube.",
    "how.eyebrow": "En tres pasos",
    "how.title.a": "Más fácil que escribir",
    "how.title.b": "a mano",
    "how.s1.t": "Personaliza",
    "how.s1.d": "Elige fotos, escribe tu mensaje, arma tu banda sonora.",
    "how.s2.t": "Previsualiza",
    "how.s2.d": "Mira exactamente lo que recibirá.",
    "how.s3.t": "Envía el enlace",
    "how.s3.d": "Compártelo por WhatsApp, email o imprime un QR.",
    "lang.label": "Idioma",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chronelo.lang") as Lang | null;
      if (saved === "pt" || saved === "en" || saved === "es") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("chronelo.lang", l); } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = l === "pt" ? "pt-BR" : l;
    }
  };

  const t = (k: string) => translations[lang][k] ?? translations.pt[k] ?? k;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) return { lang: "pt" as Lang, setLang: () => {}, t: (k: string) => translations.pt[k] ?? k };
  return ctx;
}
