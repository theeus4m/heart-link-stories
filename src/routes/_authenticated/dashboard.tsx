import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Music, Sparkles, Plus, Copy, Trash2, ExternalLink, MapPin, Gift } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { listMyGifts, deleteGift } from "@/lib/gifts.functions";
import { toast } from "sonner";

const giftsQuery = queryOptions({
  queryKey: ["my-gifts"],
  queryFn: () => listMyGifts(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(giftsQuery),
  head: () => ({ meta: [{ title: "Meus presentes — Chronelo" }] }),
  errorComponent: ({ error }) => <div className="p-8">Erro: {error.message}</div>,
  component: Dashboard,
});

const TYPE_META = {
  bundle: { icon: Gift, label: "Presente Completo (4 em 1)" },
  carta: { icon: Mail, label: "Carta Romântica" },
  musica: { icon: Music, label: "Nossa Mixtape" },
  momentos: { icon: Sparkles, label: "Nossos Momentos" },
  mapa: { icon: MapPin, label: "Mapa do Amor" },
} as const;

function Dashboard() {
  const { data } = useSuspenseQuery(giftsQuery);
  const router = useRouter();
  const del = useServerFn(deleteGift);

  async function copy(slug: string) {
    const url = `${window.location.origin}/g/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }
  async function remove(id: string) {
    if (!confirm("Excluir este presente?")) return;
    await del({ data: { id } });
    toast.success("Presente removido");
    router.invalidate();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-violet">Sua coleção</p>
            <h1 className="mt-2 font-display text-4xl text-plum">Meus presentes</h1>
          </div>
        </div>

        {/* Featured bundle */}
        <Link
          to="/criar/$type"
          params={{ type: "bundle" }}
          className="mt-8 block overflow-hidden rounded-3xl gradient-romance p-8 text-primary-foreground shadow-romance transition hover:opacity-95"
        >
          <div className="flex flex-wrap items-center gap-6">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 backdrop-blur">
              <Gift className="h-8 w-8" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.3em] opacity-80">Recomendado</p>
              <h2 className="mt-1 font-display text-3xl">Presente Completo — 4 em 1</h2>
              <p className="mt-1 text-sm opacity-90">
                Carta, Mixtape, Momentos e Mapa do Amor em um único link. Quem recebe escolhe por onde começar.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-plum">
              <Plus className="h-4 w-4" /> Criar agora
            </span>
          </div>
        </Link>

        {/* Individual gift cards */}
        <p className="mt-8 text-sm uppercase tracking-widest text-violet">Ou crie presentes individuais</p>
        <section className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(["carta", "musica", "momentos", "mapa"] as const).map((t) => {
            const M = TYPE_META[t];
            return (
              <Link
                key={t}
                to="/criar/$type"
                params={{ type: t }}
                className="group rounded-2xl border border-dashed border-violet/40 bg-card p-6 transition hover:border-coral hover:shadow-romance"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl gradient-romance text-white">
                    <M.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-lg text-plum">{M.label}</span>
                </div>
                <p className="mt-3 inline-flex items-center gap-1 text-sm text-coral">
                  <Plus className="h-4 w-4" /> Criar novo
                </p>
              </Link>
            );
          })}
        </section>


        <h2 className="mt-12 font-display text-2xl text-plum">Histórico</h2>
        {data.length === 0 ? (
          <p className="mt-4 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Você ainda não criou nenhum presente. Que tal começar pela carta? 💌
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.map((g) => {
              const M = TYPE_META[g.type as keyof typeof TYPE_META];
              return (
                <li
                  key={g.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl gradient-romance text-white">
                    <M.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg text-plum">{g.title}</p>
                    <p className="text-xs text-muted-foreground">{M.label} · /g/{g.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(g.slug)}>
                      <Copy className="h-3.5 w-3.5" /> Copiar link
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/g/${g.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" /> Abrir
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(g.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
