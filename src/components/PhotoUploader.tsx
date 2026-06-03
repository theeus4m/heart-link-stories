import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];

export type PhotoUploaderProps = {
  value: string[]; // array of storage paths (e.g. "uid/abc.jpg") or empty strings
  onChange: (next: string[]) => void;
  max?: number;
  aspect?: "square" | "video";
};

async function getSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path; // legacy URLs
  const { data } = await supabase.storage.from("gift-photos").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
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
        <img src={url} alt="" className="h-full w-full object-cover" />
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

    setUploading(true);
    try {
      const { data: session } = await supabase.auth.getUser();
      const uid = session.user?.id;
      if (!uid) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const uploaded: string[] = [];
      for (const file of list) {
        if (!ACCEPTED.includes(file.type)) {
          toast.error(`Formato não suportado: ${file.name}`);
          continue;
        }
        if (file.size > MAX_SIZE) {
          toast.error(`${file.name} é maior que 5MB.`);
          continue;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${uid}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("gift-photos")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) {
          toast.error(`Falha ao enviar ${file.name}`);
          continue;
        }
        uploaded.push(path);
      }

      if (uploaded.length) {
        const next = [...filled, ...uploaded];
        onChange(next);
        toast.success(`${uploaded.length} foto(s) enviadas`);
      }
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
    if (path && !path.startsWith("http")) {
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
