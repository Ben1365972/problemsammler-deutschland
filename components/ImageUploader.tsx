"use client";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ImageUploader({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ALLOWED.includes(file.type)) {
      setError("Nur JPG, PNG, WebP oder GIF erlaubt.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Bild zu gross — max. 8 MB.");
      return;
    }
    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      onChange(blob.url);
    } catch (err: any) {
      setError(err.message || "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="label">Bild (optional)</label>
      {value ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Vorschau"
            className="max-h-64 w-full rounded-lg border border-stone-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled || uploading}
            className="btn-secondary text-xs"
          >
            Bild entfernen
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED.join(",")}
            disabled={disabled || uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200"
          />
          {uploading && <p className="text-xs text-stone-500">Lade hoch …</p>}
          <p className="text-xs text-stone-500">
            JPG / PNG / WebP / GIF, max. 8 MB.
          </p>
        </div>
      )}
      {error && (
        <p className="mt-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
