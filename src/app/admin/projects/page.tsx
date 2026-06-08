"use client";

import React, { useState } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { db } from "@/lib/firebase";
import { doc, addDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import type { Project } from "@/lib/data";
import toast from "react-hot-toast";
import { Save, X, Plus, Edit2, Trash, ArrowUp, ArrowDown, Sparkles } from "lucide-react";

export default function AdminProjectsPage() {
  const { data: projects, loading } = useFirestoreCollection<Project>("projects");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [liveLink, setLiveLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Array inputs
  const [newTech, setNewTech] = useState("");
  const [newFeature, setNewFeature] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTechStack([]);
    setFeatures([]);
    setLiveLink("");
    setGithubLink("");
    setEditingId(null);
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setTechStack(project.techStack || []);
    setFeatures(project.features || []);
    setLiveLink(project.liveLink || "");
    setGithubLink(project.githubLink || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const data = {
      title,
      description,
      techStack,
      features,
      liveLink,
      githubLink,
      order: editingId ? (projects.find(p => p.id === editingId)?.order ?? 0) : projects.length,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "projects", editingId), data);
        toast.success("Project updated!");
      } else {
        await addDoc(collection(db, "projects"), data);
        toast.success("Project added!");
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
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      toast.success("Project deleted!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    }
  };

  // Tech stack handlers
  const addTech = () => {
    if (!newTech.trim()) return;
    if (techStack.includes(newTech.trim())) return;
    setTechStack((prev) => [...prev, newTech.trim()]);
    setNewTech("");
  };

  const removeTech = (val: string) => {
    setTechStack((prev) => prev.filter((t) => t !== val));
  };

  // Features handlers
  const addFeature = () => {
    if (!newFeature.trim()) return;
    if (features.includes(newFeature.trim())) return;
    setFeatures((prev) => [...prev, newFeature.trim()]);
    setNewFeature("");
  };

  const removeFeature = (val: string) => {
    setFeatures((prev) => prev.filter((f) => f !== val));
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const itemA = projects[index];
    const itemB = projects[targetIndex];

    try {
      await updateDoc(doc(db, "projects", itemA.id), { order: itemB.order });
      await updateDoc(doc(db, "projects", itemB.id), { order: itemA.order });
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
        <h1 className="text-3xl font-bold font-lora text-foreground">Projects Manager</h1>
        <p className="text-muted-foreground font-mono text-xs mt-1">Configure selected works and showcases.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-6 space-y-4 p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <h2 className="text-lg font-bold font-lora text-foreground mb-4">
            {editingId ? "Edit Project" : "Create Project"}
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Short Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary font-sans leading-relaxed text-xs"
            />
          </div>

          {/* Dynamic Tech Stack array */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Tech Stack Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {techStack.map((tech) => (
                <span key={tech} className="flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] uppercase font-bold tracking-wider">
                  {tech}
                  <button type="button" onClick={() => removeTech(tech)} className="hover:text-red-500 cursor-pointer">✕</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. React"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
              />
              <button type="button" onClick={addTech} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs cursor-pointer">Add</button>
            </div>
          </div>

          {/* Dynamic Features array */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Key Features
            </label>
            <div className="space-y-1.5 mb-2">
              {features.map((feat, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 border border-border/40 rounded-lg text-xs font-sans">
                  <span>{feat}</span>
                  <button type="button" onClick={() => removeFeature(feat)} className="text-muted-foreground hover:text-red-500 cursor-pointer">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Sound effects for each color"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
              />
              <button type="button" onClick={addFeature} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs cursor-pointer">Add</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Live Link</label>
              <input
                type="url"
                value={liveLink}
                onChange={(e) => setLiveLink(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">GitHub Link</label>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {editingId ? "Update Project" : "Save Project"}
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
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-border/40 font-lora font-bold text-foreground">
              Project Showcase
            </div>
            <div className="divide-y divide-border/40">
              {projects.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs font-mono">
                  No records stored yet. Using fallback values on home page.
                </div>
              ) : (
                projects.map((proj, idx) => (
                  <div key={proj.id} className="p-4 flex items-start gap-4 justify-between group">
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-bold text-foreground">{proj.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proj.techStack?.map((tech) => (
                          <span key={tech} className="px-2 py-0.5 bg-muted text-foreground border border-border rounded text-[9px] uppercase font-bold tracking-wider">
                            {tech}
                          </span>
                        ))}
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
                        disabled={idx === projects.length - 1}
                        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(proj)}
                        className="p-1.5 rounded-lg border border-border bg-background text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(proj.id)}
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
