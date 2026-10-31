"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { useFirestoreDoc } from "@/hooks/useFirestoreDoc";
import type { GalleryItem, GallerySettings, DriveBridgeFile } from "@/lib/data";
import {
  getDriveImageFallbackUrls,
  getDriveViewUrl,
  isSafeUrl,
  fetchDriveFolderImages,
  mergeGalleryItems,
} from "@/lib/data";
import {
  Camera,
  ArrowLeft,
  Maximize2,
  X,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  ExternalLink,
} from "lucide-react";

function GalleryCardImage({
  fileIdentifier,
  alt,
}: {
  fileIdentifier: string;
  alt: string;
}) {
  const candidates = useMemo(
    () => getDriveImageFallbackUrls(fileIdentifier, 1000),
    [fileIdentifier]
  );
  const [urlIndex, setUrlIndex] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  const activeSrc = candidates[urlIndex] || "";

  if (!activeSrc || failedAll) {
    return (
      <div className="py-20 px-6 flex flex-col items-center justify-center text-muted-foreground gap-2 bg-muted/40 text-center">
        <ImageIcon className="w-10 h-10 stroke-1 opacity-70" />
        <span className="text-xs font-mono">
          Image unavailable (Check Google Drive &quot;Anyone with link&quot; permission)
        </span>
      </div>
    );
  }

  return (
    <Image
      src={activeSrc}
      alt={alt}
      width={1000}
      height={750}
      referrerPolicy="no-referrer"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="w-full h-auto block group-hover:scale-105 transition-transform duration-500"
      onError={() => {
        if (urlIndex + 1 < candidates.length) {
          setUrlIndex((prev) => prev + 1);
        } else {
          setFailedAll(true);
        }
      }}
    />
  );
}

function LightboxDriveImage({
  fileIdentifier,
  alt,
  onLoaded,
}: {
  fileIdentifier: string;
  alt: string;
  onLoaded: () => void;
}) {
  const candidates = useMemo(
    () => getDriveImageFallbackUrls(fileIdentifier, 1600),
    [fileIdentifier]
  );
  const [urlIndex, setUrlIndex] = useState(0);
  const activeSrc = candidates[urlIndex] || "";

  if (!activeSrc) return null;

  return (
    <Image
      src={activeSrc}
      alt={alt}
      fill
      referrerPolicy="no-referrer"
      sizes="100vw"
      className="object-contain"
      onLoad={onLoaded}
      onError={() => {
        if (urlIndex + 1 < candidates.length) {
          setUrlIndex((prev) => prev + 1);
        } else {
          onLoaded();
        }
      }}
    />
  );
}

