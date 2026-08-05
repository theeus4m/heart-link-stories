import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];
const signedUrlCache = new Map<string, Promise<string | null>>();
const pendingUploads = new Map<string, Promise<string | null>>();

export type PhotoUploaderProps = {
  value: string[]; // array of storage paths (e.g. "uid/abc.jpg") or empty strings
  onChange: (next: string[]) => void;
  max?: number;
  aspect?: "square" | "video";
};

async function getSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  const cached = signedUrlCache.get(path);
  if (cached) return cached;
  const request = supabase.storage
    .from("gift-photos")
    .createSignedUrl(path, 60 * 60)
    .then(({ data }) => data?.signedUrl ?? null)
    .catch(() => null);
  signedUrlCache.set(path, request);
  return request;
}

async function optimizePhoto(file: File): Promise<Blob> {
  if (file.type === "image/gif" || file.type === "image/heic" || file.size < 700_000) return file;
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1920;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const optimized = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.84),
  );
  return optimized && optimized.size < file.size ? optimized : file;
}

async function uploadPhoto(file: File, uid: string): Promise<string | null> {
  const optimized = await optimizePhoto(file).catch(() => file);
  const useWebp = optimized.type === "image/webp" && file.type !== "image/gif";
  const ext = useWebp ? "webp" : file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${uid}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("gift-photos").upload(path, optimized, {
    contentType: optimized.type || file.type,
    upsert: false,
  });
  return error ? null : path;
}

function PhotoThumb({ path, onRemove }: { path: string; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getSignedUrl(path).then((u) => active && setUrl(u));
    return () => {
      active = false;
    };
  }, [path]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" decoding="async" />
      ) : (
        <div className="grid h-full w-full place-items-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
        aria-label="Remover foto"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function PhotoUploader({ value, onChange, max = 6 }: PhotoUploaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const filled = value.filter(Boolean);
  const slotsLeft = Math.max(0, max - filled.length);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).slice(0, slotsLeft);
    if (list.length === 0) {
      toast.error(`Você já atingiu o limite de ${max} fotos.`);
      return;
    }

    const valid = list.filter((file) => {
      if (!ACCEPTED.includes(file.type)) {
        toast.error(`Formato não suportado: ${file.name}`);
        return false;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} é maior que 5MB.`);
        return false;
      }
      return true;
    });
    if (valid.length === 0) return;

    const previews = valid.map((file) => URL.createObjectURL(file));
    onChange([...filled, ...previews]);
    setUploading(true);
    try {
      const { data: session } = await supabase.auth.getUser();
      const uid = session.user?.id;
      if (!uid) {
        toast.error("Sessão expirada. Faça login novamente.");
        previews.forEach((preview) => URL.revokeObjectURL(preview));
        return;
      }

      const requests = valid.map((file) => uploadPhoto(file, uid));
      previews.forEach((preview, index) => pendingUploads.set(preview, requests[index]));
      const uploaded = (await Promise.all(requests)).filter((path): path is string => Boolean(path));
      if (uploaded.length < valid.length) toast.error("Algumas fotos não puderam ser enviadas.");
      if (uploaded.length) toast.success(`${uploaded.length} foto(s) enviadas`);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
      if (cameraInput.current) cameraInput.current.value = "";
    }
  }

  async function removeAt(index: number) {
    const path = filled[index];
    const next = filled.filter((_, i) => i !== index);
    onChange(next);
    if (path?.startsWith("blob:")) {
      const uploadedPath = await pendingUploads.get(path);
      pendingUploads.delete(path);
      URL.revokeObjectURL(path);
      if (uploadedPath) await supabase.storage.from("gift-photos").remove([uploadedPath]);
    } else if (path && !path.startsWith("http")) {
      signedUrlCache.delete(path);
      await supabase.storage.from("gift-photos").remove([path]);
    }
  }

  return (
    <div className="space-y-3">
      {filled.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {filled.map((path, i) => (
            <PhotoThumb key={path + i} path={path} onRemove={() => removeAt(i)} />
          ))}
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || slotsLeft === 0}
          onClick={() => fileInput.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Enviar do dispositivo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || slotsLeft === 0}
          onClick={() => cameraInput.current?.click()}
          className="sm:hidden"
        >
          <Camera className="h-4 w-4" /> Tirar foto
        </Button>
        <span className="self-center text-xs text-muted-foreground">
          {filled.length}/{max} fotos · até 5MB cada
        </span>
      </div>

      {filled.length === 0 && !uploading && (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <ImagePlus className="mx-auto mb-2 h-6 w-6 opacity-60" />
          Toque em <strong>Enviar do dispositivo</strong> para adicionar fotos da galeria
          {" "}
          <span className="sm:hidden">ou em <strong>Tirar foto</strong> para usar a câmera</span>.
        </div>
      )}
    </div>
  );
}

// Helper to resolve a list of paths to displayable URLs (signed).
export async function resolvePhotoUrls(paths: string[]): Promise<string[]> {
  const results = await Promise.all(paths.filter(Boolean).map((p) => getSignedUrl(p)));
  return results.filter((u): u is string => !!u);
}

export async function settlePhotoUploads<T>(value: T): Promise<T> {
  if (typeof value === "string" && value.startsWith("blob:")) {
    const path = await pendingUploads.get(value);
    if (!path) throw new Error("Não foi possível concluir o envio de uma foto.");
    return path as T;
  }
  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => settlePhotoUploads(item))) as T;
  }
  if (value && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value as Record<string, unknown>).map(async ([key, item]) => [key, await settlePhotoUploads(item)]),
    );
    return Object.fromEntries(entries) as T;
  }
  return value;
}
