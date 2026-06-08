"use client";

import React, { useState } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { db } from "@/lib/firebase";
import { doc, addDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import type { Experience } from "@/lib/data";
import toast from "react-hot-toast";
import { Save, X, Plus, Edit2, Trash, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminExperiencePage() {
  const { data: experience, loading } = useFirestoreCollection<Experience>("experience");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = () => {
    setRole("");
    setOrganization("");
    setPeriod("");
    setDescription("");
    setIsCurrent(false);
    setEditingId(null);
  };

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id);
    setRole(exp.role);
    setOrganization(exp.organization);
    setPeriod(exp.period);
    setDescription(exp.description);
    setIsCurrent(exp.isCurrent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const data = {
      role,
      organization,
      period,
      description,
      isCurrent,
      order: editingId ? (experience.find(e => e.id === editingId)?.order ?? 0) : experience.length,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "experience", editingId), data);
        toast.success("Experience entry updated!");
      } else {
        await addDoc(collection(db, "experience"), data);
        toast.success("Experience entry added!");
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
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteDoc(doc(db, "experience", id));
      toast.success("Entry deleted!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experience.length) return;

    const itemA = experience[index];
    const itemB = experience[targetIndex];

    try {
      await updateDoc(doc(db, "experience", itemA.id), { order: itemB.order });
      await updateDoc(doc(db, "experience", itemB.id), { order: itemA.order });
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
        <h1 className="text-3xl font-bold font-lora text-foreground">Experience Manager</h1>
        <p className="text-muted-foreground font-mono text-xs mt-1">Configure professional and voluntary timeline entries.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-4 p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <h2 className="text-lg font-bold font-lora text-foreground mb-4">
            {editingId ? "Edit Entry" : "Create Entry"}
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Role / Position</label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Organization</label>
            <input
              type="text"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Period (e.g. 2025 - Present)</label>
            <input
              type="text"
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Description / Bullet Points</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary font-sans leading-relaxed text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="rounded border-border bg-background focus:ring-0 text-primary w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isCurrent" className="text-xs font-bold text-muted-foreground uppercase cursor-pointer">Currently Working Here</label>
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
              Experience Timeline
            </div>
            <div className="divide-y divide-border/40">
              {experience.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs font-mono">
                  No records stored yet. Using fallback values on home page.
                </div>
              ) : (
                experience.map((exp, idx) => (
                  <div key={exp.id} className="p-4 flex items-start gap-4 justify-between group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground">{exp.role}</h4>
                        {exp.isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-primary font-bold">{exp.organization} • {exp.period}</p>
                      <p className="text-xs text-muted-foreground font-sans leading-relaxed mt-1.5">{exp.description}</p>
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
                        disabled={idx === experience.length - 1}
                        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(exp)}
                        className="p-1.5 rounded-lg border border-border bg-background text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(exp.id)}
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
