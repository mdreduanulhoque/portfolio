"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { useAuth } from "@/lib/auth-context";
import { BlogPost, fallbackBlogPosts } from "@/lib/data";
import {
  Search,
  Calendar,
  Clock,
  Lock,
  Globe,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function UpdatesPage() {
  const { user } = useAuth();
  const { data: postsFromDb, loading } = useFirestoreCollection<BlogPost>("updates");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  // Determine active posts (sorted newest first, fallback only if DB is empty and finished loading)
  const allPosts = useMemo(() => {
    if (postsFromDb && postsFromDb.length > 0) {
      return [...postsFromDb].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }
    return loading ? [] : fallbackBlogPosts;
  }, [postsFromDb, loading]);

  // Filter posts based on authentication (private posts visible only if user is logged in)
  const visiblePosts = useMemo(() => {
    return allPosts.filter((post) => {
      // If user is logged in, show everything
      if (user) return true;
      // Otherwise only show public posts
      return post.isPublic !== false;
    });
  }, [allPosts, user]);

  // Extract all unique tags
  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    visiblePosts.forEach((post) => {
      post.tags?.forEach((t) => tagSet.add(t));
    });
    return ["All", ...Array.from(tagSet)];
  }, [visiblePosts]);

  // Filtered by search query and tag
  const filteredPosts = useMemo(() => {
    return visiblePosts.filter((post) => {
      const matchesTag =
        selectedTag === "All" || post.tags?.includes(selectedTag);
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTag && matchesSearch;
    });
  }, [visiblePosts, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Editorial Header */}
      <div className="space-y-4 mb-12 border-b border-border/40 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary font-mono">
          <BookOpen className="w-3.5 h-3.5" />
          ~/journal/updates
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-lora text-foreground tracking-tight">
          Updates & Writings
        </h1>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="space-y-4 mb-10">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stories, tags, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-card/50 text-sm font-sans focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {tags.length > 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border/40 bg-card/20 space-y-3 animate-pulse"
            >
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Posts List */}
      {!loading && (
        <div className="space-y-8 divide-y divide-border/40">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-muted-foreground font-mono text-sm">
                No stories found matching your criteria.
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-primary underline font-mono cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => {
              const formattedDate = post.createdAt
                ? new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recently";

              return (
                <article
                  key={post.id}
                  className="pt-8 first:pt-0 group flex flex-col md:flex-row md:items-start gap-6 justify-between"
                >
                  <div className="space-y-3 flex-1">
                    {/* Meta Info */}
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

                      {/* Public / Private Pill */}
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

                    {/* Title */}
                    <Link
                      href={`/updates/read?id=${post.id}`}
                      className="block group-hover:text-primary transition-colors"
                    >
                      <h2 className="text-xl sm:text-2xl font-bold font-lora text-foreground tracking-tight leading-snug">
                        {post.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-muted-foreground text-sm font-sans line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Tags & Action */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono text-muted-foreground border border-border/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/updates/read?id=${post.id}`}
                        className="inline-flex items-center gap-1 text-xs font-mono font-bold text-primary hover:underline"
                      >
                        Read story
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Thumbnail Cover Image if available */}
                  {post.coverImage && (
                    <Link
                      href={`/updates/read?id=${post.id}`}
                      className="shrink-0 w-full md:w-48 h-36 relative rounded-xl overflow-hidden border border-border/40 bg-muted/30 group-hover:border-primary/50 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>
                  )}
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
