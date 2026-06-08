"use client";

import * as React from "react";
import { ArrowDown, Terminal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useFirestoreDoc } from "@/hooks/useFirestoreDoc";
import type { Profile } from "@/lib/data";

const fallbackProfile: Profile = {
    name: "MD REDUANUL HOQUE",
    tagline: "\"Bro, we have one life. Why waste it? Let's follow the orders of God, make Him happy & pass innovations to the next generations.\"",
    badges: ["Computer Science Student", "Educator"],
    location: "Dhaka, Bangladesh",
    eduStatus: "5th Trimester B.Sc. in CSE @ UIU",
    statusLine: "Learning, Building, Teaching...",
    hobbies: ["Reading", "Football", "Gaming", "☕"],
    philosophyTitle: "The Philosophy",
    philosophyParagraphs: [],
    profileImageUrl: "/Formal.jpg",
    resumeUrl: "/md_reduanul_hoque_resume.pdf",
};

function HeroSkeleton() {
    return (
        <section className="relative flex min-h-[calc(100vh-4rem)] items-center px-4 overflow-hidden pt-12 pb-24 md:py-0">
            <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="h-7 w-48 bg-muted animate-pulse rounded-full" />
                            <div className="h-7 w-24 bg-muted animate-pulse rounded-full" />
                        </div>
                        <div className="h-16 w-80 bg-muted animate-pulse rounded-lg" />
                        <div className="h-20 w-full bg-muted animate-pulse rounded-lg" />
                    </div>
                </div>
                <div className="h-72 bg-muted animate-pulse rounded-xl" />
            </div>
        </section>
    );
}

