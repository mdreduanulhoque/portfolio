"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  Github,
  Code,
  ArrowRight,
  FolderGit2,
  Eye,
} from "lucide-react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { Project } from "@/lib/data";
import { fallbackProjects, getProjectImageUrl } from "@/lib/data";

function ProjectsSkeleton() {
  return (
    <section id="projects" className="py-24 bg-muted/10 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-16 space-y-4">
          <div className="h-7 w-24 bg-muted animate-pulse rounded-full" />
          <div className="h-12 w-56 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectsSection() {
  const { data: projects, loading } = useFirestoreCollection<Project>("projects");

  if (loading) return <ProjectsSkeleton />;

  const items = projects.length > 0 ? projects : fallbackProjects;
  const previewItems = items.slice(0, 3);

  return (
    <section id="projects" className="py-24 bg-muted/10 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary font-mono">
              <FolderGit2 className="w-3.5 h-3.5" />
              ~/projects
            </div>
            <h2 className="text-3xl font-bold tracking-tight font-lora sm:text-5xl text-foreground">
              Selected Works
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Featured software engineering projects, web applications, and tools with live demos.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm w-fit cursor-pointer group shrink-0"
          >
            <span>View All ({items.length})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Projects Grid (3 Cards on Homepage - Matching Certificate Card Structure) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {previewItems.map((project) => {
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
                    {project.liveLink ? (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Demo
                      </a>
                    ) : (
                      <Link
                        href="/projects"
                        className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Project
                      </Link>
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

                    <h3 className="font-bold text-foreground font-lora text-base sm:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-1">
                      {project.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Tech Stack Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.techStack?.slice(0, 4).map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-foreground/80 border border-border/50 uppercase"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-3.5 border-t border-border/40 flex items-center justify-between gap-3 text-xs">
                    <Link
                      href="/projects"
                      className="font-semibold text-primary hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Project Details
                    </Link>

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
      </div>
    </section>
  );
}
