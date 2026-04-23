import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Image } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

async function detectImageType(file: File): Promise<string | null> {
  const buf = await file.slice(0, 12).arrayBuffer();
  const b = new Uint8Array(buf);
  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  // GIF: 47 49 46
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  // WEBP: RIFF....WEBP
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return "image/webp";
  return null;
}

interface UploadDialogProps {
  onUploaded: () => void;
}

export function UploadDialog({ onUploaded }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 5MB.");
      e.target.value = "";
      return;
    }

    const detected = await detectImageType(f);
    if (!detected || !ALLOWED_MIME_TYPES.includes(detected)) {
      setError("Invalid file. Only JPEG, PNG, GIF, or WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setError(null);

    // Backstop guards before upload
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }
    const detected = await detectImageType(file);
    if (!detected || !ALLOWED_MIME_TYPES.includes(detected)) {
      setError("Invalid file. Only JPEG, PNG, GIF, or WEBP images are allowed.");
      return;
    }

    setUploading(true);
    try {
      const extMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
      };
      const path = `${crypto.randomUUID()}.${extMap[detected]}`;

      const { error: uploadError } = await supabase.storage
        .from("mustache-uploads")
        .upload(path, file, { contentType: detected });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("mustache-uploads")
        .getPublicUrl(path);

      const { error: insertError } = await supabase.from("mustaches").insert({
        title: title.trim(),
        submitter_name: name.trim() || "Anonymous",
        image_url: urlData.publicUrl,
      });

      if (insertError) throw insertError;

      setTitle("");
      setName("");
      setFile(null);
      setPreview(null);
      setOpen(false);
      onUploaded();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="upload" size="default">
          <Upload className="size-4" />
          UPLOAD WARRIOR
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-sticker-white border-4 border-vinyl-black shadow-[8px_8px_0px_0px] shadow-vinyl-black font-mono max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-tighter text-vinyl-black">
            Submit Your Lip Lore
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div
            className="relative aspect-square border-4 border-dashed border-vinyl-black/30 flex items-center justify-center cursor-pointer hover:border-vinyl-black transition-colors overflow-hidden bg-vinyl-black/5"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-vinyl-black text-neon-lime p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <div className="text-center text-vinyl-black/50">
                <Image className="size-12 mx-auto mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  Drop your stache here
                </p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-vinyl-black">
              Mustache Name *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="THE IRON HANDLEBAR"
              className="border-2 border-vinyl-black bg-transparent font-bold uppercase placeholder:text-vinyl-black/30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-vinyl-black">
              Your Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ANONYMOUS"
              className="border-2 border-vinyl-black bg-transparent font-bold uppercase placeholder:text-vinyl-black/30"
            />
          </div>

          <Button
            type="submit"
            variant="strike"
            size="lg"
            className="w-full"
            disabled={uploading || !file || !title.trim()}
          >
            {uploading ? "DEPLOYING..." : "ENTER THE ARENA"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
