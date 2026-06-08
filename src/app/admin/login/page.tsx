"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Terminal, KeyRound, Mail, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const { user, signIn, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      router.push("/admin");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      toast.success("Welcome back, commander.");
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in. Please verify credentials.");
      toast.error("Access denied.");
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      <div className="w-full max-w-md relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-2xl blur-lg opacity-20 pointer-events-none"></div>
        <div className="relative rounded-2xl border border-border/50 bg-[#0f172a] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center px-6 py-4 bg-[#1e293b] border-b border-border/20">
            <div className="flex gap-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="flex-1 text-center text-xs text-slate-400 font-mono flex items-center justify-center">
              <Terminal className="w-4 h-4 mr-2 text-primary" />
              ssh admin@reduan.hoque
            </div>
          </div>

          {/* Body */}
          <div className="p-8 font-mono text-sm space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100 font-lora">Command Center Authentication</h2>
              <p className="text-slate-400 text-xs">Enter credentials to unlock write permissions.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-xs leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-400 text-xs block font-medium">EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b]/60 border border-slate-700/50 rounded-lg focus:outline-none focus:border-primary text-slate-100 placeholder:text-slate-600 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-xs block font-medium">PASSWORD</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b]/60 border border-slate-700/50 rounded-lg focus:outline-none focus:border-primary text-slate-100 placeholder:text-slate-600 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-4 py-3 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "EXECUTE SIGN_IN"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
