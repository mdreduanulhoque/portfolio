"use client";

import * as React from "react";
import { ExternalLink, Github, Code, CheckCircle2, ChevronRight } from "lucide-react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { Project } from "@/lib/data";

const fallbackProjects: Project[] = [
    {
        id: "1", title: "Simon Game",
        description: "A classic colorful memory game. Features interactive buttons, sound effects, full responsiveness, and game over animations.",
        techStack: ["HTML5", "CSS3", "JS (ES6)", "jQuery"],
        liveLink: "https://mdreduanulhoque.github.io/SimonGame/",
        githubLink: "https://github.com/mdreduanulhoque/SimonGame",
        features: ["Colorful interactive buttons", "Sound effects for each color", "Game Over animation"],
        order: 0,
    },
    {
        id: "2", title: "Vibe Chess",
        description: "A relaxing, timer-based chess variant. Games end when the 5-minute timer expires, winner determined by territorial control.",
        techStack: ["Vanilla JS", "HTML5", "CSS3"],
        liveLink: "https://mdreduanulhoque.github.io/vibe-chess/",
        githubLink: "https://github.com/mdreduanulhoque/vibe-chess",
        features: ["Territorial Victory System", "Relaxing Design & Animations", "Smart 5-minute Timer display"],
        order: 1,
    },
    {
        id: "3", title: "Array Memory Visualizer",
        description: "A visualization tool for Array Memory Mapping. Shows grid generation, step-by-step calculations, and major mapping.",
        techStack: ["JavaScript", "HTML", "CSS"],
        liveLink: "https://mdreduanulhoque.github.io/Array-Memory-Mapping/",
        githubLink: "https://github.com/mdreduanulhoque/Array-Memory-Mapping",
        features: ["Dynamic grid generation", "Row/Column Major mapping", "Formula calculation steps"],
        order: 2,
    },
];

function ProjectsSkeleton() {
    return (
        <section id="projects" className="py-24 bg-muted/10 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="mb-16 space-y-4">
                    <div className="h-7 w-24 bg-muted animate-pulse rounded-full" />
                    <div className="h-12 w-56 bg-muted animate-pulse rounded-lg" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl" />
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="space-y-4">
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary font-mono">
                            ~/projects
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight font-lora sm:text-5xl">Selected Works</h2>
                    </div>
                    <p className="text-muted-foreground max-w-sm md:text-right text-sm leading-relaxed">
                        A collection of tools and games built combining logic, algorithms, and clean interfaces.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {items.map((project) => (
                        <div
                            key={project.id}
                            className="group relative flex flex-col bg-background/40 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-primary/5"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <div className="p-8 flex flex-col flex-1 relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                        <Code className="w-6 h-6 text-foreground group-hover:text-white" />
                                    </div>
                                    <div className="flex gap-2">
                                        {project.githubLink && (
                                            <a href={project.githubLink} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-secondary/50 hover:bg-foreground hover:text-background transition-colors" aria-label="Source Code">
                                                <Github className="w-4 h-4" />
                                            </a>
                                        )}
                                        {project.liveLink && (
                                            <a href={project.liveLink} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-secondary/50 hover:bg-foreground hover:text-background transition-colors" aria-label="Live Demo">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold font-lora mb-3 group-hover:text-primary transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>

                                <div className="space-y-3 flex-1 mb-8">
                                    {project.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
                                            <span className="text-sm text-foreground/80">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto pt-6 border-t border-border/40">
                                    <div className="flex flex-wrap gap-2 mb-4">
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
                                        <a href={project.liveLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                            View Project <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
