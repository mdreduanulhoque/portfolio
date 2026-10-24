"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { db } from "@/lib/firebase";
import { doc, addDoc, setDoc, deleteDoc, collection, writeBatch } from "firebase/firestore";
import type { Certificate } from "@/lib/data";
import {
  swapCollectionOrder,
  extractDriveFileId,
  getDrivePdfPreviewUrl,
  getDriveThumbnailUrl,
  getDriveViewUrl,
  GOOGLE_DRIVE_CERTIFICATES_FOLDER,
  resolveCertificates,
  getMissingFallbackCertificates,
  isCertificatesCollectionSeeded,
} from "@/lib/data";
import toast from "react-hot-toast";
import {
  Award,
  Save,
  X,
  Edit2,
  Trash,
  ArrowUp,
  ArrowDown,
  Eye,
  ExternalLink,
  FolderArchive,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Database,
} from "lucide-react";

export default function AdminCertificatesPage() {
  const { data: certificates, loading } = useFirestoreCollection<Certificate>("certificates");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [description, setDescription] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // Preview Modal State
  const [previewCert, setPreviewCert] = useState<{ title: string; url: string; issuer?: string } | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Real-time extracted Google Drive details
  const extractedId = extractDriveFileId(driveUrl);
  const liveThumbnailUrl = extractedId ? getDriveThumbnailUrl(extractedId) : "";

  // Unified resolution: ensure fallback certificates do not disappear when new ones are added
  const displayCertificates = useMemo(() => {
    return resolveCertificates(certificates);
  }, [certificates]);

  const missingFallbacks = useMemo(() => {
    return getMissingFallbackCertificates(certificates);
  }, [certificates]);

  const isSeeded = useMemo(() => {
    return isCertificatesCollectionSeeded(certificates);
  }, [certificates]);

  const hasUnseededDefaults = !isSeeded && missingFallbacks.length > 0;

  const resetForm = () => {
    setTitle("");
    setIssuer("");
    setIssueDate("");
    setDriveUrl("");
    setDescription("");
    setEditingId(null);
  };

  const handleEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    setTitle(cert.title);
    setIssuer(cert.issuer);
    setIssueDate(cert.issueDate || "");
    setDriveUrl(cert.driveUrl || cert.fileId || "");
    setDescription(cert.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!extractedId) {
      toast.error("Please enter a valid Google Drive file URL or File ID.");
      return;
    }

    setFormLoading(true);

    const existingCert = displayCertificates.find((c) => c.id === editingId);
    const existingMaxOrder = displayCertificates.length > 0
      ? Math.max(...displayCertificates.map((c) => c.order ?? 0))
      : -1;

    const data = {
      title: title.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate.trim(),
      driveUrl: driveUrl.trim(),
      fileId: extractedId,
      description: description.trim(),
      order: editingId
        ? (existingCert?.order ?? 0)
        : Math.max(displayCertificates.length, existingMaxOrder + 1),
    };

    try {
      if (editingId) {
        // Use setDoc with merge to safely update both existing DB docs and unseeded fallback docs
        await setDoc(doc(db, "certificates", editingId), data, { merge: true });
        toast.success("Certificate updated successfully!");
      } else {
        await addDoc(collection(db, "certificates"), data);
        toast.success("Certificate created successfully!");
      }
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      if (msg.toLowerCase().includes("permission")) {
        toast.error("Permission denied. Verify you are logged into your authorized admin account.");
      } else {
        toast.error(`Error: ${msg}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    try {
      const existsInDb = certificates.some((c) => c.id === id);
      if (existsInDb) {
        await deleteDoc(doc(db, "certificates", id));
        toast.success("Certificate deleted!");
      } else {
        // If deleting a fallback item that isn't yet saved to DB, sync the remaining ones to DB so this one stays deleted
        const batch = writeBatch(db);
        const remainingFallbacks = missingFallbacks.filter((fb) => fb.id !== id);
        const existingMaxOrder = certificates.length > 0
          ? Math.max(...certificates.map((c) => c.order ?? 0))
          : -1;

        remainingFallbacks.forEach((item, index) => {
          const docRef = doc(db, "certificates", item.id);
          const data = {
            title: item.title,
            issuer: item.issuer,
            issueDate: item.issueDate || "",
            driveUrl: item.driveUrl,
            fileId: item.fileId || extractDriveFileId(item.driveUrl),
            description: item.description || "",
            order: existingMaxOrder + 1 + index,
          };
          batch.set(docRef, data);
        });

        await batch.commit();
        toast.success("Certificate removed from portfolio!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      if (msg.toLowerCase().includes("permission")) {
        toast.error("Permission denied. Verify you are logged into your authorized admin account.");
      } else {
        toast.error(`Error: ${msg}`);
      }
    }
  };

  const handleSyncDefaultCertificates = async () => {
    setSyncLoading(true);
    try {
      const batch = writeBatch(db);
      const existingMaxOrder = certificates.length > 0
        ? Math.max(...certificates.map((c) => c.order ?? 0))
        : -1;

      missingFallbacks.forEach((item, index) => {
        const docRef = doc(db, "certificates", item.id);
        const data = {
          title: item.title,
          issuer: item.issuer,
          issueDate: item.issueDate || "",
          driveUrl: item.driveUrl,
          fileId: item.fileId || extractDriveFileId(item.driveUrl),
          description: item.description || "",
          order: existingMaxOrder + 1 + index,
        };
        batch.set(docRef, data);
      });

      await batch.commit();
      toast.success(`Successfully saved ${missingFallbacks.length} original certificates to Firestore!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      if (msg.toLowerCase().includes("permission")) {
        toast.error("Permission denied. Ensure you are signed in as authorized administrator.");
      } else {
        toast.error(`Sync failed: ${msg}`);
      }
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSaveSingleDefault = async (cert: Certificate) => {
    try {
      const docRef = doc(db, "certificates", cert.id);
      const existingMaxOrder = certificates.length > 0
        ? Math.max(...certificates.map((c) => c.order ?? 0))
        : -1;
      const data = {
        title: cert.title,
        issuer: cert.issuer,
        issueDate: cert.issueDate || "",
        driveUrl: cert.driveUrl,
        fileId: cert.fileId || extractDriveFileId(cert.driveUrl),
        description: cert.description || "",
        order: existingMaxOrder + 1,
      };
      await setDoc(docRef, data);
      toast.success(`"${cert.title}" saved to Firestore!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Save failed: ${msg}`);
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    if (hasUnseededDefaults) {
      toast.error("Please click 'Sync Defaults to Database' first to enable reordering across all certificates.");
      return;
    }
    try {
      const swapped = await swapCollectionOrder("certificates", certificates, index, direction);
      if (swapped) toast.success("Order updated!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      if (msg.toLowerCase().includes("permission")) {
        toast.error("Permission denied. Verify you are logged into your authorized admin account.");
      } else {
        toast.error(`Failed to reorder: ${msg}`);
      }
    }
  };

  const openTestPreview = (title: string, url: string, issuer?: string) => {
    setIframeLoading(true);
    setPreviewCert({ title, url, issuer });
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-lora text-foreground flex items-center gap-2">
            <Award className="w-7 h-7 text-primary" />
            Certificates & Recognitions
          </h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            Manage credentials, achievement awards, and Google Drive PDF certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {hasUnseededDefaults && (
            <button
              type="button"
              onClick={handleSyncDefaultCertificates}
              disabled={syncLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
              title="Save all default fallback certificates directly to Firestore"
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
            href="/certificates"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer"
          >
            <span>View Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <a
            href={GOOGLE_DRIVE_CERTIFICATES_FOLDER}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-lg border border-border/70 bg-card hover:bg-accent text-foreground transition-colors cursor-pointer"
          >
            <FolderArchive className="w-4 h-4 text-primary" />
            <span>Drive Archive</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 space-y-4 p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold font-lora text-foreground">
              {editingId ? "Edit Certificate" : "Add New Certificate"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel Edit
              </button>
            )}
          </div>

          {/* Certificate Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Certificate Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. BeatCode 253 - Certificate of Achievement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-sm font-sans"
            />
          </div>

          {/* Issuer / Organization */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Issuing Organization *</label>
            <input
              type="text"
              required
              placeholder="e.g. UIU CPC, Grameenphone Academy, Udemy"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-sm font-sans"
            />
          </div>

          {/* Issue Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Issue Date / Period</label>
            <input
              type="text"
              placeholder="e.g. 2024, October 2024, or Present"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-sm font-sans"
            />
          </div>

          {/* Google Drive Link or File ID */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">
              Google Drive URL or File ID *
            </label>
            <input
              type="text"
              required
              placeholder="Paste Google Drive share link, preview link, or ID"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Accepts any link: <code className="text-primary font-mono">drive.google.com/file/d/...</code> or bare ID.
            </p>
          </div>

          {/* Live Link Feedback / Detected ID */}
          {driveUrl.trim() && (
            <div className="rounded-xl border p-3 text-xs space-y-2 bg-muted/20">
              {extractedId ? (
                <>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Valid File ID Detected:</span>
                    <code className="text-[10px] bg-emerald-500/10 px-1 py-0.5 rounded truncate">
                      {extractedId}
                    </code>
                  </div>

                  {liveThumbnailUrl && (
                    <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                      <div className="relative w-16 h-12 rounded bg-muted/40 overflow-hidden border shrink-0">
                        <Image
                          src={liveThumbnailUrl}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground">Thumbnail ready</span>
                        <button
                          type="button"
                          onClick={() => openTestPreview(title || "Preview Test", driveUrl, issuer)}
                          className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Test PDF Embed
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-500 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Could not detect a valid Google Drive File ID from this URL.</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Description / Highlights</label>
            <textarea
              rows={3}
              placeholder="Short note about the certification, placement, or skills acquired..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-sm font-sans leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {formLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{editingId ? "Save Certificate Changes" : "Create Certificate"}</span>
          </button>
        </form>

        {/* Right Column: Certificates List */}
        <div className="lg:col-span-7 space-y-4">
          {hasUnseededDefaults && (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold font-lora text-sm sm:text-base text-foreground">
                    {missingFallbacks.length} Original Portfolio Certificates Not Synced
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed font-sans">
                    These certificates are actively merged and visible on your public site. Sync them to Firestore so you can customize, edit, or delete them directly in the database.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSyncDefaultCertificates}
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

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-lora text-foreground">
              Certificates List ({displayCertificates.length})
            </h2>
            <span className="text-xs text-muted-foreground">Ordered by display priority</span>
          </div>

          {displayCertificates.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/20">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-foreground font-semibold">No certificates available.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add a new certificate using the form on the left or seed original defaults.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayCertificates.map((cert, index) => {
                const isStoredInDb = certificates.some((c) => c.id === cert.id);
                const fileId = cert.fileId || extractDriveFileId(cert.driveUrl);
                const thumb = fileId ? getDriveThumbnailUrl(fileId) : "";
                const view = fileId ? getDriveViewUrl(fileId) : cert.driveUrl;

                return (
                  <div
                    key={cert.id}
                    className={`p-4 rounded-xl border bg-card/40 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                      isStoredInDb
                        ? "border-border/60 hover:border-border"
                        : "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                    }`}
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Thumbnail */}
                      <div className="relative w-20 h-14 rounded-lg bg-muted/40 border border-border/40 overflow-hidden shrink-0 flex items-center justify-center">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={cert.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {cert.issuer}
                          </span>
                          {cert.issueDate && (
                            <span className="text-[10px] text-muted-foreground">
                              • {cert.issueDate}
                            </span>
                          )}
                          {!isStoredInDb && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Portfolio Default
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold font-lora text-foreground text-sm truncate">
                          {cert.title}
                        </h3>
                        {cert.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {cert.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Test Preview */}
                      <button
                        type="button"
                        onClick={() => openTestPreview(cert.title, cert.fileId || cert.driveUrl, cert.issuer)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                        title="Preview PDF Embed"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Google Drive Direct */}
                      <a
                        href={view}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Save single default to DB */}
                      {!isStoredInDb && (
                        <button
                          type="button"
                          onClick={() => handleSaveSingleDefault(cert)}
                          className="p-2 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Save this default certificate to Database"
                        >
                          <Database className="w-4 h-4" />
                        </button>
                      )}

                      {/* Order Controls */}
                      {isStoredInDb && (
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveOrder(index, "up")}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === certificates.length - 1}
                            onClick={() => moveOrder(index, "down")}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleEdit(cert)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors cursor-pointer"
                        title="Edit Certificate"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(cert.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Certificate"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PDF Embed Test Modal */}
      {previewCert && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewCert(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] bg-background border border-border/70 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-border/50 flex items-center justify-between gap-4 bg-muted/20">
              <div className="min-w-0">
                {previewCert.issuer && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {previewCert.issuer}
                  </span>
                )}
                <h3 className="text-base font-bold font-lora text-foreground truncate mt-1">
                  {previewCert.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getDriveViewUrl(previewCert.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-accent text-foreground transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewCert(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 w-full bg-black/5 dark:bg-black/40 min-h-[55vh] sm:min-h-[70vh]">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-xs font-mono">Loading Google Drive PDF...</span>
                </div>
              )}
              <iframe
                src={getDrivePdfPreviewUrl(previewCert.url)}
                title={previewCert.title}
                className="w-full h-full min-h-[55vh] sm:min-h-[70vh] border-0"
                allow="autoplay"
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