export function HeroSection() {
    const { data: profile, loading } = useFirestoreDoc<Profile>("profile", "main");
    const p = profile || fallbackProfile;

    if (loading) return <HeroSkeleton />;

    return (
        <section className="relative flex min-h-[calc(100vh-4rem)] items-center px-4 overflow-hidden pt-12 pb-24 md:py-0">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Electric PCB Current Flow Graphic */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-50 dark:opacity-30">
                <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    <style>
                        {`
                        .trace {
                            stroke-dasharray: 60 1200;
                            stroke-dashoffset: 1260;
                            animation: flow 4s linear infinite;
                        }
                        .trace-2 {
                            stroke-dasharray: 40 1200;
                            stroke-dashoffset: 1240;
                            animation: flow 6s linear infinite 1s;
                        }
                        .trace-3 {
                            stroke-dasharray: 80 1200;
                            stroke-dashoffset: 1280;
                            animation: flow 5s linear infinite 2s;
                        }
                        @keyframes flow {
                            to { stroke-dashoffset: 0; }
                        }
                        `}
                    </style>
                    {/* Base PCB lines - static */}
                    <g className="stroke-primary/10 dark:stroke-primary/20" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M -50,150 L 200,150 L 250,200 L 500,200 L 550,150 L 1050,150" />
                        <path d="M -50,650 L 300,650 L 350,600 L 700,600 L 750,650 L 1050,650" />
                        <path d="M 150,-50 L 150,300 L 200,350 L 200,800 L 150,850 L 150,1050" />
                        <path d="M 850,-50 L 850,200 L 800,250 L 800,700 L 850,750 L 850,1050" />
                        <path d="M 400,-50 L 400,400 L 350,450 L -50,450" />
                        <path d="M 600,1050 L 600,800 L 650,750 L 1050,750" />
                    </g>

                    {/* Current flow flashes */}
                    <g className="stroke-primary dark:stroke-emerald-400" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 0px 4px rgba(16, 185, 129, 0.4))' }}>
                        <path d="M -50,150 L 200,150 L 250,200 L 500,200 L 550,150 L 1050,150" className="trace" />
                        <path d="M -50,650 L 300,650 L 350,600 L 700,600 L 750,650 L 1050,650" className="trace-2" />
                        <path d="M 150,-50 L 150,300 L 200,350 L 200,800 L 150,850 L 150,1050" className="trace-3" />
                        <path d="M 850,-50 L 850,200 L 800,250 L 800,700 L 850,750 L 850,1050" className="trace" />
                        <path d="M 400,-50 L 400,400 L 350,450 L -50,450" className="trace-2" />
                        <path d="M 600,1050 L 600,800 L 650,750 L 1050,750" className="trace-3" />
                    </g>

                    {/* Nodes / Intersections */}
                    <g className="fill-primary/20 dark:fill-emerald-400/20">
                        <circle cx="200" cy="150" r="6" className="animate-pulse" />
                        <circle cx="500" cy="200" r="6" className="animate-pulse" style={{ animationDelay: '1s' }} />
                        <circle cx="300" cy="650" r="6" className="animate-pulse" style={{ animationDelay: '2s' }} />
                        <circle cx="700" cy="600" r="6" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
                        <circle cx="200" cy="350" r="6" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <circle cx="800" cy="250" r="6" className="animate-pulse" style={{ animationDelay: '2.5s' }} />
                        <circle cx="400" cy="400" r="6" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
                        <circle cx="600" cy="800" r="6" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
                    </g>
                    <g className="fill-primary dark:fill-emerald-400">
                        <circle cx="200" cy="150" r="3" />
                        <circle cx="500" cy="200" r="3" />
                        <circle cx="300" cy="650" r="3" />
                        <circle cx="700" cy="600" r="3" />
                        <circle cx="200" cy="350" r="3" />
                        <circle cx="800" cy="250" r="3" />
                        <circle cx="400" cy="400" r="3" />
                        <circle cx="600" cy="800" r="3" />
                    </g>
                </svg>
            </div>

            <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-both">
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                            {p.badges.map((badge, i) => (
                                <div key={i} className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${i === 0 ? 'border-primary/20 bg-primary/10 text-primary' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'}`}>
                                    <span className={`flex h-2 w-2 rounded-full mr-2 animate-pulse ${i === 0 ? 'bg-primary' : 'bg-emerald-500'}`}></span>
                                    {badge}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="relative w-32 h-40 sm:w-40 sm:h-48 rounded-2xl overflow-hidden border-4 border-background shadow-xl ring-2 ring-primary/20 shrink-0 sm:mt-2">
                                <Image
                                    src={p.profileImageUrl}
                                    alt={p.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="space-y-4 text-center sm:text-left pt-2">
                                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight font-lora text-foreground relative mt-0 sm:-mt-2">
                                    {p.name.split(" ").length > 2 ? (
                                        <>
                                            {p.name.split(" ").slice(0, -1).join(" ")} <br className="hidden sm:block" /> {p.name.split(" ").slice(-1)}
                                        </>
                                    ) : p.name}
                                </h1>
                            </div>
                        </div>
                        <p className="max-w-[42rem] mt-6 leading-relaxed text-muted-foreground sm:text-lg text-center sm:text-left">
                            <strong className="text-foreground font-medium">&quot;Bro, we have one life. Why waste it?</strong> Let&apos;s follow the orders of God, make Him happy &amp; pass innovations to the next generations.&quot;
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Link
                            href="#projects"
                            className="inline-flex h-12 relative overflow-hidden items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background transition-all hover:bg-foreground/90 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring group shadow-lg"
                        >
                            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                                <div className="relative h-full w-8 bg-white/20" />
                            </div>
                            <span className="relative">View My Work</span>
                        </Link>
                        <a
                            href={p.resumeUrl}
                            download
                            className="inline-flex h-12 items-center justify-center rounded-md border border-input/50 bg-background/50 backdrop-blur-xs px-8 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring gap-2 group"
                        >
                            Resume
                            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1 text-primary" />
                        </a>
                    </div>
                </div>

                {/* Mock Terminal block for Nerd Vibe */}
                <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 fill-mode-both">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-xl blur-md opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative rounded-xl border border-border/50 bg-[#0f172a] shadow-2xl overflow-hidden">
                        <div className="flex items-center px-4 py-3 bg-[#1e293b] border-b border-border/20">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors cursor-pointer"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-400 transition-colors cursor-pointer"></div>
                            </div>
                            <div className="mx-auto flex items-center text-xs text-slate-400 font-mono">
                                <Terminal className="w-3 h-3 mr-2" />
                                reduan@portfolio ~ bash
                            </div>
                        </div>
                        <div className="p-6 font-mono text-sm space-y-4">
                            <div className="text-emerald-400">
                                <span className="text-pink-500">➜</span> <span className="text-cyan-400">~</span> whoami
                            </div>
                            <div className="text-slate-300">
                                {p.name.split(" ").slice(-2).join(" ")} | Developer &amp; Educator
                            </div>
                            <div className="text-emerald-400">
                                <span className="text-pink-500">➜</span> <span className="text-cyan-400">~</span> cat status.txt
                            </div>
                            <div className="text-slate-300 space-y-1 pl-4 border-l-2 border-slate-700">
                                <p><span className="text-cyan-400">Location:</span> {p.location}</p>
                                <p><span className="text-cyan-400">Edu:</span> {p.eduStatus}</p>
                                <p><span className="text-cyan-400">Status:</span> {p.statusLine}</p>
                                <p><span className="text-cyan-400">Hobbies:</span> [{p.hobbies.join(", ")}]</p>
                            </div>
                            <div className="flex items-center text-emerald-400 pt-2">
                                <span className="text-pink-500">➜</span> <span className="text-cyan-400 mr-2">~</span> <span className="w-2 h-4 bg-emerald-400 animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
