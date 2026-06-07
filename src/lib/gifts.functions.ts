import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const giftTypeSchema = z.enum(["carta", "musica", "momentos", "mapa", "bundle"]);

function makeSlug() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
}

export const createGift = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        type: giftTypeSchema,
        title: z.string().trim().min(1).max(120),
        data: z.record(z.string(), z.any()),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const slug = makeSlug();
    const { data: row, error } = await supabase
      .from("gifts")
      .insert({ user_id: userId, slug, type: data.type, title: data.title, data: data.data })
      .select("id, slug, type, title, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateGift = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().trim().min(1).max(120),
        data: z.record(z.string(), z.any()),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("gifts")
      .update({ title: data.title, data: data.data })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyGifts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("gifts")
      .select("id, slug, type, title, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteGift = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("gifts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function signPath(admin: any, path: string): Promise<string> {
  if (!path) return path;
  if (path.startsWith("http")) return path;
  const { data } = await admin.storage.from("gift-photos").createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? "";
}

async function resolveGiftPhotos(admin: any, type: string, data: any) {
  if (!data || typeof data !== "object") return data;
  const next = { ...data };
  if (type === "carta" && Array.isArray(next.photos)) {
    next.photos = await Promise.all(next.photos.map((p: string) => signPath(admin, p)));
  }
  if (type === "momentos" && Array.isArray(next.moments)) {
    next.moments = await Promise.all(
      next.moments.map(async (m: any) => ({ ...m, photo: m?.photo ? await signPath(admin, m.photo) : "" })),
    );
  }
  if (type === "musica" && typeof next.coverUrl === "string") {
    next.coverUrl = await signPath(admin, next.coverUrl);
  }
  if (type === "mapa" && typeof next.photo === "string") {
    next.photo = await signPath(admin, next.photo);
  }
  if (type === "bundle") {
    if (next.carta) next.carta = await resolveGiftPhotos(admin, "carta", next.carta);
    if (next.musica) next.musica = await resolveGiftPhotos(admin, "musica", next.musica);
    if (next.momentos) next.momentos = await resolveGiftPhotos(admin, "momentos", next.momentos);
    if (next.mapa) next.mapa = await resolveGiftPhotos(admin, "mapa", next.mapa);
  }
  return next;
}

export const getPublicGift = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(3).max(40) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("gifts")
      .select("slug, type, title, data, created_at")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const resolved = await resolveGiftPhotos(supabaseAdmin, row.type, row.data);
    return { ...row, data: resolved };
  });
