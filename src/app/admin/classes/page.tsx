"use client";

import React, { useState } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { db } from "@/lib/firebase";
import { doc, addDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import type { ClassItem } from "@/lib/data";
import toast from "react-hot-toast";
import { Save, X, Plus, Edit2, Trash, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminClassesPage() {
  const { data: classes, loading } = useFirestoreCollection<ClassItem>("classes");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [videoId, setVideoId] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setVideoId("");
    setDescription("");
    setUrl("");
    setEditingId(null);
  };

  const handleEdit = (cl: ClassItem) => {
    setEditingId(cl.id);
    setTitle(cl.title);
    setVideoId(cl.videoId);
    setDescription(cl.description);
    setUrl(cl.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const data = {
      title,
      videoId,
      description,
      url,
      order: editingId ? (classes.find(c => c.id === editingId)?.order ?? 0) : classes.length,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "classes", editingId), data);
        toast.success("Class entry updated!");
      } else {
        await addDoc(collection(db, "classes"), data);
        toast.success("Class entry added!");
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
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await deleteDoc(doc(db, "classes", id));
      toast.success("Class entry deleted!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= classes.length) return;

    const itemA = classes[index];
    const itemB = classes[targetIndex];

    try {
      await updateDoc(doc(db, "classes", itemA.id), { order: itemB.order });
      await updateDoc(doc(db, "classes", itemB.id), { order: itemA.order });
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
        <h1 className="text-3xl font-bold font-lora text-foreground">Classes Manager</h1>
        <p className="text-muted-foreground font-mono text-xs mt-1">Configure online classes and YouTube tutorials.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-4 p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <h2 className="text-lg font-bold font-lora text-foreground mb-4">
            {editingId ? "Edit Class" : "Create Class"}
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Class Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">YouTube Video ID (e.g. uobWZ7FA6XM)</label>
            <input
              type="text"
              required
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Class URL (e.g. https://youtu.be/uobWZ7FA6XM)</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary font-sans leading-relaxed text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {editingId ? "Update Class" : "Save Class"}
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
              Teaching Archive
            </div>
            <div className="divide-y divide-border/40">
              {classes.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs font-mono">
                  No records stored yet. Using fallback values on home page.
                </div>
              ) : (
                classes.map((cl, idx) => (
                  <div key={cl.id} className="p-4 flex items-start gap-4 justify-between group">
                    <div className="flex gap-3 items-start flex-1">
                      <div className="relative w-20 aspect-video rounded overflow-hidden bg-muted shrink-0 border border-border/50">
                        <img
                          src={`https://img.youtube.com/vi/${cl.videoId}/default.jpg`}
                          alt="thumbnail"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-foreground line-clamp-1">{cl.title}</h4>
                        <p className="text-[10px] text-primary font-mono">{cl.videoId}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-sans">{cl.description}</p>
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
                        disabled={idx === classes.length - 1}
                        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(cl)}
                        className="p-1.5 rounded-lg border border-border bg-background text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cl.id)}
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
