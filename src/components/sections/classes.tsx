"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Youtube,
  PlayCircle,
  ExternalLink,
  ArrowRight,
  Video,
  X,
  Loader2,
} from "lucide-react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { ClassItem } from "@/lib/data";
import {
  getYouTubeThumbnailUrl,
  getYouTubeEmbedUrl,
  getYouTubeWatchUrl,
  resolveClasses,
} from "@/lib/data";

function ClassesSkeleton() {
  return (
    <section id="classes" className="py-24 bg-muted/30 relative border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col items-center gap-4 mb-16">
          <div className="h-7 w-36 bg-muted animate-pulse rounded-full" />
          <div className="h-12 w-56 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClassesSection() {
  const { data: classes, loading } = useFirestoreCollection<ClassItem>("classes");
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedClass(null);
      }
    };
    if (selectedClass) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedClass]);

  if (loading) return <ClassesSkeleton />;

  const items = resolveClasses(classes);
  const previewItems = items.slice(0, 3);

  const handleOpenPlayer = (item: ClassItem) => {
    setIframeLoading(true);
    setSelectedClass(item);
  };

  return (
    <section id="classes" className="py-24 bg-muted/30 relative border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary font-mono cursor-default">
              <Video className="w-3.5 h-3.5" />
              ~/teaching/classes
            </div>
            <h2 className="text-3xl font-bold tracking-tight font-lora sm:text-5xl text-foreground">
              Online Classes
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Lecture recordings, algorithmic problem solving, and computer science tutorial sessions on YouTube.
            </p>
          </div>

          <Link
            href="/classes"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm w-fit cursor-pointer group shrink-0"
          >
            <span>View All ({items.length})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Classes Grid (3 Cards on Homepage) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {previewItems.map((item) => {
            const videoIdentifier = item.videoId || item.url;
            const thumbnailUrl = getYouTubeThumbnailUrl(videoIdentifier, "hq");
            const watchUrl = getYouTubeWatchUrl(videoIdentifier);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col bg-background/50 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden hover:border-[#FF0000]/50 transition-all duration-300 shadow-sm hover:shadow-[#FF0000]/5 hover:-translate-y-1"
              >
                {/* Visual Thumbnail Area */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted/40 border-b border-border/40">
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Youtube className="w-10 h-10 stroke-1 text-[#FF0000]" />
                      <span className="text-xs font-mono">Video Lecture</span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenPlayer(item)}
                      className="px-4 py-2 rounded-full bg-[#FF0000] text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Watch Video
                    </button>
                    <a
                      href={watchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-full bg-background/90 text-foreground hover:bg-background hover:text-[#FF0000] transition-colors shadow-lg cursor-pointer"
                      title="Open on YouTube"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20">
                        YouTube Lecture
                      </span>
                    </div>

                    <h3 className="font-bold text-foreground font-lora text-base leading-snug group-hover:text-[#FF0000] transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenPlayer(item)}
                      className="font-semibold text-[#FF0000] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Watch Video
                    </button>

                    <a
                      href={watchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive YouTube Video Modal */}
      {selectedClass && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedClass(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-background border border-border/70 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border/50 flex items-center justify-between gap-4 bg-muted/20">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#FF0000]/10 text-[#FF0000]">
                    YouTube Lecture
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold font-lora text-foreground truncate">
                  {selectedClass.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getYouTubeWatchUrl(selectedClass.videoId || selectedClass.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-accent text-foreground transition-colors cursor-pointer"
                  title="Open on YouTube"
                >
                  <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
                  <span>Open YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedClass(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Iframe Player */}
            <div className="relative w-full aspect-video bg-black">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-xs font-mono">Loading YouTube player...</span>
                </div>
              )}
              <iframe
                src={getYouTubeEmbedUrl(selectedClass.videoId || selectedClass.url)}
                title={selectedClass.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
