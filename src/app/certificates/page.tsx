"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { Certificate } from "@/lib/data";
import {
  fallbackCertificates,
  getDrivePdfPreviewUrl,
  getDriveThumbnailUrl,
  getDriveViewUrl,
  GOOGLE_DRIVE_CERTIFICATES_FOLDER,
} from "@/lib/data";
import {
  Award,
  ArrowLeft,
  ExternalLink,
  Eye,
  FileText,
  X,
  Calendar,
  FolderArchive,
  Loader2,
} from "lucide-react";

export default function CertificatesPage() {
  const { data: certificatesFromDb, loading } = useFirestoreCollection<Certificate>("certificates");

  // Preview Modal state
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCert(null);
      }
    };
    if (selectedCert) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedCert]);

  // Determine active certificates
  const allCertificates = useMemo(() => {
    if (certificatesFromDb && certificatesFromDb.length > 0) {
      return [...certificatesFromDb].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return fallbackCertificates;
  }, [certificatesFromDb]);

  const handleOpenPreview = (cert: Certificate) => {
    setIframeLoading(true);
    setSelectedCert(cert);
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border/40 pb-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary font-mono">
            <Award className="w-3.5 h-3.5" />
            ~/achievements/certificates
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-lora text-foreground tracking-tight">
            Certificates & Recognitions
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            The complete archive of verified technical certifications, competitive programming honors, and leadership recognitions preserved in original high-definition PDF format.
          </p>
        </div>

        <a
          href={GOOGLE_DRIVE_CERTIFICATES_FOLDER}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-mono font-medium rounded-xl border border-border/70 bg-card hover:bg-accent text-foreground transition-all duration-200 shadow-sm shrink-0 w-fit cursor-pointer group"
        >
          <FolderArchive className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span>Google Drive Archive</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </a>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {allCertificates.map((cert) => {
          const fileIdentifier = cert.fileId || cert.driveUrl;
          const thumbnailUrl = getDriveThumbnailUrl(fileIdentifier);
          const viewUrl = getDriveViewUrl(fileIdentifier);

          return (
            <div
              key={cert.id}
              className="group relative flex flex-col bg-background/50 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-primary/5 hover:-translate-y-1"
            >
                  {/* Thumbnail Area */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/30 border-b border-border/40">
                    {thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt={cert.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <FileText className="w-10 h-10 stroke-1" />
                        <span className="text-xs font-mono">PDF Document</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(cert)}
                        className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview PDF
                      </button>
                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-background/90 text-foreground hover:bg-background hover:text-primary transition-colors shadow-lg cursor-pointer"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {cert.issuer}
                        </span>
                        {cert.issueDate && (
                          <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {cert.issueDate}
                          </span>
                        )}
                      </div>

                      <h2 className="font-bold text-foreground font-lora text-base sm:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {cert.title}
                      </h2>

                      {cert.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {cert.description}
                        </p>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3.5 border-t border-border/40 flex items-center justify-between gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(cert)}
                        className="font-semibold text-primary hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview PDF
                      </button>

                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Google Drive <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Interactive Google Drive PDF Preview Modal */}
      {selectedCert && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] bg-background border border-border/70 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border/50 flex items-center justify-between gap-4 bg-muted/20">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {selectedCert.issuer}
                  </span>
                  {selectedCert.issueDate && (
                    <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                      • {selectedCert.issueDate}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold font-lora text-foreground truncate">
                  {selectedCert.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getDriveViewUrl(selectedCert.fileId || selectedCert.driveUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-accent text-foreground transition-colors cursor-pointer"
                  title="Open in Google Drive"
                >
                  <span>Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Iframe Body */}
            <div className="relative flex-1 w-full bg-black/5 dark:bg-black/40 min-h-[50vh] sm:min-h-[68vh]">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-xs font-mono">Loading PDF preview from Google Drive...</span>
                </div>
              )}
              <iframe
                src={getDrivePdfPreviewUrl(selectedCert.fileId || selectedCert.driveUrl)}
                title={selectedCert.title}
                className="w-full h-full min-h-[50vh] sm:min-h-[68vh] border-0"
                allow="autoplay"
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
