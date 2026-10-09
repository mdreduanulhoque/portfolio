"use client";

import * as React from "react";
import { Youtube, PlayCircle } from "lucide-react";
import Image from "next/image";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { ClassItem } from "@/lib/data";
import { fallbackClasses } from "@/lib/data";
import { AutoScrollCarousel } from "@/components/ui/auto-scroll-carousel";

function ClassesSkeleton() {
    return (
        <section id="classes" className="py-24 bg-muted/30 relative border-t border-border/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="flex flex-col items-center gap-4 mb-16">
                    <div className="h-7 w-36 bg-muted animate-pulse rounded-full" />
                    <div className="h-12 w-56 bg-muted animate-pulse rounded-lg" />
                </div>
                <div className="flex gap-8 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-80 w-80 sm:w-96 bg-muted animate-pulse rounded-2xl shrink-0" />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ClassesSection() {
    const { data: classes, loading } = useFirestoreCollection<ClassItem>("classes");

    if (loading) return <ClassesSkeleton />;

    const items = classes.length > 0 ? classes : fallbackClasses;

    return (
        <section id="classes" className="py-24 bg-muted/30 relative border-t border-border/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="flex flex-col items-center gap-4 mb-14 text-center">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary font-mono cursor-default">
                        ~/teaching/classes
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight font-lora sm:text-5xl">Online Classes</h2>
                </div>

                <AutoScrollCarousel
                    items={items}
                    idKey={(item) => item.id}
                    durationSeconds={40}
                    renderItem={(item) => (
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex flex-col bg-background/50 rounded-2xl border border-border/60 overflow-hidden hover:border-[#FF0000]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-[300px] sm:w-[350px] md:w-[380px] h-full"
                        >
                            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                <Image
                                    src={`https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-14 h-14 rounded-full bg-[#FF0000] flex items-center justify-center text-white shadow-lg">
                                        <PlayCircle className="w-7 h-7" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div>
                                    <h3 className="font-bold text-foreground font-lora text-lg sm:text-xl leading-tight group-hover:text-[#FF0000] transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="flex items-center text-sm font-medium text-[#FF0000]">
                                    <Youtube className="w-4 h-4 mr-2" />
                                    Watch on YouTube
                                </div>
                            </div>
                        </a>
                    )}
                />
            </div>
        </section>
    );
}
