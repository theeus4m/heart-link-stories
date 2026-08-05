import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { getPublicGift } from "@/lib/gifts.functions";
import type { CartaData } from "@/components/gifts/CartaGift";
import type { MusicaData } from "@/components/gifts/MusicaGift";
import type { MomentosData } from "@/components/gifts/MomentosGift";
import type { MapaData } from "@/components/gifts/MapaGift";
import type { BundleData } from "@/components/gifts/BundleGift";

const CartaGift = lazy(() => import("@/components/gifts/CartaGift").then((module) => ({ default: module.CartaGift })));
const MusicaGift = lazy(() => import("@/components/gifts/MusicaGift").then((module) => ({ default: module.MusicaGift })));
const MomentosGift = lazy(() => import("@/components/gifts/MomentosGift").then((module) => ({ default: module.MomentosGift })));
const MapaGift = lazy(() => import("@/components/gifts/MapaGift").then((module) => ({ default: module.MapaGift })));
const BundleGift = lazy(() => import("@/components/gifts/BundleGift").then((module) => ({ default: module.BundleGift })));

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
      { title: loaderData ? `${loaderData.title} — Chronelo` : "Chronelo" },
      { name: "description", content: "Você recebeu um presente do Chronelo 💌" },
      { property: "og:title", content: loaderData?.title ?? "Chronelo" },
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
  let gift: React.ReactNode = null;
  if (data.type === "carta") gift = <CartaGift title={data.title} data={payload as unknown as CartaData} />;
  if (data.type === "musica") gift = <MusicaGift title={data.title} data={payload as unknown as MusicaData} />;
  if (data.type === "momentos") gift = <MomentosGift title={data.title} data={payload as unknown as MomentosData} />;
  if (data.type === "mapa") gift = <MapaGift title={data.title} data={payload as unknown as MapaData} />;
  if (data.type === "bundle") gift = <BundleGift title={data.title} data={payload as unknown as BundleData} />;
  return <Suspense fallback={<GiftLoading />}>{gift}</Suspense>;
}

function GiftLoading() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-plum text-cream">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-pulse rounded-full border border-gold/50 bg-gold/10" />
        <p className="mt-4 text-xs uppercase tracking-[0.35em] text-gold">Preparando seu presente</p>
      </div>
    </div>
  );
}
