"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { db } from "@/lib/firebase";
import { doc, addDoc, setDoc, deleteDoc, collection, writeBatch } from "firebase/firestore";
import type { ClassItem } from "@/lib/data";
import {
  swapCollectionOrder,
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  getYouTubeEmbedUrl,
  getYouTubeWatchUrl,
  resolveClasses,
  getMissingFallbackClasses,
  isClassesCollectionSeeded,
} from "@/lib/data";
import toast from "react-hot-toast";
import {
  Save,
  X,
  Edit2,
  Trash,
  ArrowUp,
  ArrowDown,
  Youtube,
  PlayCircle,
  Eye,
  ExternalLink,
  Video,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Database,
} from "lucide-react";

export default function AdminClassesPage() {
  const { data: classes, loading } = useFirestoreCollection<ClassItem>("classes");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [videoId, setVideoId] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // Preview Modal State
  const [previewVideo, setPreviewVideo] = useState<{ title: string; videoId: string } | null>(null);
  const [modalLoading, setModalLoading] = useState(true);

  // Unified resolution: ensure fallback classes do not disappear when new ones are added
  const displayClasses = useMemo(() => {
    return resolveClasses(classes);
  }, [classes]);

  const missingFallbacks = useMemo(() => {
    return getMissingFallbackClasses(classes);
  }, [classes]);

  const isSeeded = useMemo(() => {
    return isClassesCollectionSeeded(classes);
  }, [classes]);

  const hasUnseededDefaults = !isSeeded && missingFallbacks.length > 0;

  // Real-time parsed YouTube details
  const currentExtractedId = extractYouTubeVideoId(videoId) || extractYouTubeVideoId(url);
  const liveThumbnailUrl = currentExtractedId ? getYouTubeThumbnailUrl(currentExtractedId, "hq") : "";

  const resetForm = () => {
    setTitle("");
    setVideoId("");
    setDescription("");
    setUrl("");
    setEditingId(null);
  };

  const handleEdit = (cl: ClassItem) => {
    setEditingId(cl.id);
    setTitle(cl.title);
    setVideoId(cl.videoId || extractYouTubeVideoId(cl.url));
    setDescription(cl.description);
    setUrl(cl.url || (cl.videoId ? getYouTubeWatchUrl(cl.videoId) : ""));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    const extracted = extractYouTubeVideoId(newUrl);
    if (extracted && !videoId) {
      setVideoId(extracted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalVideoId = extractYouTubeVideoId(videoId) || extractYouTubeVideoId(url);
    if (!finalVideoId) {
      toast.error("Please enter a valid YouTube Video ID or Video URL.");
      return;
    }

    setFormLoading(true);

    const existingClass = displayClasses.find((c) => c.id === editingId);
    const existingMaxOrder = displayClasses.length > 0
      ? Math.max(...displayClasses.map((c) => c.order ?? 0))
      : -1;

    const data = {
      title: title.trim(),
      videoId: finalVideoId,
      description: description.trim(),
      url: url.trim() || getYouTubeWatchUrl(finalVideoId),
      order: editingId
        ? (existingClass?.order ?? 0)
        : Math.max(displayClasses.length, existingMaxOrder + 1),
    };

    try {
      if (editingId) {
        await setDoc(doc(db, "classes", editingId), data, { merge: true });
        toast.success("Class entry updated!");
      } else {
        await addDoc(collection(db, "classes"), data);
        toast.success("Class entry added!");
      }
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      if (msg.toLowerCase().includes("permission")) {
        toast.error("Permission denied. Verify you are logged into your admin account.");
      } else {
        toast.error(`Error: ${msg}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      const existsInDb = classes.some((c) => c.id === id);
      if (existsInDb) {
        await deleteDoc(doc(db, "classes", id));
        toast.success("Class entry deleted!");
      } else {
        const batch = writeBatch(db);
        const remainingFallbacks = missingFallbacks.filter((fb) => fb.id !== id);
        const existingMaxOrder = classes.length > 0
          ? Math.max(...classes.map((c) => c.order ?? 0))
          : -1;

        remainingFallbacks.forEach((item, index) => {
          const docRef = doc(db, "classes", item.id);
          const data = {
            title: item.title,
            videoId: item.videoId,
            description: item.description || "",
            url: item.url || getYouTubeWatchUrl(item.videoId),
            order: existingMaxOrder + 1 + index,
          };
          batch.set(docRef, data);
        });

        await batch.commit();
        toast.success("Class removed from portfolio!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      if (msg.toLowerCase().includes("permission")) {
        toast.error("Permission denied. Verify you are logged into your admin account.");
      } else {
        toast.error(`Error: ${msg}`);
      }
    }
  };

  const handleSyncDefaultClasses = async () => {
    setSyncLoading(true);
    try {
      const batch = writeBatch(db);
      const existingMaxOrder = classes.length > 0
        ? Math.max(...classes.map((c) => c.order ?? 0))
        : -1;

      missingFallbacks.forEach((item, index) => {
        const docRef = doc(db, "classes", item.id);
        const data = {
          title: item.title,
          videoId: item.videoId,
          description: item.description || "",
          url: item.url || getYouTubeWatchUrl(item.videoId),
          order: existingMaxOrder + 1 + index,
        };
        batch.set(docRef, data);
      });

      await batch.commit();
      toast.success(`Successfully saved ${missingFallbacks.length} original classes to Firestore!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Sync failed: ${msg}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSaveSingleDefault = async (cl: ClassItem) => {
    try {
      const docRef = doc(db, "classes", cl.id);
      const existingMaxOrder = classes.length > 0
        ? Math.max(...classes.map((c) => c.order ?? 0))
        : -1;
      const data = {
        title: cl.title,
        videoId: cl.videoId,
        description: cl.description || "",
        url: cl.url || getYouTubeWatchUrl(cl.videoId),
        order: existingMaxOrder + 1,
      };
      await setDoc(docRef, data);
      toast.success(`"${cl.title}" saved to Firestore!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Save failed: ${msg}`);
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    if (hasUnseededDefaults) {
      toast.error("Please click 'Sync Defaults to Database' first to enable reordering across all classes.");
      return;
    }
    try {
      const swapped = await swapCollectionOrder("classes", classes, index, direction);
      if (swapped) toast.success("Order updated!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast.error(`Failed to reorder: ${msg}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono text-sm">
      {/* Header with Public Page Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary font-mono mb-2">
            <Video className="w-3.5 h-3.5" />
            ~/admin/classes
          </div>
          <h1 className="text-3xl font-bold font-lora text-foreground">Classes Manager</h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            Configure online classes, lecture recordings, and YouTube tutorials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {hasUnseededDefaults && (
            <button
              type="button"
              onClick={handleSyncDefaultClasses}
              disabled={syncLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
              title="Save all default fallback classes directly to Firestore"
            >
              {syncLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span>Sync Defaults ({missingFallbacks.length})</span>
            </button>
          )}

          <Link
            href="/classes"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-accent text-foreground text-xs font-mono transition-colors shrink-0 cursor-pointer"
          >
            <span>View Public Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 space-y-4 p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-lora text-foreground">
              {editingId ? "Edit Class" : "Create Class"}
            </h2>
            {editingId && (
              <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                Editing
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Class Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Thread in Java || OOP"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">YouTube URL</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://youtu.be/uobWZ7FA6XM"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Paste the full YouTube link; the video ID will be extracted automatically.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">YouTube Video ID</label>
            <div className="relative">
              <input
                type="text"
                required
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="uobWZ7FA6XM"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
              />
              {currentExtractedId && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          {/* Live Thumbnail Preview */}
          {liveThumbnailUrl && (
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Detected Thumbnail</label>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/40 border border-border/60">
                <Image
                  src={liveThumbnailUrl}
                  alt="Detected thumbnail"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <PlayCircle className="w-8 h-8 text-white/90 drop-shadow-md" />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed lecture overview, topics covered, and key outcomes..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary font-sans leading-relaxed text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingId ? "Update Class" : "Save Class"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                aria-label="Cancel editing"
                className="p-2.5 rounded-lg border border-border bg-background text-muted-foreground hover:bg-accent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Right Column: Listing */}
        <div className="lg:col-span-7 space-y-4">
          {hasUnseededDefaults && (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold font-lora text-sm sm:text-base text-foreground">
                    {missingFallbacks.length} Original Classes Not Synced to Database
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed font-sans">
                    These classes are currently visible on your public site. Save them to Firestore so you can customize, edit, or reorder each entry directly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSyncDefaultClasses}
                disabled={syncLoading}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm shrink-0 disabled:opacity-50"
              >
                {syncLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Database className="w-3.5 h-3.5" />
                )}
                <span>Sync {missingFallbacks.length} Defaults to DB</span>
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-border/40 font-lora font-bold text-foreground flex items-center justify-between">
              <span>Teaching Archive ({displayClasses.length})</span>
              <span className="text-xs font-mono text-muted-foreground">Order: Top to Bottom</span>
            </div>
            <div className="divide-y divide-border/40">
              {displayClasses.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs font-mono space-y-2">
                  <AlertCircle className="w-6 h-6 mx-auto text-muted-foreground/60" />
                  <p>No records stored yet in Firestore. The public site will display default fallback classes.</p>
                </div>
              ) : (
                displayClasses.map((cl, idx) => {
                  const isStoredInDb = classes.some((c) => c.id === cl.id);
                  const finalId = cl.videoId || extractYouTubeVideoId(cl.url);
                  const thumb = getYouTubeThumbnailUrl(finalId, "hq");

                  return (
                    <div key={cl.id} className="p-4 flex items-start gap-4 justify-between group">
                      <div className="flex gap-3 items-start flex-1 min-w-0">
                        {/* Thumbnail with quick preview click */}
                        <div
                          onClick={() => {
                            setModalLoading(true);
                            setPreviewVideo({ title: cl.title, videoId: finalId });
                          }}
                          className="relative w-24 aspect-video rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50 cursor-pointer group/thumb"
                          title="Click to preview video"
                        >
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={cl.title}
                              fill
                              className="object-cover group-hover/thumb:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                              <Youtube className="w-5 h-5" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                            <PlayCircle className="w-5 h-5 text-white" />
                          </div>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-foreground text-sm line-clamp-1">{cl.title}</h4>
                            {!isStoredInDb && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Portfolio Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-primary font-mono flex items-center gap-1">
                            <Youtube className="w-3 h-3 text-[#FF0000]" />
                            ID: {finalId}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-sans">
                            {cl.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setModalLoading(true);
                            setPreviewVideo({ title: cl.title, videoId: finalId });
                          }}
                          title="Preview Video"
                          className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent text-foreground cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {!isStoredInDb && (
                          <button
                            type="button"
                            onClick={() => handleSaveSingleDefault(cl)}
                            title="Save this default class to Database"
                            className="p-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 cursor-pointer"
                          >
                            <Database className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isStoredInDb && (
                          <>
                            <button
                              type="button"
                              onClick={() => moveOrder(idx, "up")}
                              disabled={idx === 0}
                              aria-label={`Move ${cl.title} up`}
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveOrder(idx, "down")}
                              disabled={idx === classes.length - 1}
                              aria-label={`Move ${cl.title} down`}
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEdit(cl)}
                          aria-label={`Edit ${cl.title}`}
                          className="p-1.5 rounded-lg border border-border bg-background text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cl.id)}
                          aria-label={`Delete ${cl.title}`}
                          className="p-1.5 rounded-lg border border-border bg-background text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Preview Modal in Admin */}
      {previewVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-background border border-border/70 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between gap-4 bg-muted/20">
              <h3 className="text-sm sm:text-base font-bold font-lora text-foreground truncate">
                {previewVideo.title}
              </h3>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getYouTubeWatchUrl(previewVideo.videoId)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-mono rounded-lg border border-border bg-background hover:bg-accent text-foreground transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
                  <span>Open YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewVideo(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-video bg-black">
              {modalLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-xs font-mono">Loading YouTube preview...</span>
                </div>
              )}
              <iframe
                src={getYouTubeEmbedUrl(previewVideo.videoId)}
                title={previewVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setModalLoading(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
