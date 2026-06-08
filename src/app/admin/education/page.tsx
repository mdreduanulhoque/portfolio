"use client";

import React, { useState } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { db } from "@/lib/firebase";
import { doc, addDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import type { Education } from "@/lib/data";
import toast from "react-hot-toast";
import { Plus, Trash, Edit2, Save, X, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminEducationPage() {
  const { data: education, loading } = useFirestoreCollection<Education>("education");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [institution, setInstitution] = useState("");
  const [period, setPeriod] = useState("");
  const [degree, setDegree] = useState("");
  const [grade, setGrade] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = () => {
    setInstitution("");
    setPeriod("");
    setDegree("");
    setGrade("");
    setIsCurrent(false);
    setEditingId(null);
  };

  const handleEdit = (edu: Education) => {
    setEditingId(edu.id);
    setInstitution(edu.institution);
    setPeriod(edu.period);
    setDegree(edu.degree);
    setGrade(edu.grade);
    setIsCurrent(edu.isCurrent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const data = {
      institution,
      period,
      degree,
      grade,
      isCurrent,
      order: editingId ? (education.find(e => e.id === editingId)?.order ?? 0) : education.length,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "education", editingId), data);
        toast.success("Education entry updated!");
      } else {
        await addDoc(collection(db, "education"), data);
        toast.success("Education entry added!");
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
      await deleteDoc(doc(db, "education", id));
      toast.success("Entry deleted!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= education.length) return;

    const itemA = education[index];
    const itemB = education[targetIndex];

    try {
      await updateDoc(doc(db, "education", itemA.id), { order: itemB.order });
      await updateDoc(doc(db, "education", itemB.id), { order: itemA.order });
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
        <h1 className="text-3xl font-bold font-lora text-foreground">Education Manager</h1>
        <p className="text-muted-foreground font-mono text-xs mt-1">Configure academic timeline entries.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-4 p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <h2 className="text-lg font-bold font-lora text-foreground mb-4">
            {editingId ? "Edit Entry" : "Create Entry"}
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Institution</label>
            <input
              type="text"
              required
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Period (e.g. 2023 - 2024)</label>
            <input
              type="text"
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Degree / Focus</label>
            <input
              type="text"
              required
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Grade / GPA</label>
            <input
              type="text"
              required
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
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
            <label htmlFor="isCurrent" className="text-xs font-bold text-muted-foreground uppercase cursor-pointer">Currently Studying Here</label>
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
              Academic Timeline
            </div>
            <div className="divide-y divide-border/40">
              {education.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs font-mono">
                  No records stored yet. Using fallback values on home page.
                </div>
              ) : (
                education.map((edu, idx) => (
                  <div key={edu.id} className="p-4 flex items-start gap-4 justify-between group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground">{edu.institution}</h4>
                        {edu.isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-primary font-bold">{edu.period}</p>
                      <p className="text-xs text-muted-foreground">{edu.degree}</p>
                      <p className="text-xs font-mono bg-muted inline-block px-2 py-0.5 rounded">{edu.grade}</p>
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
                        disabled={idx === education.length - 1}
                        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(edu)}
                        className="p-1.5 rounded-lg border border-border bg-background text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(edu.id)}
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
