"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Video YouTube yang pemutarnya baru dimuat setelah diklik. Sebelum itu hanya
 * gambar pratinjau yang diunduh, jadi pengunjung yang tidak menonton tidak ikut
 * memuat skrip dan cookie YouTube.
 */
export function YoutubeFacade({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Putar video: ${title}`}
      className="group relative block aspect-video w-full"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
      <span className="group-hover:bg-primary absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors">
        <Play className="ml-0.5 h-6 w-6" aria-hidden />
      </span>
    </button>
  );
}
