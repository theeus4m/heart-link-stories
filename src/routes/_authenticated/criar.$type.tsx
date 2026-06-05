import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Eye, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGift } from "@/lib/gifts.functions";
import { CartaGift, type CartaData } from "@/components/gifts/CartaGift";
import { MusicaGift, type MusicaData } from "@/components/gifts/MusicaGift";
import { MomentosGift, type MomentosData } from "@/components/gifts/MomentosGift";
import { MapaGift, type MapaData } from "@/components/gifts/MapaGift";
import { PhotoUploader, resolvePhotoUrls } from "@/components/PhotoUploader";
import { geocodeCity } from "@/lib/geocode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VALID = ["carta", "musica", "momentos", "mapa"] as const;
type GiftType = (typeof VALID)[number];

export const Route = createFileRoute("/_authenticated/criar/$type")({
  beforeLoad: ({ params }) => {
    if (!VALID.includes(params.type as GiftType)) throw notFound();
  },
  head: () => ({ meta: [{ title: "Criar presente — Love Link" }] }),
  component: Editor,
});

const DEFAULTS: Record<GiftType, { title: string; data: any }> = {
  carta: {
    title: "Para você, meu amor",
    data: {
      recipient: "Meu amor",
      message: "Cada dia ao seu lado é um presente.\nEu te escolho — hoje e sempre.",
      signature: "Com todo meu amor",
      photos: [] as string[],
      song: "",
    } as CartaData,
  },
  musica: {
    title: "As músicas que me fazem lembrar de você ❤️",
    data: {
      mixtapeName: "As músicas que me fazem lembrar de você ❤️",
      coupleNames: "Ana & João",
      createdDate: new Date().toISOString().slice(0, 10),
      coverUrl: "",
      message: "Cada música desta fita guarda um momento que vivi ao seu lado.",
      tracks: [
        { url: "", title: "", artist: "" },
      ],
    } as MusicaData,
  },
  momentos: {
    title: "Nossa história",
    data: {
      intro: "Tudo começou em um dia comum…",
      moments: [
        { date: "2023-01-12", title: "O primeiro 'oi'", caption: "Era para ser só uma conversa…", photo: "" },
        { date: "2023-06-04", title: "Primeiro encontro", caption: "Meu coração não parava.", photo: "" },
      ],
      outro: "E daqui pra frente é só você e eu.",
    } as MomentosData,
  },
  mapa: {
    title: "Nosso mapa do amor",
    data: {
      coupleNames: "Ana & João",
      startDate: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      personA: { name: "Ana", city: "São Paulo, Brasil" },
      personB: { name: "João", city: "Lisboa, Portugal" },
      photo: "",
      message: "Mesmo separados por {km} km, meu coração está sempre ao seu lado.",
      themeColor: "#f47975",
      finalMessage: "Eu te amo — em qualquer lugar do mundo.",
    } as MapaData,
  },
};

