import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Music, Sparkles, Plus, Copy, Trash2, ExternalLink, MapPin } from "lucide-react";
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
  head: () => ({ meta: [{ title: "Meus presentes — Love Link" }] }),
  errorComponent: ({ error }) => <div className="p-8">Erro: {error.message}</div>,
  component: Dashboard,
});

const TYPE_META = {
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

        {/* Create cards */}
        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(TYPE_META) as Array<keyof typeof TYPE_META>).map((t) => {
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
