"use client";

import * as React from "react";
import { ExternalLink, Github, Code, CheckCircle2, ChevronRight } from "lucide-react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { Project } from "@/lib/data";
import { fallbackProjects } from "@/lib/data";
import { AutoScrollCarousel } from "@/components/ui/auto-scroll-carousel";

function ProjectsSkeleton() {
    return (
        <section id="projects" className="py-24 bg-muted/10 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="mb-16 space-y-4">
                    <div className="h-7 w-24 bg-muted animate-pulse rounded-full" />
                    <div className="h-12 w-56 bg-muted animate-pulse rounded-lg" />
                </div>
                <div className="flex gap-8 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-96 w-80 sm:w-96 bg-muted animate-pulse rounded-2xl shrink-0" />
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

    return (
        <section id="projects" className="py-24 bg-muted/10 relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
                <div className="flex flex-col items-start gap-4 mb-14">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary font-mono">
                        ~/projects
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight font-lora sm:text-5xl">Selected Works</h2>
                </div>

                <AutoScrollCarousel
                    items={items}
                    idKey={(project) => project.id}
                    durationSeconds={40}
                    renderItem={(project) => (
                        <div
                            className="group relative flex flex-col bg-background/50 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-primary/5 w-[320px] sm:w-[380px] md:w-[410px] h-full"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                            <div className="p-7 flex flex-col flex-1 relative z-10">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                        <Code className="w-5 h-5 text-foreground group-hover:text-white" />
                                    </div>
                                    <div className="flex gap-2">
                                        {project.githubLink && (
                                            <a
                                                href={project.githubLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 rounded-full bg-secondary/50 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                                                aria-label="Source Code"
                                            >
                                                <Github className="w-4 h-4" />
                                            </a>
                                        )}
                                        {project.liveLink && (
                                            <a
                                                href={project.liveLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 rounded-full bg-secondary/50 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                                                aria-label="Live Demo"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <h3 className="text-2xl font-bold font-lora mb-2.5 group-hover:text-primary transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                        {project.description}
                                    </p>
                                </div>

                                <div className="space-y-2.5 flex-1 mb-6">
                                    {project.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
                                            <span className="text-xs sm:text-sm text-foreground/80 line-clamp-1">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto pt-5 border-t border-border/40">
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {project.techStack.map((tech, techIndex) => (
                                            <span
                                                key={techIndex}
                                                className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    {project.liveLink && (
                                        <a
                                            href={project.liveLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center text-sm font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                                        >
                                            View Project <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                />
            </div>
        </section>
    );
}
