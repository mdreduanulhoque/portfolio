"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { Project } from "@/lib/data";
import { fallbackProjects, getProjectImageUrl } from "@/lib/data";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Code,
  CheckCircle2,
  Search,
  FolderGit2,
  X,
  Layers,
  Eye,
} from "lucide-react";

export default function ProjectsPage() {
  const { data: projectsFromDb, loading } = useFirestoreCollection<Project>("projects");

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };
    if (selectedProject) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedProject]);

  // Determine active projects
  const allProjects = useMemo(() => {
    if (projectsFromDb && projectsFromDb.length > 0) {
      return [...projectsFromDb].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return fallbackProjects;
  }, [projectsFromDb]);

  // Compute available technologies for filtering
  const allTechList = useMemo(() => {
    const techSet = new Set<string>();
    allProjects.forEach((proj) => {
      proj.techStack?.forEach((tech) => techSet.add(tech.trim()));
    });
    return ["All", ...Array.from(techSet).sort()];
  }, [allProjects]);

  // Filter projects by search and tech filter
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allProjects.filter((project) => {
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.techStack?.some((t) => t.toLowerCase().includes(q)) ||
        project.features?.some((f) => f.toLowerCase().includes(q));

      const matchesTech =
        selectedTech === "All" ||
        project.techStack?.some(
          (t) => t.toLowerCase() === selectedTech.toLowerCase()
        );

      return matchesSearch && matchesTech;
    });
  }, [allProjects, searchQuery, selectedTech]);

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Back to Home Link */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Portfolio</span>
        </Link>
      </div>

      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border/40 pb-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary font-mono">
            <FolderGit2 className="w-3.5 h-3.5" />
            ~/projects
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-lora text-foreground tracking-tight">
            Projects & Selected Works
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            A comprehensive showcase of web applications, system tools, algorithmic solutions, and software projects with live demonstrations and source code.
          </p>
        </div>

        <a
          href="https://github.com/mdreduanulhoque"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-mono font-medium rounded-xl border border-border/70 bg-card hover:bg-accent text-foreground transition-all duration-200 shadow-sm shrink-0 w-fit cursor-pointer group"
        >
          <Github className="w-4 h-4 text-foreground group-hover:scale-110 transition-transform" />
          <span>GitHub Profile</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </a>
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, features, or stack..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/70 bg-card/50 backdrop-blur-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5" /> Filter:
          </span>
          {allTechList.map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`text-xs font-mono px-3 py-1 rounded-full border transition-all cursor-pointer ${
                selectedTech === tech
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card/40 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-muted/30 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl">
          <p className="text-sm font-mono text-muted-foreground">No projects found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project) => {
            const imageSrc = getProjectImageUrl(project);
            const hasImage = Boolean(imageSrc);

            return (
              <div
                key={project.id}
                className="group relative flex flex-col bg-background/50 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-primary/5 hover:-translate-y-1"
              >
                {/* Visual Thumbnail Area - Exactly matching Certificate Card */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/30 border-b border-border/40">
                  {hasImage ? (
                    <Image
                      src={imageSrc}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Code className="w-10 h-10 stroke-1" />
                      <span className="text-xs font-mono">Software Project</span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>

                    {project.liveLink && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-background/90 text-foreground hover:bg-background hover:text-primary transition-colors shadow-lg cursor-pointer"
                        title="Open Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-background/90 text-foreground hover:bg-background hover:text-primary transition-colors shadow-lg cursor-pointer"
                        title="Source Code on GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content Card Body - Exactly matching Certificate Card */}
                <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {project.techStack?.[0] || "Featured Project"}
                      </span>
                      {project.techStack && project.techStack.length > 1 && (
                        <span className="text-[11px] font-mono text-muted-foreground">
                          +{project.techStack.length - 1} tech
                        </span>
                      )}
                    </div>

                    <h2 className="font-bold text-foreground font-lora text-base sm:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-1">
                      {project.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Key Features (first 2) */}
                    {project.features && project.features.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {project.features.slice(0, 2).map((feat, fIndex) => (
                          <div key={fIndex} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-primary/70 shrink-0" />
                            <span className="text-xs text-foreground/80 line-clamp-1">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-3.5 border-t border-border/40 flex items-center justify-between gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="font-semibold text-primary hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Project Details
                    </button>

                    {project.liveLink ? (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Live Demo <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : project.githubLink ? (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        GitHub <Github className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Project Detail Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-background border border-border/70 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-border/50 flex items-center justify-between gap-4 bg-muted/20">
              <div>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary mb-1 inline-block">
                  Project Details
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-lora text-foreground">
                  {selectedProject.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
              {/* Full Screenshot Preview Banner if Available */}
              {(() => {
                const modalImg = getProjectImageUrl(selectedProject);
                return modalImg ? (
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-border/50 bg-black/40 shadow-sm">
                    <Image
                      src={modalImg}
                      alt={selectedProject.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null;
              })()}

              <div>
                <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground mb-2">Overview</h4>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {selectedProject.features && selectedProject.features.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground mb-2">Key Features</h4>
                  <div className="space-y-2">
                    {selectedProject.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                        <span className="text-xs sm:text-sm text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.techStack?.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-4 sm:p-6 border-t border-border/50 bg-muted/10 flex flex-wrap items-center justify-end gap-3">
              {selectedProject.githubLink && (
                <a
                  href={selectedProject.githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-border bg-background hover:bg-accent text-foreground transition-colors cursor-pointer"
                >
                  <Github className="w-4 h-4" />
                  <span>Source Code</span>
                </a>
              )}
              {selectedProject.liveLink && (
                <a
                  href={selectedProject.liveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                >
                  <span>Launch Live Demo</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
