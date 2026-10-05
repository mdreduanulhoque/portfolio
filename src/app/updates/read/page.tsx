"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { BlogPost, fallbackBlogPosts } from "@/lib/data";
import { PostContent } from "@/components/blog/post-content";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Lock,
  Globe,
  Share2,
  Edit2,
  Check,
  ShieldAlert,
} from "lucide-react";

function ReaderSkeleton() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8 animate-pulse">
      <div className="h-4 w-28 bg-muted rounded" />
      <div className="h-10 w-4/5 bg-muted rounded-lg" />
      <div className="h-4 w-1/2 bg-muted rounded" />
      <div className="h-64 w-full bg-muted rounded-2xl" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
    </div>
  );
}

function PostReaderContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const postSlug = searchParams.get("slug");

  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      if (!postId && !postSlug) {
        setLoading(false);
        return;
      }

      try {
        // 1. Try to fetch from Firestore if postId is given
        if (postId) {
          const docRef = doc(db, "updates", postId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && isMounted) {
            setPost({ id: docSnap.id, ...docSnap.data() } as BlogPost);
            setLoading(false);
            return;
          }
        }

        // 2. Fallback check
        const targetIdentifier = postId || postSlug;
        const fallback = fallbackBlogPosts.find(
          (p) => p.id === targetIdentifier || p.slug === targetIdentifier
        );

        if (fallback && isMounted) {
          setPost(fallback);
        }
      } catch (err) {
        console.error("Error loading blog post:", err);
        const targetIdentifier = postId || postSlug;
        const fallback = fallbackBlogPosts.find(
          (p) => p.id === targetIdentifier || p.slug === targetIdentifier
        );
        if (fallback && isMounted) {
          setPost(fallback);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [postId, postSlug]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <ReaderSkeleton />;
  }

  // Not found
  if (!post) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-xl mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold font-lora text-foreground">Post Not Found</h2>
        <p className="text-sm text-muted-foreground font-sans">
          The requested update could not be found or has been moved.
        </p>
        <div>
          <Link
            href="/updates"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Updates
          </Link>
        </div>
      </div>
    );
  }

  // Privacy Protection: Post is private and viewer is not logged in
  if (post.isPublic === false && !user) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-lora text-foreground">
          Private Archive Entry
        </h2>
        <p className="text-sm text-muted-foreground font-sans leading-relaxed">
          This post is set to <strong>private</strong> and is preserved for personal archival. If you are the author, please log into your admin dashboard to view or modify it.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/updates"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-xs font-mono font-medium hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Updates
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-medium hover:bg-primary/90 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <article className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-4 mb-10 pb-6 border-b border-border/40">
        <Link
          href="/updates"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Updates
        </Link>

        <div className="flex items-center gap-2">
          {/* Admin shortcut edit */}
          {user && (
            <Link
              href={`/admin/updates?edit=${post.id}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs font-mono hover:bg-primary/20 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </Link>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border bg-card/50 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            title="Copy post link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Share"}
          </button>
        </div>
      </div>

      {/* Article Header */}
      <header className="space-y-6 mb-10">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTimeMinutes || 3} min read
          </span>

          {post.isPublic === false ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
              <Lock className="w-2.5 h-2.5" /> Private Archive
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
              <Globe className="w-2.5 h-2.5" /> Public
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold font-lora text-foreground tracking-tight leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg sm:text-xl text-muted-foreground font-lora italic leading-relaxed border-l-2 border-primary/40 pl-4 py-1">
            {post.excerpt}
          </p>
        )}

        {/* Cover Image */}
        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden border border-border/50 bg-muted/30 shadow-sm mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <div className="font-sans text-base leading-relaxed text-foreground/90">
        <PostContent content={post.content} />
      </div>

      {/* Footer Tags & Navigation */}
      <footer className="mt-16 pt-8 border-t border-border/40 space-y-6">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">Topics:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md bg-muted text-xs font-mono text-foreground border border-border/40"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Link
            href="/updates"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to all updates
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-mono hover:bg-accent transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share story
          </button>
        </div>
      </footer>
    </article>
  );
}

export default function PostReaderPage() {
  return (
    <Suspense fallback={<ReaderSkeleton />}>
      <PostReaderContent />
    </Suspense>
  );
}
