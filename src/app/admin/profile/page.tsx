"use client";

import React, { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useFirestoreDoc } from "@/hooks/useFirestoreDoc";
import type { Profile } from "@/lib/data";
import toast from "react-hot-toast";
import { Save, Upload, FileText, Sparkles, Plus, Trash } from "lucide-react";

export default function AdminProfilePage() {
  const { data: profile, loading } = useFirestoreDoc<Profile>("profile", "main");
  const [formData, setFormData] = useState<Profile>({
    name: "",
    tagline: "",
    badges: [],
    location: "",
    eduStatus: "",
    statusLine: "",
    hobbies: [],
    philosophyTitle: "",
    philosophyParagraphs: [],
    profileImageUrl: "",
    resumeUrl: "",
  });

  const [saving, setSaving] = useState(false);
  const [newBadge, setNewBadge] = useState("");
  const [newHobby, setNewHobby] = useState("");
  const [newPara, setNewPara] = useState("");

  // Storage uploads
  const [imgUploading, setImgUploading] = useState(false);
  const [docUploading, setDocUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);

    try {
      const storageRef = ref(storage, `profile/profile_image_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData((prev) => ({ ...prev, profileImageUrl: url }));
      toast.success("Profile image uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Image upload failed: ${err.message}`);
    } finally {
      setImgUploading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(true);

    try {
      const storageRef = ref(storage, `profile/resume_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData((prev) => ({ ...prev, resumeUrl: url }));
      toast.success("Resume uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Resume upload failed: ${err.message}`);
    } finally {
      setDocUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "profile", "main"), formData);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Badge list management
  const addBadge = () => {
    if (!newBadge.trim()) return;
    setFormData((prev) => ({ ...prev, badges: [...prev.badges, newBadge.trim()] }));
    setNewBadge("");
  };

  const removeBadge = (idx: number) => {
    setFormData((prev) => ({ ...prev, badges: prev.badges.filter((_, i) => i !== idx) }));
  };

  // Hobby list management
  const addHobby = () => {
    if (!newHobby.trim()) return;
    setFormData((prev) => ({ ...prev, hobbies: [...prev.hobbies, newHobby.trim()] }));
    setNewHobby("");
  };

  const removeHobby = (idx: number) => {
    setFormData((prev) => ({ ...prev, hobbies: prev.hobbies.filter((_, i) => i !== idx) }));
  };

  // Bio paragraph list management
  const addPara = () => {
    if (!newPara.trim()) return;
    setFormData((prev) => ({ ...prev, philosophyParagraphs: [...prev.philosophyParagraphs, newPara.trim()] }));
    setNewPara("");
  };

  const removePara = (idx: number) => {
    setFormData((prev) => ({ ...prev, philosophyParagraphs: prev.philosophyParagraphs.filter((_, i) => i !== idx) }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-lora text-foreground">Profile Configuration</h1>
        <p className="text-muted-foreground font-mono text-xs mt-1">Update global portfolio variables.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 font-mono text-sm">
        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Tagline / Quote</label>
              <textarea
                required
                rows={3}
                name="tagline"
                value={formData.tagline}
                onChange={handleTextChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-primary font-sans leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Terminal Location</label>
              <input
                type="text"
                required
                name="location"
                value={formData.location}
                onChange={handleTextChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Terminal Education Status</label>
              <input
                type="text"
                required
                name="eduStatus"
                value={formData.eduStatus}
                onChange={handleTextChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Terminal Status Line</label>
              <input
                type="text"
                required
                name="statusLine"
                value={formData.statusLine}
                onChange={handleTextChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Files/Images Column */}
          <div className="space-y-6">
            {/* Profile image upload */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm space-y-4">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Profile Image</label>
              {formData.profileImageUrl && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted">
                  <img src={formData.profileImageUrl} alt="Preview" className="object-cover w-full h-full" />
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-xs">
                  <Upload className="w-4 h-4 text-primary" />
                  {imgUploading ? "Uploading..." : "Select File"}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <span className="text-[10px] text-muted-foreground max-w-[150px] leading-tight">Will upload to Firebase Storage</span>
              </div>
            </div>

            {/* Resume upload */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm space-y-4">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Resume PDF</label>
              {formData.resumeUrl && (
                <a
                  href={formData.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  View Current Resume
                </a>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-xs">
                  <Upload className="w-4 h-4 text-primary" />
                  {docUploading ? "Uploading..." : "Select PDF"}
                  <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                </label>
                <span className="text-[10px] text-muted-foreground max-w-[150px] leading-tight">Will upload to Firebase Storage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrays Section */}
        <div className="grid md:grid-cols-2 gap-8 border-t border-border/40 pt-8">
          {/* Badges */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Badges
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.badges.map((badge, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full border border-border/50 text-xs">
                  {badge}
                  <button type="button" onClick={() => removeBadge(i)} className="text-muted-foreground hover:text-red-500 cursor-pointer">✕</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Computer Science Student"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card focus:outline-none"
              />
              <button type="button" onClick={addBadge} className="p-2 rounded-lg bg-primary text-white cursor-pointer"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Hobbies */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Hobbies
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.hobbies.map((hobby, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full border border-border/50 text-xs">
                  {hobby}
                  <button type="button" onClick={() => removeHobby(i)} className="text-muted-foreground hover:text-red-500 cursor-pointer">✕</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Reading"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card focus:outline-none"
              />
              <button type="button" onClick={addHobby} className="p-2 rounded-lg bg-primary text-white cursor-pointer"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Philosophy / Bio Paragraphs */}
        <div className="border-t border-border/40 pt-8 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-muted-foreground uppercase block">Philosophy Paragraphs (About Section)</label>
            <input
              type="text"
              name="philosophyTitle"
              value={formData.philosophyTitle}
              onChange={handleTextChange}
              placeholder="Title (e.g. The Philosophy)"
              className="px-3 py-1.5 rounded-lg border border-border bg-card focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-3">
            {formData.philosophyParagraphs.map((para, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/40 flex items-start gap-4 justify-between font-sans leading-relaxed">
                <p className="flex-1 text-sm">{para}</p>
                <button
                  type="button"
                  onClick={() => removePara(i)}
                  className="text-muted-foreground hover:text-red-500 cursor-pointer shrink-0 mt-0.5"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <textarea
              rows={3}
              placeholder="Add bio paragraph..."
              value={newPara}
              onChange={(e) => setNewPara(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-primary font-sans leading-relaxed text-sm"
            />
            <button
              type="button"
              onClick={addPara}
              className="px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs tracking-wider uppercase cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Paragraph
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t border-border/40 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving || imgUploading || docUploading}
            className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
