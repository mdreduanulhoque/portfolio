"use client";

import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import type { BlogPost } from "@/lib/data";
import { PostContent } from "@/components/blog/post-content";
import toast from "react-hot-toast";
import {
  Save,
  X,
  Edit2,
  Trash,
  Globe,
  Lock,
  ExternalLink,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  Code,
  Image as ImageIcon,
  Video,
  List,
  ListOrdered,
  Eye,
  PenLine,
  Sparkles,
  Columns,
} from "lucide-react";

function UpdatesManagerContent() {
  const searchParams = useSearchParams();
  const editParamId = searchParams.get("edit");

  const { data: posts, loading } = useFirestoreCollection<BlogPost>("updates");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Editor View Mode: "write", "preview", "split"
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("write");

  // Modals for Image / Video insertion
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageCaptionInput, setImageCaptionInput] = useState("");

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [posts]);

  const generateSlug = (rawTitle: string) => {
    return rawTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleEdit = React.useCallback((post: BlogPost) => {
    setEditingId(post.id);
    setTitle(post.title || "");
    setSlug(post.slug || generateSlug(post.title || ""));
    setExcerpt(post.excerpt || "");
    setContent(post.content || "");
    setCoverImage(post.coverImage || "");
    setTags(post.tags || []);
    setIsPublic(post.isPublic !== false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Load post for editing if editParamId is present
  useEffect(() => {
    if (editParamId && posts.length > 0) {
      const target = posts.find((p) => p.id === editParamId);
      if (target) {
        handleEdit(target);
      }
    }
  }, [editParamId, posts, handleEdit]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      setSlug(generateSlug(val));
    }
  };

  const calculateReadTime = (text: string) => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverImage("");
    setTags([]);
    setIsPublic(true);
    setViewMode("write");
  };

  const handleToggleVisibility = async (post: BlogPost) => {
    try {
      const newStatus = !post.isPublic;
      await updateDoc(doc(db, "updates", post.id), {
        isPublic: newStatus,
        updatedAt: new Date().toISOString(),
      });
      toast.success(newStatus ? "Post is now Public!" : "Post moved to Private Archive!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast.error(`Error toggling visibility: ${msg}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this post?")) return;
    try {
      await deleteDoc(doc(db, "updates", id));
      toast.success("Post deleted!");
      if (editingId === id) resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast.error(`Delete failed: ${msg}`);
    }
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    const clean = newTag.trim();
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setNewTag("");
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  // Helper to insert markdown at textarea cursor
  const insertTextAtCursor = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + before + defaultText + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;

    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 50);
  };

  // Modal inserters
  const confirmInsertImage = () => {
    if (!imageUrlInput.trim()) {
      toast.error("Please provide an Image URL");
      return;
    }
    const caption = imageCaptionInput.trim();
    insertTextAtCursor(`\n![${caption}](${imageUrlInput.trim()})\n`);
    setImageUrlInput("");
    setImageCaptionInput("");
    setImageModalOpen(false);
  };

  const confirmInsertVideo = () => {
    if (!videoUrlInput.trim()) {
      toast.error("Please provide a Video URL");
      return;
    }
    insertTextAtCursor(`\n${videoUrlInput.trim()}\n`);
    setVideoUrlInput("");
    setVideoModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setFormLoading(true);

    const now = new Date().toISOString();
    const readTime = calculateReadTime(content);

    const postData = {
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      excerpt: excerpt.trim(),
      content,
      coverImage: coverImage.trim(),
      tags,
      isPublic,
      readTimeMinutes: readTime,
      order: Date.now(),
      updatedAt: now,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "updates", editingId), postData);
        toast.success("Post updated successfully!");
      } else {
        await addDoc(collection(db, "updates"), {
          ...postData,
          createdAt: now,
        });
        toast.success("New post published successfully!");
      }
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast.error(`Error saving post: ${msg}`);
    } finally {
      setFormLoading(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = calculateReadTime(content);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono text-sm max-w-5xl mx-auto pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-lora text-foreground">Updates & Blog Manager</h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            Write, manage, and archive personal stories, technical updates, and media.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/updates"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Public Updates
          </a>
        </div>
      </div>

      {/* Main Authoring Form */}
      <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h2 className="text-xl font-bold font-lora text-foreground flex items-center gap-2">
            <PenLine className="w-5 h-5 text-primary" />
            {editingId ? "Edit Post" : "Write New Post"}
          </h2>

          {/* Public / Private Toggle */}
          <div className="flex items-center gap-3 bg-muted/40 p-1.5 rounded-xl border border-border/40">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                isPublic
                  ? "bg-emerald-500 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Public
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                !isPublic
                  ? "bg-amber-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Private Archive
            </button>
          </div>
        </div>

        {/* Title & Slug */}
        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-8 space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Post Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dissecting Algorithmic Edge Cases"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-primary text-sm font-sans font-medium"
            />
          </div>
          <div className="md:col-span-4 space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Slug (URL friendly)</label>
            <input
              type="text"
              placeholder="e.g. dissecting-algorithmic-edge-cases"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-primary text-xs font-mono"
            />
          </div>
        </div>

        {/* Short Excerpt */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Short Excerpt / Summary</label>
          <textarea
            rows={2}
            placeholder="A compelling 1-2 sentence preview for cards and search results..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background focus:outline-none focus:border-primary text-xs font-sans leading-relaxed"
          />
        </div>

        {/* Cover Image URL */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
            <span>Cover Image URL (Direct Link)</span>
            {coverImage && (
              <span className="text-[10px] text-emerald-500 font-mono">Image attached</span>
            )}
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or direct image link"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background focus:outline-none focus:border-primary text-xs font-mono"
          />
          {coverImage && (
            <div className="pt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt="Cover Preview"
                className="h-28 rounded-xl object-cover border border-border/50"
              />
            </div>
          )}
        </div>

        {/* Tags Manager */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Tags & Topics
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-mono"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500 cursor-pointer text-xs"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Systems, Algorithms, Life (press Enter)"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:border-primary text-xs font-mono"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-mono cursor-pointer"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* Medium-style Editor Section */}
        <div className="space-y-2 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-2.5 rounded-xl border border-border/50">
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => insertTextAtCursor("# ", "", "Heading 1")}
                className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer"
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("## ", "", "Heading 2")}
                className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("### ", "", "Heading 3")}
                className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer"
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>

              <span className="w-px h-4 bg-border/60 mx-1" />

              <button
                type="button"
                onClick={() => insertTextAtCursor("**", "**", "bold text")}
                className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("*", "*", "italic text")}
                className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("> ", "", "quote text")}
                className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer"
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("`", "`", "code")}
                className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer"
                title="Inline Code"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("\n```ts\n", "\n```\n", "// your code here")}
                className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer text-xs font-mono font-bold"
                title="Code Block"
              >
                {`{ }`}
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("- ", "", "list item")}
                className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("1. ", "", "list item")}
                className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <span className="w-px h-4 bg-border/60 mx-1" />

              {/* Media Insertion Buttons */}
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 text-xs font-mono font-bold cursor-pointer transition-colors"
                title="Insert Image by URL"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Image URL
              </button>
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-mono font-bold cursor-pointer transition-colors"
                title="Insert Video by URL"
              >
                <Video className="w-3.5 h-3.5" />
                Video URL
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-background/80 p-1 rounded-lg border border-border/40 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("write")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === "write"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === "split"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Columns className="w-3 h-3" />
                Split
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="min-h-[380px]">
            {viewMode === "write" && (
              <textarea
                ref={textareaRef}
                rows={16}
                required
                placeholder="Tell your story... Use markdown, insert image URLs, or video links from the toolbar above."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-mono text-xs leading-relaxed"
              />
            )}

            {viewMode === "preview" && (
              <div className="p-6 rounded-xl border border-border/50 bg-background/80 min-h-[380px] max-w-3xl mx-auto">
                <PostContent content={content || "*Nothing to preview yet. Write some markdown above!*"} />
              </div>
            )}

            {viewMode === "split" && (
              <div className="grid md:grid-cols-2 gap-4">
                <textarea
                  ref={textareaRef}
                  rows={16}
                  required
                  placeholder="Tell your story..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-mono text-xs leading-relaxed"
                />
                <div className="p-4 rounded-xl border border-border/50 bg-background/80 overflow-y-auto max-h-[380px]">
                  <PostContent content={content || "*Live preview will appear here...*"} />
                </div>
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1 px-1">
            <span>
              {wordCount} words • ~{estimatedReadTime} min read
            </span>
            <span>
              Status:{" "}
              <strong className={isPublic ? "text-emerald-500" : "text-amber-500"}>
                {isPublic ? "Public Article" : "Private Archive"}
              </strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/40">
          <button
            type="submit"
            disabled={formLoading}
            className={`flex-1 py-3 rounded-xl text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              isPublic
                ? "bg-primary hover:bg-primary/90"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            <Save className="w-4 h-4" />
            {editingId
              ? isPublic
                ? "Update Public Post"
                : "Update Private Archive"
              : isPublic
              ? "Publish Public Story"
              : "Save to Private Archive"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="p-3 rounded-xl border border-border bg-background text-muted-foreground hover:bg-accent cursor-pointer"
              title="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Existing Posts Listing */}
      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <h3 className="font-lora font-bold text-foreground text-base">
            Existing Posts & Archives ({posts.length})
          </h3>
        </div>

        <div className="divide-y divide-border/40">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs font-mono">
              No posts stored in Firestore yet. Click &apos;Write New Post&apos; above to create your first article!
            </div>
          ) : (
            sortedPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground text-sm font-lora truncate">
                      {post.title}
                    </h4>
                    {post.isPublic === false ? (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold">
                        <Lock className="w-2.5 h-2.5" /> Private
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                        <Globe className="w-2.5 h-2.5" /> Public
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground font-sans line-clamp-1">
                    {post.excerpt || post.content.slice(0, 100)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{post.readTimeMinutes || 3} min read</span>
                    <span>•</span>
                    <span>
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString()
                        : "Draft"}
                    </span>
                    {post.tags?.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.2 rounded bg-muted text-[10px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Quick Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(post)}
                    className="p-2 rounded-lg border border-border bg-background hover:bg-accent text-xs font-mono cursor-pointer"
                    title={post.isPublic ? "Make Private" : "Make Public"}
                  >
                    {post.isPublic ? (
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </button>

                  {/* View Live */}
                  <a
                    href={`/updates/read?id=${post.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                    title="View post"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleEdit(post)}
                    className="p-2 rounded-lg border border-border bg-background text-primary hover:bg-primary/10 cursor-pointer"
                    title="Edit post"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg border border-border bg-background text-red-500 hover:bg-red-500/10 cursor-pointer"
                    title="Delete post"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Insert Image by URL */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-lora font-bold text-foreground text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> Insert Image by URL
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Image URL *</label>
              <input
                type="url"
                required
                placeholder="https://example.com/image.jpg"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Caption / Alt Text (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Memory allocation diagram"
                value={imageCaptionInput}
                onChange={(e) => setImageCaptionInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-sans focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-xs hover:bg-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmInsertImage}
                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 cursor-pointer"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Insert Video by URL */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-lora font-bold text-foreground text-lg flex items-center gap-2">
              <Video className="w-5 h-5 text-rose-500" /> Insert Video Embed
            </h3>
            <p className="text-xs text-muted-foreground font-sans">
              Provide a YouTube video link (e.g. <code className="text-primary font-mono">https://youtu.be/XYZ</code> or <code className="text-primary font-mono">https://www.youtube.com/watch?v=XYZ</code>) or direct video URL.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Video URL *</label>
              <input
                type="url"
                required
                placeholder="https://youtu.be/uobWZ7FA6XM"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-xs hover:bg-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmInsertVideo}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Insert Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUpdatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <UpdatesManagerContent />
    </Suspense>
  );
}