export default function GalleryPage() {
  const { data: galleryFromDb, loading: dbLoading } =
    useFirestoreCollection<GalleryItem>("gallery");
  const { data: settings, loading: settingsLoading } =
    useFirestoreDoc<GallerySettings>("gallery_settings", "main");

  const [driveFiles, setDriveFiles] = useState<DriveBridgeFile[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lightboxImageLoading, setLightboxImageLoading] = useState(true);

  const activeBridgeUrl = useMemo(() => {
    return (
      settings?.bridgeUrl?.trim() ||
      process.env.NEXT_PUBLIC_GALLERY_BRIDGE_URL?.trim() ||
      ""
    );
  }, [settings?.bridgeUrl]);

  // Fetch live image list from Google Apps Script Bridge when configured
  useEffect(() => {
    if (settingsLoading || !activeBridgeUrl) return;

    const controller = new AbortController();

    const runFetch = async () => {
      setDriveLoading(true);
      try {
        const files = await fetchDriveFolderImages(
          activeBridgeUrl,
          controller.signal
        );
        if (!controller.signal.aborted) {
          setDriveFiles(files);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.warn("Could not load live Google Drive folder items:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setDriveLoading(false);
        }
      }
    };

    void runFetch();

    return () => {
      controller.abort();
    };
  }, [activeBridgeUrl, settingsLoading]);

  // Merge Firestore descriptions/metadata with live Google Drive images
  const allItems = useMemo(() => {
    const activeDriveFiles = activeBridgeUrl ? driveFiles : [];
    return mergeGalleryItems(galleryFromDb, activeDriveFiles, false);
  }, [galleryFromDb, driveFiles, activeBridgeUrl]);

  const selectedItem =
    selectedIndex !== null && allItems[selectedIndex]
      ? allItems[selectedIndex]
      : null;

  const handleOpenLightbox = (index: number) => {
    setLightboxImageLoading(true);
    setSelectedIndex(index);
  };

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || allItems.length === 0) return null;
      setLightboxImageLoading(true);
      return (prev - 1 + allItems.length) % allItems.length;
    });
  }, [allItems.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || allItems.length === 0) return null;
      setLightboxImageLoading(true);
      return (prev + 1) % allItems.length;
    });
  }, [allItems.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedIndex, handlePrev, handleNext]);

  const isInitialLoading =
    dbLoading || (settingsLoading && allItems.length === 0) || (driveLoading && allItems.length === 0);

  if (isInitialLoading) {
    return (
      <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-mono text-muted-foreground">
          Syncing gallery from Google Drive...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Back to Portfolio Link */}
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
            <Camera className="w-3.5 h-3.5" />
            ~/portfolio/gallery
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-lora text-foreground tracking-tight">
            Gallery & Moments
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            A curated visual archive of moments, events, competitive programming memories, and snapshots.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {allItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-12 text-center max-w-xl mx-auto my-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold font-lora text-foreground">
              No gallery photos to display yet
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Photos uploaded to the connected folder will automatically appear here.
            </p>
          </div>
        </div>
      ) : (
        /* Responsive Masonry Gallery (Preserves Original Image Aspect Ratios) */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 sm:gap-8 space-y-6 sm:space-y-8">
          {allItems.map((item, index) => {
            const fileIdentifier = item.fileId || item.driveUrl;
            const hasTextMetadata = Boolean(
              item.description?.trim() || item.date?.trim()
            );

            return (
              <article
                key={item.id}
                onClick={() => handleOpenLightbox(index)}
                className="group break-inside-avoid relative w-full rounded-2xl overflow-hidden border border-border/60 bg-muted/30 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer"
              >
                {/* Natural Aspect Ratio Image with Multi-Endpoint Fallback */}
                <GalleryCardImage
                  key={fileIdentifier}
                  fileIdentifier={fileIdentifier}
                  alt={item.description || "Portfolio gallery image"}
                />

                {/* Top-Right Floating Expand Badge on Hover */}
                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-lg">
                    <Maximize2 className="w-3.5 h-3.5" />
                    View
                  </span>
                </div>

                {/* Transparent Blur Metadata Overlay on the Image */}
                {hasTextMetadata && (
                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 bg-black/45 backdrop-blur-md border-t border-white/15 text-white transition-all duration-300 space-y-1.5">
                    {item.date && (
                      <div className="flex items-center justify-end">
                        <span className="text-[11px] font-mono text-white/85 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </span>
                      </div>
                    )}

                    {item.description && (
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-line line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Fullscreen Responsive Lightbox Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image viewer"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[94vh] bg-background border border-border/70 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Top Bar */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border/50 flex items-center justify-between gap-4 bg-muted/20">
              <div className="min-w-0 flex items-center gap-2.5">
                <span className="text-xs font-mono text-muted-foreground">
                  {(selectedIndex ?? 0) + 1} / {allItems.length}
                </span>
                {selectedItem.date && (
                  <span className="text-xs font-mono text-muted-foreground inline-flex items-center gap-1">
                    • <Calendar className="w-3 h-3" /> {selectedItem.date}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {(() => {
                  const driveHref = getDriveViewUrl(
                    selectedItem.fileId || selectedItem.driveUrl
                  );
                  return isSafeUrl(driveHref) ? (
                    <a
                      href={driveHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card hover:bg-accent text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                      title="Open in Google Drive"
                    >
                      <span>Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null;
                })()}
                <button
                  type="button"
                  onClick={() => setSelectedIndex(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Main Image Viewport */}
            <div className="relative flex-1 w-full bg-black/90 min-h-[45vh] sm:min-h-[62vh] max-h-[70vh] flex items-center justify-center overflow-hidden">
              {lightboxImageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-xs font-mono text-white/70">
                    Loading high-resolution image...
                  </span>
                </div>
              )}

              <LightboxDriveImage
                key={selectedItem.fileId || selectedItem.id}
                fileIdentifier={selectedItem.fileId || selectedItem.driveUrl}
                alt={selectedItem.description || "Gallery photo"}
                onLoaded={() => setLightboxImageLoading(false)}
              />

              {/* Previous / Next Navigation Controls */}
              {allItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous image"
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/15 transition-all cursor-pointer z-20"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next image"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/15 transition-all cursor-pointer z-20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Caption / Description Footer */}
            {selectedItem.description && (
              <div className="p-4 sm:p-6 bg-background border-t border-border/50 max-h-[24vh] overflow-y-auto">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {selectedItem.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
