import Link from "next/link";
import { Terminal, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs p-8 text-center space-y-6 shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary font-mono">
          <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
          exit_code: 404
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-lora text-foreground tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            The path you requested does not exist or has been relocated.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
