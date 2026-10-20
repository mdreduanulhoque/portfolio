"use client";

import * as React from "react";
import Link from "next/link";
import {
  ExternalLink,
  Github,
  Code,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  FolderGit2,
} from "lucide-react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { Project } from "@/lib/data";
import { fallbackProjects } from "@/lib/data";

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

        {/* Projects Grid (3 Cards on Homepage) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {previewItems.map((project) => (
            <div
              key={project.id}
              className="group relative flex flex-col bg-background/50 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="p-5 sm:p-6 flex flex-col flex-1 relative z-10 justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-secondary/50 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Code className="w-4 h-4 sm:w-5 sm:h-5 text-foreground group-hover:text-white" />
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 sm:p-2 rounded-full bg-secondary/50 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                          aria-label="Source Code"
                          title="View Source on GitHub"
                        >
                          <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </a>
                      )}
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 sm:p-2 rounded-full bg-secondary/50 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                          aria-label="Live Demo"
                          title="Open Live Demo"
                        >
                          <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold font-lora mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                    {project.description}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    {project.features?.slice(0, 3).map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-primary/70 shrink-0" />
                        <span className="text-xs text-foreground/80 line-clamp-1">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-border/40">
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {project.techStack?.slice(0, 4).map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                    {(project.techStack?.length ?? 0) > 4 && (
                      <span className="text-[10px] font-mono text-muted-foreground self-center">
                        +{(project.techStack?.length ?? 0) - 4}
                      </span>
                    )}
                  </div>

                  <Link
                    href="/projects"
                    className="inline-flex items-center text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                  >
                    Explore Details <ChevronRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