function Editor() {
  const { type } = Route.useParams() as { type: GiftType };
  const navigate = useNavigate();
  const create = useServerFn(createGift);
  const [title, setTitle] = useState(DEFAULTS[type].title);
  const [data, setData] = useState<any>(DEFAULTS[type].data);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  async function save() {
    setSaving(true);
    try {
      let payload = data;
      // Geocode cities on the Mapa gift if coords are missing
      if (type === "mapa") {
        const d = { ...data } as MapaData;
        const needA = d.personA?.city && (typeof d.personA.lat !== "number" || typeof d.personA.lng !== "number");
        const needB = d.personB?.city && (typeof d.personB.lat !== "number" || typeof d.personB.lng !== "number");
        if (needA) {
          const r = await geocodeCity(d.personA.city);
          if (r) d.personA = { ...d.personA, ...r };
        }
        if (needB) {
          const r = await geocodeCity(d.personB.city);
          if (r) d.personB = { ...d.personB, ...r };
        }
        payload = d;
        setData(d);
      }
      const row = await create({ data: { type, title, data: payload } });
      toast.success("Presente criado!");
      navigate({ to: "/dashboard" });
      await navigator.clipboard.writeText(`${window.location.origin}/g/${row.slug}`);
      toast.success("Link copiado para você compartilhar 💌");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  if (preview) {
    return (
      <div>
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-5 py-3 backdrop-blur">
          <Button variant="ghost" size="sm" onClick={() => setPreview(false)}>
            <ArrowLeft className="h-4 w-4" /> Voltar a editar
          </Button>
          <Button size="sm" className="gradient-romance border-0 text-primary-foreground" onClick={save} disabled={saving}>
            {saving ? "Salvando…" : "Publicar e gerar link"}
          </Button>
        </div>
        <ResolvedPreview type={type} title={title} data={data} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-plum">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="mt-3 font-display text-4xl text-plum">
          {type === "carta" && "Carta Romântica"}
          {type === "musica" && "Nossa Música"}
          {type === "momentos" && "Nossos Momentos"}
          {type === "mapa" && "Mapa do Amor"}
        </h1>
        <p className="mt-1 text-muted-foreground">Personalize cada detalhe. Você poderá editar a qualquer momento.</p>

        <div className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6">
          <Field label="Título do presente">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </Field>

          {type === "carta" && <CartaFields data={data} set={setData} />}
          {type === "musica" && <MusicaFields data={data} set={setData} />}
          {type === "momentos" && <MomentosFields data={data} set={setData} />}
          {type === "mapa" && <MapaFields data={data} set={setData} />}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={() => setPreview(true)}>
            <Eye className="h-4 w-4" /> Pré-visualizar
          </Button>
          <Button onClick={save} disabled={saving} className="gradient-romance border-0 text-primary-foreground shadow-romance">
            <Sparkles className="h-4 w-4" /> {saving ? "Salvando…" : "Publicar e gerar link"}
          </Button>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function CartaFields({ data, set }: { data: CartaData; set: (d: CartaData) => void }) {
  return (
    <>
      <Field label="Para quem">
        <Input value={data.recipient} onChange={(e) => set({ ...data, recipient: e.target.value })} />
      </Field>
      <Field label="Mensagem">
        <Textarea rows={6} value={data.message} onChange={(e) => set({ ...data, message: e.target.value })} />
      </Field>
      <Field label="Assinatura">
        <Input value={data.signature} onChange={(e) => set({ ...data, signature: e.target.value })} />
      </Field>
      <Field label="Fotos — até 6">
        <PhotoUploader
          value={data.photos ?? []}
          onChange={(photos) => set({ ...data, photos })}
          max={6}
        />
      </Field>
      <Field label="Música (link Spotify, opcional)">
        <Input placeholder="https://open.spotify.com/track/…" value={data.song ?? ""} onChange={(e) => set({ ...data, song: e.target.value })} />
      </Field>
    </>
  );
}

function MusicaFields({ data, set }: { data: MusicaData; set: (d: MusicaData) => void }) {
  const tracks = data.tracks ?? [];
  const updateTrack = (i: number, patch: Partial<{ url: string; title: string; artist: string }>) => {
    const arr = [...tracks];
    arr[i] = { ...arr[i], ...patch };
    set({ ...data, tracks: arr });
  };
  return (
    <>
      <Field label="Nome da Mixtape">
        <Input
          value={data.mixtapeName ?? ""}
          placeholder="As músicas que me fazem lembrar de você ❤️"
          onChange={(e) => set({ ...data, mixtapeName: e.target.value })}
        />
      </Field>
      <Field label="Nome do casal">
        <Input value={data.coupleNames} onChange={(e) => set({ ...data, coupleNames: e.target.value })} />
      </Field>
      <Field label="Data de criação">
        <Input
          type="date"
          value={data.createdDate ?? new Date().toISOString().slice(0, 10)}
          onChange={(e) => set({ ...data, createdDate: e.target.value })}
        />
      </Field>
      <Field label="Capa da fita (opcional)">
        <PhotoUploader
          value={data.coverUrl ? [data.coverUrl] : []}
          onChange={(arr) => set({ ...data, coverUrl: arr[0] ?? "" })}
          max={1}
        />
      </Field>
      <Field label="Mensagem especial">
        <Textarea
          rows={3}
          value={data.message ?? ""}
          onChange={(e) => set({ ...data, message: e.target.value })}
        />
      </Field>

      <div>
        <Label className="mb-2 block">Músicas do YouTube — até 5</Label>
        <div className="space-y-3">
          {tracks.map((t, i) => (
            <div key={i} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-violet">Faixa {i + 1}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => set({ ...data, tracks: tracks.filter((_, k) => k !== i) })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                <Input
                  placeholder="https://youtube.com/watch?v=…"
                  value={t.url}
                  onChange={(e) => updateTrack(i, { url: e.target.value })}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Título (opcional)"
                    value={t.title ?? ""}
                    onChange={(e) => updateTrack(i, { title: e.target.value })}
                  />
                  <Input
                    placeholder="Artista (opcional)"
                    value={t.artist ?? ""}
                    onChange={(e) => updateTrack(i, { artist: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
          {tracks.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set({ ...data, tracks: [...tracks, { url: "", title: "", artist: "" }] })}
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar música
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function MomentosFields({ data, set }: { data: MomentosData; set: (d: MomentosData) => void }) {
  return (
    <>
      <Field label="Introdução"><Textarea rows={2} value={data.intro} onChange={(e) => set({ ...data, intro: e.target.value })} /></Field>
      <div>
        <Label className="mb-2 block">Linha do tempo</Label>
        <div className="space-y-4">
          {data.moments.map((m, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-violet">Momento {i + 1}</p>
                <Button type="button" size="sm" variant="ghost"
                  onClick={() => set({ ...data, moments: data.moments.filter((_, k) => k !== i) })}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input type="date" value={m.date}
                    onChange={(e) => { const arr = [...data.moments]; arr[i] = { ...arr[i], date: e.target.value }; set({ ...data, moments: arr }); }} />
                  <Input placeholder="Título" value={m.title}
                    onChange={(e) => { const arr = [...data.moments]; arr[i] = { ...arr[i], title: e.target.value }; set({ ...data, moments: arr }); }} />
                </div>
                <Textarea placeholder="Legenda" rows={2} value={m.caption}
                  onChange={(e) => { const arr = [...data.moments]; arr[i] = { ...arr[i], caption: e.target.value }; set({ ...data, moments: arr }); }} />
                <PhotoUploader
                  value={m.photo ? [m.photo] : []}
                  onChange={(arr) => { const next = [...data.moments]; next[i] = { ...next[i], photo: arr[0] ?? "" }; set({ ...data, moments: next }); }}
                  max={1}
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm"
            onClick={() => set({ ...data, moments: [...data.moments, { date: "", title: "", caption: "", photo: "" }] })}>
            <Plus className="h-3.5 w-3.5" /> Adicionar momento
          </Button>
        </div>
      </div>
      <Field label="Mensagem de encerramento"><Textarea rows={2} value={data.outro} onChange={(e) => set({ ...data, outro: e.target.value })} /></Field>
    </>
  );
}

function ResolvedPreview({ type, title, data }: { type: GiftType; title: string; data: any }) {
  const [resolved, setResolved] = useState<any>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const next: any = { ...data };
      if (type === "carta" && Array.isArray(next.photos)) {
        next.photos = await resolvePhotoUrls(next.photos);
      }
      if (type === "momentos" && Array.isArray(next.moments)) {
        next.moments = await Promise.all(
          next.moments.map(async (m: any) => {
            if (!m?.photo) return { ...m, photo: "" };
            const [url] = await resolvePhotoUrls([m.photo]);
            return { ...m, photo: url ?? "" };
          }),
        );
      }
      if (type === "musica" && next.coverUrl) {
        const [url] = await resolvePhotoUrls([next.coverUrl]);
        next.coverUrl = url ?? "";
      }
      if (type === "mapa" && next.photo) {
        const [url] = await resolvePhotoUrls([next.photo]);
        next.photo = url ?? "";
      }
      if (alive) setResolved(next);
    })();
    return () => { alive = false; };
  }, [type, data]);

  if (!resolved) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (type === "carta") return <CartaGift title={title} data={resolved} />;
  if (type === "musica") return <MusicaGift title={title} data={resolved} />;
  if (type === "mapa") return <MapaGift title={title} data={resolved} />;
  return <MomentosGift title={title} data={resolved} />;
}

function MapaFields({ data, set }: { data: MapaData; set: (d: MapaData) => void }) {
  const updatePerson = (key: "personA" | "personB", patch: Partial<MapaData["personA"]>) =>
    set({ ...data, [key]: { ...data[key], ...patch, lat: undefined, lng: undefined } });

  return (
    <>
      <Field label="Nomes do casal">
        <Input value={data.coupleNames} onChange={(e) => set({ ...data, coupleNames: e.target.value })} />
      </Field>
      <Field label="Início do relacionamento">
        <Input type="date" value={data.startDate} onChange={(e) => set({ ...data, startDate: e.target.value })} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-violet">Pessoa 1</p>
          <div className="mt-3 space-y-3">
            <Input placeholder="Nome" value={data.personA.name}
              onChange={(e) => set({ ...data, personA: { ...data.personA, name: e.target.value } })} />
            <Input placeholder="Cidade, País" value={data.personA.city}
              onChange={(e) => updatePerson("personA", { city: e.target.value })} />
          </div>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-violet">Pessoa 2</p>
          <div className="mt-3 space-y-3">
            <Input placeholder="Nome" value={data.personB.name}
              onChange={(e) => set({ ...data, personB: { ...data.personB, name: e.target.value } })} />
            <Input placeholder="Cidade, País" value={data.personB.city}
              onChange={(e) => updatePerson("personB", { city: e.target.value })} />
          </div>
        </div>
      </div>
      <p className="-mt-1 text-xs text-muted-foreground">
        As coordenadas serão calculadas automaticamente quando você publicar.
      </p>

      <Field label="Foto do casal">
        <PhotoUploader
          value={data.photo ? [data.photo] : []}
          onChange={(arr) => set({ ...data, photo: arr[0] ?? "" })}
          max={1}
        />
      </Field>

      <Field label="Mensagem romântica (use {km} para inserir a distância)">
        <Textarea rows={3} value={data.message}
          onChange={(e) => set({ ...data, message: e.target.value })} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cor do tema">
          <div className="flex items-center gap-3">
            <input type="color" value={data.themeColor || "#f47975"}
              onChange={(e) => set({ ...data, themeColor: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded border border-border bg-transparent" />
            <Input value={data.themeColor || "#f47975"}
              onChange={(e) => set({ ...data, themeColor: e.target.value })} />
          </div>
        </Field>
        <Field label="Mensagem final (ao clicar em Eu Te Amo)">
          <Input value={data.finalMessage ?? ""} onChange={(e) => set({ ...data, finalMessage: e.target.value })} />
        </Field>
      </div>
    </>
  );
}
