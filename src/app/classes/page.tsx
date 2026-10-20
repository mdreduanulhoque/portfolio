"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { ClassItem } from "@/lib/data";
import {
  fallbackClasses,
  getYouTubeThumbnailUrl,
  getYouTubeEmbedUrl,
  getYouTubeWatchUrl,
} from "@/lib/data";
import {
  ArrowLeft,
  Youtube,
  PlayCircle,
  ExternalLink,
  Search,
  X,
  Loader2,
  Video,
} from "lucide-react";

export default function ClassesPage() {
  const { data: classesFromDb, loading } = useFirestoreCollection<ClassItem>("classes");

  // Video Player Modal state
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Close modal on Escape key
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

  // Determine active classes
  const allClasses = useMemo(() => {
    if (classesFromDb && classesFromDb.length > 0) {
      return [...classesFromDb].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return fallbackClasses;
  }, [classesFromDb]);

  // Filtered classes based on search
  const filteredClasses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allClasses;
    return allClasses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
    );
  }, [allClasses, searchQuery]);

  const handleOpenPlayer = (item: ClassItem) => {
    setIframeLoading(true);
    setSelectedClass(item);
  };

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Back to Home Link */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Portfolio</span>
        </Link>
      </div>

      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border/40 pb-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary font-mono">
            <Video className="w-3.5 h-3.5" />
            ~/teaching/classes
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-lora text-foreground tracking-tight">
            Online Classes & Problem Solving
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Lecture recordings, algorithmic problem solving, and computer science tutorial sessions on YouTube.
          </p>
        </div>

        <a
          href="https://www.youtube.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-mono font-medium rounded-xl border border-border/70 bg-card hover:bg-accent text-foreground transition-all duration-200 shadow-sm shrink-0 w-fit cursor-pointer group"
        >
          <Youtube className="w-4 h-4 text-[#FF0000] group-hover:scale-110 transition-transform" />
          <span>YouTube Channel</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </a>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classes by topic, keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/70 bg-card/50 backdrop-blur-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-muted/30 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl">
          <p className="text-sm font-mono text-muted-foreground">No classes found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredClasses.map((item) => {
            const videoIdentifier = item.videoId || item.url;
            const thumbnailUrl = getYouTubeThumbnailUrl(videoIdentifier, "hq");
            const watchUrl = getYouTubeWatchUrl(videoIdentifier);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col bg-background/50 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden hover:border-[#FF0000]/50 transition-all duration-300 shadow-sm hover:shadow-[#FF0000]/5 hover:-translate-y-1"
              >
                {/* Thumbnail Area */}
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

                    <h2 className="font-bold text-foreground font-lora text-base leading-snug group-hover:text-[#FF0000] transition-colors line-clamp-2">
                      {item.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
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
      )}

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

            {/* Modal Description */}
            {selectedClass.description && (
              <div className="p-4 sm:p-5 bg-card/40 border-t border-border/40 text-xs sm:text-sm text-muted-foreground max-h-32 overflow-y-auto">
                <p className="leading-relaxed">{selectedClass.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
