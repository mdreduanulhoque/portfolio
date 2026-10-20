"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { db } from "@/lib/firebase";
import { doc, addDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import type { Project } from "@/lib/data";
import { swapCollectionOrder, normalizeImageUrl, getProjectImageUrl } from "@/lib/data";
import toast from "react-hot-toast";
import {
  Save,
  X,
  Edit2,
  Trash,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Github,
  Code2,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function AdminProjectsPage() {
  const { data: projects, loading } = useFirestoreCollection<Project>("projects");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
    setImageUrl("");
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
    setImageUrl(project.imageUrl || "");
    setTechStack(project.techStack || []);
    setFeatures(project.features || []);
    setLiveLink(project.liveLink || "");
    setGithubLink(project.githubLink || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const data: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      techStack,
      features,
      liveLink: liveLink.trim(),
      githubLink: githubLink.trim(),
      imageUrl: imageUrl.trim(),
      order: editingId ? (projects.find((p) => p.id === editingId)?.order ?? 0) : projects.length,
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast.error(`Error: ${msg}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      toast.success("Project deleted!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast.error(`Error: ${msg}`);
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
    try {
      const swapped = await swapCollectionOrder("projects", projects, index, direction);
      if (swapped) toast.success("Order updated!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast.error(`Failed to reorder: ${msg}`);
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
      {/* Header with Public Page Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary font-mono mb-2">
            <Code2 className="w-3.5 h-3.5" />
            ~/admin/projects
          </div>
          <h1 className="text-3xl font-bold font-lora text-foreground">Projects Manager</h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            Configure selected works, software projects, tech stacks, screenshots, and live showcases.
          </p>
        </div>

        <Link
          href="/projects"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-accent text-foreground text-xs font-mono transition-colors shrink-0 cursor-pointer"
        >
          <span>View Public Page</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-6 space-y-4 p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-lora text-foreground">
              {editingId ? "Edit Project" : "Create Project"}
            </h2>
            {editingId && (
              <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                Editing
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Simon Game"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Project Screenshot / Image URL
              </label>
              <button
                type="button"
                onClick={() => {
                  const autoImg = getProjectImageUrl({ title, githubLink, liveLink });
                  if (autoImg) {
                    setImageUrl(autoImg);
                    toast.success("Screenshot preview auto-detected!");
                  } else {
                    toast.error("Could not auto-detect preview. Please enter a valid URL or GitHub repo.");
                  }
                }}
                className="px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-[10px] font-mono flex items-center gap-1 text-primary cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> Auto-Detect Preview
              </button>
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="e.g. /projects/campus-eats.png or https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Displayed in the project card thumbnail. Supports local screenshots (/projects/...), GitHub OpenGraph, or direct image links.
            </p>
          </div>

          {/* Live Screenshot Preview */}
          {imageUrl && (
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">
                Detected Screenshot Preview
              </label>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/40 border border-border/60">
                <Image
                  src={normalizeImageUrl(imageUrl)}
                  alt="Detected project preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Short Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of the project, problem solved, and technical architecture..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary font-sans leading-relaxed text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Live Demo Link</label>
              <input
                type="url"
                value={liveLink}
                onChange={(e) => setLiveLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">GitHub Repo Link</label>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          {/* Tech Stack Array Field */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <label className="text-xs font-bold text-muted-foreground uppercase">Tech Stack</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="Add tech (e.g. Next.js, TypeScript)..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
              />
              <button
                type="button"
                onClick={addTech}
                className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold text-xs"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Key Features Array Field */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <label className="text-xs font-bold text-muted-foreground uppercase">Key Features</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="Add feature highlight..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold text-xs"
              >
                Add
              </button>
            </div>
            <div className="space-y-1 pt-1">
              {features.map((feat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-secondary/30 border border-border/40 text-xs"
                >
                  <span className="line-clamp-1">{feat}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(feat)}
                    className="text-muted-foreground hover:text-red-500 shrink-0 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? "Update Project" : "Save Project"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                aria-label="Cancel editing"
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
            <div className="p-4 border-b border-border/40 font-lora font-bold text-foreground flex items-center justify-between">
              <span>Project Showcase ({projects.length})</span>
              <span className="text-xs font-mono text-muted-foreground">Order: Top to Bottom</span>
            </div>
            <div className="divide-y divide-border/40">
              {projects.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs font-mono">
                  No records stored yet. Using fallback values on public site.
                </div>
              ) : (
                projects.map((proj, idx) => (
                  <div key={proj.id} className="p-4 flex items-start gap-4 justify-between group">
                    <div className="flex gap-3 items-start flex-1 min-w-0">
                      {/* Screenshot Thumbnail */}
                      <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50">
                        {(() => {
                          const thumb = getProjectImageUrl(proj);
                          return thumb ? (
                            <Image
                              src={thumb}
                              alt={proj.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="w-4 h-4 opacity-50" />
                            </div>
                          );
                        })()}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="font-bold text-foreground text-sm line-clamp-1">{proj.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {proj.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {proj.techStack?.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 bg-muted text-foreground border border-border rounded text-[9px] uppercase font-bold tracking-wider"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        {(proj.githubLink || proj.liveLink) && (
                          <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-muted-foreground">
                            {proj.githubLink && (
                              <a
                                href={proj.githubLink}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-primary inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Github className="w-3 h-3" /> GitHub
                              </a>
                            )}
                            {proj.liveLink && (
                              <a
                                href={proj.liveLink}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-primary inline-flex items-center gap-1 cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" /> Live Demo
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveOrder(idx, "up")}
                        disabled={idx === 0}
                        aria-label={`Move ${proj.title} up`}
                        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveOrder(idx, "down")}
                        disabled={idx === projects.length - 1}
                        aria-label={`Move ${proj.title} down`}
                        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(proj)}
                        aria-label={`Edit ${proj.title}`}
                        className="p-1.5 rounded-lg border border-border bg-background text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(proj.id)}
                        aria-label={`Delete ${proj.title}`}
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
