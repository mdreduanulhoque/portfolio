"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error:", error.message);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs p-8 text-center space-y-6 shadow-xl">
        <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
          <AlertTriangle className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-lora text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            An unexpected error occurred while rendering this view. You can try reloading the section or return to the home page.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-mono font-medium hover:bg-accent transition-colors"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
