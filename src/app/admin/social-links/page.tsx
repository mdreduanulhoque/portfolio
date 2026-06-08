"use client";

import React, { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFirestoreDoc } from "@/hooks/useFirestoreDoc";
import type { SocialLinks } from "@/lib/data";
import toast from "react-hot-toast";
import { Save } from "lucide-react";

export default function AdminSocialLinksPage() {
  const { data: socialLinks, loading } = useFirestoreDoc<SocialLinks>("social_links", "main");
  const [formData, setFormData] = useState<SocialLinks>({
    email: "",
    linkedin: "",
    github: "",
    facebook: "",
    resumeUrl: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (socialLinks) {
      setFormData(socialLinks);
    }
  }, [socialLinks]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "social_links", "main"), formData);
      toast.success("Social links updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
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
      <div>
        <h1 className="text-3xl font-bold font-lora text-foreground">Social Links Manager</h1>
        <p className="text-muted-foreground font-mono text-xs mt-1">Configure your public contact endpoints and profiles.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
          <input
            type="email"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">LinkedIn URL</label>
          <input
            type="url"
            required
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">GitHub URL</label>
          <input
            type="url"
            required
            name="github"
            value={formData.github}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Facebook URL</label>
          <input
            type="url"
            required
            name="facebook"
            value={formData.facebook}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">CV/Resume URL Override</label>
          <input
            type="text"
            name="resumeUrl"
            value={formData.resumeUrl}
            onChange={handleChange}
            placeholder="e.g. /md_reduanul_hoque_resume.pdf or Google Drive link"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary"
          />
          <p className="text-[10px] text-muted-foreground pt-1">Note: You can override the static PDF using this URL parameter.</p>
        </div>

        <div className="border-t border-border/40 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Social Links"}
          </button>
        </div>
      </form>
    </div>
  );
}
