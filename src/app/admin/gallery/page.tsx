"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { useFirestoreDoc } from "@/hooks/useFirestoreDoc";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import type { GalleryItem, GallerySettings, DriveBridgeFile } from "@/lib/data";
import {
  swapCollectionOrder,
  extractDriveFileId,
  isDriveFolderInput,
  getDriveGalleryImageUrl,
  getDriveImageFallbackUrls,
  getDriveViewUrl,
  GOOGLE_DRIVE_GALLERY_FOLDER,
  GOOGLE_APPS_SCRIPT_BRIDGE_CODE,
  isValidAppsScriptUrl,
  fetchDriveFolderImages,
  mergeGalleryItems,
} from "@/lib/data";
import toast from "react-hot-toast";
import {
  Camera,
  Save,
  X,
  Edit2,
  Trash,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ExternalLink,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Loader2,
  RefreshCw,
  Settings2,
  Copy,
  Check,
  CloudDownload,
  Sparkles,
} from "lucide-react";

function AdminResilientImage({
  fileIdOrUrl,
  alt,
  width = 800,
  fillMode = false,
}: {
  fileIdOrUrl: string;
  alt: string;
  width?: number;
  fillMode?: boolean;
}) {
  const candidates = useMemo(
    () => getDriveImageFallbackUrls(fileIdOrUrl, width),
    [fileIdOrUrl, width]
  );
  const [urlIndex, setUrlIndex] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  const activeSrc = candidates[urlIndex] || "";

  if (!activeSrc || failedAll) {
    return (
      <div className="p-3 text-center space-y-1 text-amber-600 dark:text-amber-400">
        <AlertCircle className="w-6 h-6 mx-auto" />
        <p className="text-[10px] font-mono leading-snug">
          Cannot load image. Make sure this is an Image File link (not a Folder link) and Google Drive sharing is set to &quot;Anyone with the link&quot;.
        </p>
      </div>
    );
  }

  if (fillMode) {
    return (
      <Image
        src={activeSrc}
        alt={alt}
        fill
        referrerPolicy="no-referrer"
        sizes="120px"
        className="object-cover group-hover:scale-105 transition-transform"
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

  return (
    <Image
      src={activeSrc}
      alt={alt}
      width={width}
      height={Math.round(width * 0.75)}
      referrerPolicy="no-referrer"
      sizes="(max-width: 1024px) 100vw, 33vw"
      className="w-full h-auto max-h-72 object-contain"
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

export default function AdminGalleryPage() {
  const { data: dbGallery, loading: dbLoading } =
    useFirestoreCollection<GalleryItem>("gallery");
  const { data: settings, loading: settingsLoading } =
    useFirestoreDoc<GallerySettings>("gallery_settings", "main");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [driveUrl, setDriveUrl] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Google Drive Bridge State
  const [driveFiles, setDriveFiles] = useState<DriveBridgeFile[]>([]);
  const [driveSyncing, setDriveSyncing] = useState(false);
  const [batchSaving, setBatchSaving] = useState(false);
  const [showBridgeSetup, setShowBridgeSetup] = useState(false);
  const [bridgeUrlInput, setBridgeUrlInput] = useState("");
  const [savingBridge, setSavingBridge] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  const activeBridgeUrl = useMemo(() => {
    return (
      settings?.bridgeUrl?.trim() ||
      process.env.NEXT_PUBLIC_GALLERY_BRIDGE_URL?.trim() ||
      ""
    );
  }, [settings?.bridgeUrl]);

  useEffect(() => {
    if (settings?.bridgeUrl) {
      setBridgeUrlInput(settings.bridgeUrl);
    } else if (process.env.NEXT_PUBLIC_GALLERY_BRIDGE_URL) {
      setBridgeUrlInput(process.env.NEXT_PUBLIC_GALLERY_BRIDGE_URL);
    }
  }, [settings?.bridgeUrl]);

  const loadFromDriveBridge = useCallback(
    async (urlToFetch: string, showToast = false) => {
      if (!urlToFetch) return;
      if (!isValidAppsScriptUrl(urlToFetch)) {
        if (showToast) {
          toast.error("Please enter a valid https://script.google.com/... Web App URL.");
        }
        return;
      }

      setDriveSyncing(true);
      try {
        const files = await fetchDriveFolderImages(urlToFetch);
        setDriveFiles(files);
        if (showToast) {
          toast.success(`Synced ${files.length} image(s) from Google Drive folder!`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (showToast) {
          toast.error(`Failed to fetch Drive folder: ${msg}`);
        }
      } finally {
        setDriveSyncing(false);
      }
    },
    []
  );

  // Auto-fetch Drive folder when bridge URL is available
  useEffect(() => {
    if (settingsLoading) return;
    if (activeBridgeUrl) {
      loadFromDriveBridge(activeBridgeUrl, false);
    }
  }, [activeBridgeUrl, settingsLoading, loadFromDriveBridge]);

  // Combined list of Firestore items + live Google Drive folder items
  const allGalleryItems = useMemo(() => {
    return mergeGalleryItems(dbGallery, driveFiles, true);
  }, [dbGallery, driveFiles]);

  const unsavedDriveItems = useMemo(() => {
    return allGalleryItems.filter((item) => item.fromDriveOnly);
  }, [allGalleryItems]);

  // Live extracted Google Drive file ID for the form
  const isFolderUrl = isDriveFolderInput(driveUrl);
  const extractedId = extractDriveFileId(driveUrl);

  const resetForm = () => {
    setEditingId(null);
    setDriveUrl("");
    setDescription("");
    setDate("");
    setIsHidden(false);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setDriveUrl(item.driveUrl || item.fileId || "");
    setDescription(item.description || "");
    setDate(item.date || "");
    setIsHidden(Boolean(item.isHidden));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveBridgeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = bridgeUrlInput.trim();
    if (trimmed && !isValidAppsScriptUrl(trimmed)) {
      toast.error(
        "Invalid URL. Must be a Google Apps Script Web App URL (https://script.google.com/macros/s/.../exec)."
      );
      return;
    }

    setSavingBridge(true);
    try {
      await setDoc(
        doc(db, "gallery_settings", "main"),
        {
          bridgeUrl: trimmed,
          folderUrl: GOOGLE_DRIVE_GALLERY_FOLDER,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      toast.success("Google Drive Bridge settings saved!");
      if (trimmed) {
        await loadFromDriveBridge(trimmed, true);
      } else {
        setDriveFiles([]);
      }
      setShowBridgeSetup(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save bridge settings: ${msg}`);
    } finally {
      setSavingBridge(false);
    }
  };

  const handleCopyAppsScript = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_BRIDGE_CODE);
      setCopiedScript(true);
      toast.success("Google Apps Script code copied to clipboard!");
      setTimeout(() => setCopiedScript(false), 2500);
    } catch {
      toast.error("Could not copy automatically. Please select and copy the code manually.");
    }
  };

  const handleSyncAllNewDriveItems = async () => {
    if (unsavedDriveItems.length === 0) return;
    setBatchSaving(true);
    try {
      const batch = writeBatch(db);
      const existingMaxOrder =
        dbGallery.length > 0
          ? Math.max(...dbGallery.map((g) => g.order ?? 0))
          : -1;

      unsavedDriveItems.forEach((item, index) => {
        const docId = item.fileId;
        const docRef = doc(db, "gallery", docId);
        batch.set(docRef, {
          fileId: item.fileId,
          driveUrl: getDriveViewUrl(item.fileId),
          description: (item.description || "").trim().slice(0, 1000),
          date: (item.date || "").trim().slice(0, 60),
          isHidden: Boolean(item.isHidden),
          order: existingMaxOrder + 1 + index,
          createdAt: item.createdAt || new Date().toISOString(),
        });
      });

      await batch.commit();
      toast.success(
        `Saved ${unsavedDriveItems.length} Google Drive image(s) to Firestore!`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to sync items: ${msg}`);
    } finally {
      setBatchSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!extractedId) {
      toast.error("Please select a Drive image or paste a valid Google Drive file link / ID.");
      return;
    }

    setFormLoading(true);
    try {
      const normalizedViewUrl = getDriveViewUrl(extractedId);
      const existingItem = dbGallery.find(
        (g) => g.id === editingId || g.fileId === extractedId
      );

      // Use existing Firestore document ID if editing a saved doc, otherwise deterministic fileId
      const targetDocId =
        editingId && !editingId.startsWith("drive_")
          ? editingId
          : existingItem?.id || extractedId;

      const maxOrder =
        dbGallery.length > 0
          ? Math.max(...dbGallery.map((g) => g.order ?? 0))
          : -1;

      const payload = {
        fileId: extractedId,
        driveUrl: normalizedViewUrl,
        description: description.trim().slice(0, 1000),
        date: date.trim().slice(0, 60),
        isHidden,
        order: existingItem?.order !== undefined ? existingItem.order : maxOrder + 1,
        createdAt: existingItem?.createdAt || new Date().toISOString(),
      };

      await setDoc(doc(db, "gallery", targetDocId), payload);
      toast.success(
        existingItem || (editingId && !editingId.startsWith("drive_"))
          ? "Gallery image & description updated!"
          : "Gallery image saved to Firestore!"
      );
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Error saving gallery item: ${msg}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleVisibility = async (item: GalleryItem) => {
    try {
      const targetDocId = item.fromDriveOnly ? item.fileId : item.id;
      const maxOrder =
        dbGallery.length > 0
          ? Math.max(...dbGallery.map((g) => g.order ?? 0))
          : -1;

      await setDoc(doc(db, "gallery", targetDocId), {
        fileId: item.fileId,
        driveUrl: getDriveViewUrl(item.fileId || item.driveUrl),
        description: (item.description || "").trim().slice(0, 1000),
        date: (item.date || "").trim().slice(0, 60),
        isHidden: !item.isHidden,
        order: item.order ?? maxOrder + 1,
        createdAt: item.createdAt || new Date().toISOString(),
      });
      toast.success(
        !item.isHidden
          ? "Image hidden from public gallery."
          : "Image is now visible in public gallery."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to update visibility: ${msg}`);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (item.fromDriveOnly) {
      toast.error(
        "This image is coming live from your Google Drive folder. To hide it on the portfolio, click the Hide (eye) button, or delete the file in Google Drive."
      );
      return;
    }

    if (
      !confirm(
        "Delete this saved gallery entry from Firestore? (Note: If the image file is still inside your Google Drive folder, it will still appear as an unsaved Drive image unless removed from Drive or hidden.)"
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "gallery", item.id));
      toast.success("Gallery entry removed from Firestore!");
      if (editingId === item.id) resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to delete: ${msg}`);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    // Ensure items being reordered exist in Firestore first
    if (unsavedDriveItems.length > 0) {
      toast.error(
        "Please click 'Save All New Drive Photos' first before custom reordering."
      );
      return;
    }
    try {
      await swapCollectionOrder("gallery", dbGallery, index, direction);
    } catch {
      toast.error("Failed to reorder gallery.");
    }
  };

  if (dbLoading) {
    return (
      <div className="p-8 font-mono text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        Loading gallery management...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-lora text-foreground flex items-center gap-3">
            <Camera className="w-7 h-7 text-primary" />
            Manage Gallery
          </h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            Auto-sync images from your Google Drive folder and manage descriptions, dates, and Drive links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowBridgeSetup((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-xs font-mono font-semibold text-primary transition-colors cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
            <span>{activeBridgeUrl ? "Drive Bridge Connected" : "Setup Drive Auto-Sync"}</span>
          </button>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/60 bg-card hover:bg-accent text-xs font-mono text-foreground transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span>View Public Gallery</span>
          </Link>

          <a
            href={GOOGLE_DRIVE_GALLERY_FOLDER}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/60 bg-card hover:bg-accent text-xs font-mono text-foreground transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-primary" />
            <span>Open Drive Folder</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Google Apps Script Bridge Configuration Panel */}
      {showBridgeSetup && (
        <div className="p-6 rounded-2xl border border-primary/40 bg-card/80 backdrop-blur-md space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold font-lora text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Google Drive Folder Auto-Sync Bridge
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This 1-time setup connects your Google Drive folder (<code className="text-primary font-mono">1QrwVkUnNKiHK8QF_3t8cgEArOqkXfzOZ</code>) so any image you upload to Drive automatically appears in your portfolio gallery and admin panel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBridgeSetup(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1: Copy Script */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Step 1: Copy Apps Script (Pre-configured with your Folder ID)
                </span>
                <button
                  type="button"
                  onClick={handleCopyAppsScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-muted/60 border border-border/60 text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-56">
                {GOOGLE_APPS_SCRIPT_BRIDGE_CODE}
              </pre>
            </div>

            {/* Step 2: Paste Web App URL */}
            <form onSubmit={handleSaveBridgeSettings} className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground block">
                  Step 2: Deploy & Paste Web App URL
                </span>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>
                    Open{" "}
                    <a
                      href="https://script.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      script.google.com
                    </a>{" "}
                    and click <strong>New project</strong>.
                  </li>
                  <li>Paste the copied code and save.</li>
                  <li>
                    Click <strong>Deploy → New deployment</strong>, choose type{" "}
                    <strong>Web app</strong>.
                  </li>
                  <li>
                    Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>, then click <strong>Deploy</strong>.
                  </li>
                  <li>Paste the resulting Web App URL below:</li>
                </ol>

                <div className="pt-2">
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                    Google Apps Script Web App URL
                  </label>
                  <input
                    type="url"
                    value={bridgeUrlInput}
                    onChange={(e) => setBridgeUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border/60 focus:border-primary focus:outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={savingBridge}
                  className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingBridge ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save & Sync Bridge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unsaved Drive Folder Photos Banner */}
      {unsavedDriveItems.length > 0 && (
        <div className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold font-lora text-foreground flex items-center gap-2">
              <CloudDownload className="w-4 h-4 text-emerald-500" />
              {unsavedDriveItems.length} New Image(s) Detected in Google Drive Folder
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              These photos are already live on your public Gallery page! Click <strong>Edit / Add Description</strong> on any photo below to add a caption, or save all of them to Firestore to enable custom reordering.
            </p>
          </div>
          <button
            type="button"
            disabled={batchSaving}
            onClick={handleSyncAllNewDriveItems}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 cursor-pointer transition-colors disabled:opacity-50"
          >
            {batchSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save All New Drive Photos
              </>
            )}
          </button>
        </div>
      )}

      {/* Add / Edit Description Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="text-lg font-bold font-lora text-foreground">
            {editingId
              ? "Edit Gallery Image & Description"
              : "Add / Edit Image Description"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Inputs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description (Primary Field) */}
            <div>
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                Image Description / Caption
              </label>
              <textarea
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a story, caption, or context for this photo (optional)..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border/60 focus:border-primary focus:outline-none text-sm leading-relaxed"
              />
            </div>

            {/* Optional Date */}
            <div>
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                Date (Optional)
              </label>
              <input
                type="text"
                maxLength={60}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g., Oct 2026"
                className="w-full px-3.5 py-2 rounded-lg bg-background border border-border/60 focus:border-primary focus:outline-none text-sm"
              />
            </div>

            {/* Google Drive File Link or ID */}
            <div>
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                Google Drive Image Link or File ID *
              </label>
              <input
                type="text"
                required
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="Click 'Edit / Add Description' on any Drive image below, or paste a Drive image link"
                className="w-full px-3.5 py-2 rounded-lg bg-background border border-border/60 focus:border-primary focus:outline-none text-sm font-mono"
              />

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                {driveUrl.trim() ? (
                  isFolderUrl ? (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      That is a Google Drive <strong>Folder</strong> link/ID! To sync the folder, click &quot;Setup Drive Auto-Sync&quot; at the top right, or right-click a specific image inside the folder → Share → Copy link.
                    </span>
                  ) : extractedId ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Extracted Drive File ID:{" "}
                      <code className="px-1.5 py-0.5 rounded bg-emerald-500/10">
                        {extractedId}
                      </code>
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Could not detect a valid Drive Image File ID from this link.
                    </span>
                  )
                ) : (
                  <span className="text-muted-foreground">
                    Select any synced image below to edit its description, or paste a Google Drive image file link.
                  </span>
                )}

                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-foreground">
                  <input
                    type="checkbox"
                    checked={isHidden}
                    onChange={(e) => setIsHidden(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span>Hide from public gallery</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Image Preview */}
          <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-background/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>IMAGE PREVIEW</span>
              {extractedId && <span className="text-primary">Drive CDN Ready</span>}
            </div>

            <div className="relative min-h-44 w-full rounded-lg overflow-hidden bg-muted/40 border border-border/40 flex items-center justify-center">
              {extractedId ? (
                <AdminResilientImage
                  key={extractedId}
                  fileIdOrUrl={extractedId}
                  alt="Gallery live preview"
                  width={800}
                />
              ) : (
                <div className="text-center p-4 space-y-1.5 text-muted-foreground">
                  <ImageIcon className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-[11px] font-mono">
                    Select an image below or paste a Drive image link to preview
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {formLoading
                ? "Saving..."
                : editingId
                  ? "Save Description & Changes"
                  : "Save to Gallery"}
            </button>
          </div>
        </div>
      </form>

      {/* Gallery Grid List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-lora text-foreground">
              Gallery Images ({allGalleryItems.length})
            </h2>
            {driveFiles.length > 0 && (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {driveFiles.length} in Drive Folder
              </span>
            )}
          </div>

          {activeBridgeUrl && (
            <button
              type="button"
              disabled={driveSyncing}
              onClick={() => loadFromDriveBridge(activeBridgeUrl, true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card hover:bg-accent text-xs font-mono text-foreground transition-colors cursor-pointer disabled:opacity-50 w-fit"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-primary ${
                  driveSyncing ? "animate-spin" : ""
                }`}
              />
              <span>{driveSyncing ? "Refreshing Drive..." : "Refresh Drive Folder"}</span>
            </button>
          )}
        </div>

        {allGalleryItems.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border text-center text-muted-foreground font-mono text-xs space-y-2">
            <p>No gallery images found yet.</p>
            <p>
              Click <strong>Setup Drive Auto-Sync</strong> above to connect your Google Drive folder, or paste a Google Drive image link in the form!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allGalleryItems.map((item, idx) => {
              const fileIdentifier = item.fileId || item.driveUrl;
              const viewUrl = getDriveViewUrl(fileIdentifier);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row items-start gap-4 justify-between ${
                    item.isHidden
                      ? "border-border/30 bg-muted/10 opacity-65"
                      : editingId === item.id
                        ? "border-primary bg-primary/5"
                        : "border-border/40 bg-card/20 hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="relative w-24 h-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50 group cursor-pointer flex items-center justify-center"
                      title="Click to preview image"
                    >
                      {fileIdentifier ? (
                        <AdminResilientImage
                          key={fileIdentifier}
                          fileIdOrUrl={fileIdentifier}
                          alt={item.description || "Gallery item"}
                          width={400}
                          fillMode
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </button>

                    {/* Details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.fromDriveOnly ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            Live from Drive
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                            Saved in DB
                          </span>
                        )}

                        {item.date && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            • {item.date}
                          </span>
                        )}

                        {item.isHidden && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-500">
                            Hidden
                          </span>
                        )}
                      </div>

                      {item.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      ) : (
                        <p className="text-xs italic text-muted-foreground/70">
                          No description added yet — click Edit to add a description.
                        </p>
                      )}

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          {item.description ? "Edit Description" : "+ Add Description"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    {!item.fromDriveOnly && (
                      <div className="flex flex-col mr-1">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "up")}
                          disabled={idx === 0 || unsavedDriveItems.length > 0}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "down")}
                          disabled={
                            idx === allGalleryItems.length - 1 ||
                            unsavedDriveItems.length > 0
                          }
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                      title={
                        item.isHidden
                          ? "Unhide (Show on public gallery)"
                          : "Hide from public gallery"
                      }
                    >
                      {item.isHidden ? (
                        <EyeOff className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                      title="Open in Google Drive"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                      title="Edit description & details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {!item.fromDriveOnly && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete saved metadata from Firestore"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Image Preview Modal */}
      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="min-w-0 flex items-center gap-2">
                <h3 className="font-bold font-lora text-base text-foreground truncate">
                  Gallery Image Preview
                </h3>
                {previewItem.date && (
                  <span className="text-xs font-mono text-muted-foreground">
                    • {previewItem.date}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full h-[55vh] bg-black/90">
              <Image
                src={getDriveGalleryImageUrl(
                  previewItem.fileId || previewItem.driveUrl,
                  1400
                )}
                alt={previewItem.description || "Preview"}
                fill
                referrerPolicy="no-referrer"
                sizes="100vw"
                className="object-contain"
              />
            </div>
            {previewItem.description && (
              <div className="p-4 border-t border-border/50 text-xs sm:text-sm text-muted-foreground">
                {previewItem.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
