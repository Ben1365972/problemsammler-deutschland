"use client";
import { useState } from "react";

export function ShareButtons({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-stone-500">Teilen:</span>
      <a
        className="btn-secondary text-xs"
        href={`https://api.whatsapp.com/send?text=${t}%20${u}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
      <a
        className="btn-secondary text-xs"
        href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        X / Twitter
      </a>
      <a
        className="btn-secondary text-xs"
        href={`https://www.facebook.com/sharer/sharer.php?u=${u}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </a>
      <a
        className="btn-secondary text-xs"
        href={`mailto:?subject=${t}&body=${u}`}
      >
        Email
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="btn-secondary text-xs"
      >
        {copied ? "✓ kopiert" : "Link kopieren"}
      </button>
    </div>
  );
}
