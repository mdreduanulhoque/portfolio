"use client";

import React, { useState } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { db } from "@/lib/firebase";
import { doc, addDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import type { Achievement } from "@/lib/data";
import toast from "react-hot-toast";
import { Save, X, Plus, Edit2, Trash, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminAchievementsPage() {
  const { data: achievements, loading } = useFirestoreCollection<Achievement>("achievements");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [emoji, setEmoji] = useState("🏆");
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setEmoji("🏆");
    setEditingId(null);
  };

  const handleEdit = (ach: Achievement) => {
    setEditingId(ach.id);
    setTitle(ach.title);
    setSubtitle(ach.subtitle);
    setEmoji(ach.emoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const data = {
      title,
      subtitle,
      emoji,
      order: editingId ? (achievements.find(e => e.id === editingId)?.order ?? 0) : achievements.length,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "achievements", editingId), data);
        toast.success("Achievement updated!");
      } else {
        await addDoc(collection(db, "achievements"), data);
        toast.success("Achievement added!");
      }
      resetForm();
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    try {
      await deleteDoc(doc(db, "achievements", id));
      toast.success("Achievement deleted!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= achievements.length) return;

    const itemA = achievements[index];
    const itemB = achievements[targetIndex];

    try {
      await updateDoc(doc(db, "achievements", itemA.id), { order: itemB.order });
      await updateDoc(doc(db, "achievements", itemB.id), { order: itemA.order });
      toast.success("Order updated!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to reorder: ${err.message}`);
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
        <h1 className="text-3xl font-bold font-lora text-foreground">Achievements Manager</h1>
        <p className="text-muted-foreground font-mono text-xs mt-1">Configure honor badges and runner-up titles.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-4 p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <h2 className="text-lg font-bold font-lora text-foreground mb-4">
            {editingId ? "Edit Entry" : "Create Entry"}
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Achievement Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 1st Runner-up"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Subtitle / Location / Context</label>
            <input
              type="text"
              required
              placeholder="at KickStart Contest"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Emoji Icon</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                maxLength={4}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-16 text-center px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-lg"
              />
              <div className="flex flex-wrap gap-1 items-center">
                {["🏆", "🥉", "🥈", "🥇", "⭐", "💻", "🚀", "🎓"].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`p-1.5 rounded-lg border text-sm transition-colors cursor-pointer ${
                      emoji === em ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {editingId ? "Update Entry" : "Save Entry"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="p-2.5 rounded-lg border border-border bg-background text-muted-foreground hover:bg-accent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Right Column: Listing */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-border/40 font-lora font-bold text-foreground">
              Achievements & Medals
            </div>
            <div className="divide-y divide-border/40">
              {achievements.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs font-mono">
                  No records stored yet. Using fallback values on home page.
                </div>
              ) : (
                achievements.map((ach, idx) => (
                  <div key={ach.id} className="p-4 flex items-center gap-4 justify-between group">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none pt-0.5">{ach.emoji}</span>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-foreground">{ach.title}</h4>
                        <p className="text-xs text-muted-foreground">{ach.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveOrder(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveOrder(idx, "down")}
                        disabled={idx === achievements.length - 1}
                        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(ach)}
                        className="p-1.5 rounded-lg border border-border bg-background text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ach.id)}
                        className="p-1.5 rounded-lg border border-border bg-background text-red-500 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
