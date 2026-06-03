import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getPublicGift } from "@/lib/gifts.functions";
import { CartaGift, type CartaData } from "@/components/gifts/CartaGift";
import { MusicaGift, type MusicaData } from "@/components/gifts/MusicaGift";
import { MomentosGift, type MomentosData } from "@/components/gifts/MomentosGift";
import { MapaGift, type MapaData } from "@/components/gifts/MapaGift";

const giftQuery = (slug: string) =>
  queryOptions({
    queryKey: ["gift", slug],
    queryFn: () => getPublicGift({ data: { slug } }),
  });

export const Route = createFileRoute("/g/$slug")({
  loader: async ({ params, context }) => {
    const g = await context.queryClient.ensureQueryData(giftQuery(params.slug));
    if (!g) throw notFound();
    return g;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — Love Link` : "Love Link" },
      { name: "description", content: "Você recebeu um presente do Love Link 💌" },
      { property: "og:title", content: loaderData?.title ?? "Love Link" },
      { property: "og:description", content: "Toque para abrir o seu presente." },
      { property: "og:type", content: "article" },
    ],
  }),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-8 text-center">
      <div>
        <h1 className="font-display text-4xl text-plum">Presente não encontrado</h1>
        <p className="mt-2 text-muted-foreground">Confira o link e tente novamente.</p>
      </div>
    </div>
  ),
  component: PublicGift,
});

function PublicGift() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(giftQuery(slug));
  if (!data) return null;
  const payload = data.data as Record<string, unknown>;
  if (data.type === "carta") return <CartaGift title={data.title} data={payload as unknown as CartaData} />;
  if (data.type === "musica") return <MusicaGift title={data.title} data={payload as unknown as MusicaData} />;
  if (data.type === "momentos") return <MomentosGift title={data.title} data={payload as unknown as MomentosData} />;
  if (data.type === "mapa") return <MapaGift title={data.title} data={payload as unknown as MapaData} />;
  return null;
}
