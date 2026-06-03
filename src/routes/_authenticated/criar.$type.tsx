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
import { PhotoUploader, resolvePhotoUrls } from "@/components/PhotoUploader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VALID = ["carta", "musica", "momentos"] as const;
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
    title: "Nossa música",
    data: {
      coupleNames: "Ana & João",
      startDate: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      songTitle: "Perfect",
      songArtist: "Ed Sheeran",
      songUrl: "",
      coverUrl: "",
      message: "Toda vez que essa toca, eu lembro de você.",
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
      const row = await create({ data: { type, title, data } });
      toast.success("Presente criado!");
      navigate({ to: "/dashboard" });
      // copy link
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
        </h1>
        <p className="mt-1 text-muted-foreground">Personalize cada detalhe. Você poderá editar a qualquer momento.</p>

        <div className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6">
          <Field label="Título do presente">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </Field>

          {type === "carta" && <CartaFields data={data} set={setData} />}
          {type === "musica" && <MusicaFields data={data} set={setData} />}
          {type === "momentos" && <MomentosFields data={data} set={setData} />}
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
      <Field label="Fotos (URLs) — até 6">
        <div className="space-y-2">
          {(data.photos ?? []).map((url, i) => (
            <Input
              key={i}
              placeholder="https://…"
              value={url}
              onChange={(e) => {
                const next = [...(data.photos ?? [])];
                next[i] = e.target.value;
                set({ ...data, photos: next });
              }}
            />
          ))}
          {(data.photos?.length ?? 0) < 6 && (
            <Button type="button" variant="outline" size="sm" onClick={() => set({ ...data, photos: [...(data.photos ?? []), ""] })}>
              <Plus className="h-3.5 w-3.5" /> Adicionar foto
            </Button>
          )}
        </div>
      </Field>
      <Field label="Música (link Spotify, opcional)">
        <Input placeholder="https://open.spotify.com/track/…" value={data.song ?? ""} onChange={(e) => set({ ...data, song: e.target.value })} />
      </Field>
    </>
  );
}

function MusicaFields({ data, set }: { data: MusicaData; set: (d: MusicaData) => void }) {
  return (
    <>
      <Field label="Nomes do casal">
        <Input value={data.coupleNames} onChange={(e) => set({ ...data, coupleNames: e.target.value })} />
      </Field>
      <Field label="Início do relacionamento">
        <Input type="date" value={data.startDate} onChange={(e) => set({ ...data, startDate: e.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Música"><Input value={data.songTitle} onChange={(e) => set({ ...data, songTitle: e.target.value })} /></Field>
        <Field label="Artista"><Input value={data.songArtist} onChange={(e) => set({ ...data, songArtist: e.target.value })} /></Field>
      </div>
      <Field label="Link da música (Spotify)">
        <Input placeholder="https://open.spotify.com/track/…" value={data.songUrl ?? ""} onChange={(e) => set({ ...data, songUrl: e.target.value })} />
      </Field>
      <Field label="Capa (URL da imagem)">
        <Input placeholder="https://…" value={data.coverUrl ?? ""} onChange={(e) => set({ ...data, coverUrl: e.target.value })} />
      </Field>
      <Field label="Mensagem especial">
        <Textarea rows={3} value={data.message ?? ""} onChange={(e) => set({ ...data, message: e.target.value })} />
      </Field>
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
                <Input placeholder="URL da foto (opcional)" value={m.photo ?? ""}
                  onChange={(e) => { const arr = [...data.moments]; arr[i] = { ...arr[i], photo: e.target.value }; set({ ...data, moments: arr }); }} />
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
