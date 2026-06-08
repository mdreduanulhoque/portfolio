"use client";

import * as React from "react";
import { GraduationCap, Briefcase, BookOpen, Trophy, Heart } from "lucide-react";
import { useFirestoreDoc } from "@/hooks/useFirestoreDoc";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { Profile, Education, Experience, Achievement } from "@/lib/data";

const fallbackEducation: Education[] = [
    { id: "1", institution: "United International University", period: "Present (5th Trimester)", degree: "B.Sc. in Computer Science & Engineering", grade: "CGPA: 3.90/4.00", isCurrent: true, order: 0 },
    { id: "2", institution: "Gurudayal Govt College", period: "2023 - 2024", degree: "HSC - Science Group", grade: "GPA: 5.00/5.00", isCurrent: false, order: 1 },
    { id: "3", institution: "Kishoreganj Govt Boys High School", period: "2021 - 2022", degree: "SSC - Science Group", grade: "GPA: 5.00/5.00", isCurrent: false, order: 2 },
];

const fallbackExperience: Experience[] = [
    { id: "1", role: "Volunteer", organization: "UIU CPC", period: "2025 - Present", description: "Organizing contests & mentoring junior students in algorithmic problem-solving.", isCurrent: true, order: 0 },
    { id: "2", role: "Course Instructor", organization: "NovoNex", period: "2024 - Present", description: "Mentoring in Intro to Computing, C Programming & OOP.", isCurrent: true, order: 1 },
    { id: "3", role: "General Member", organization: "UIU Computer Club", period: "2024 - Present", description: "Project management and team collaboration for club events.", isCurrent: true, order: 2 },
    { id: "4", role: "Science Teacher", organization: "IHT Study Point", period: "2023 - Present", description: "Mentoring 500+ students in Physics, Chemistry & Biology.", isCurrent: true, order: 3 },
];

const fallbackAchievements: Achievement[] = [
    { id: "1", title: "1st Runner-up", subtitle: "at Phitron X App Forum: KickStart Contest", emoji: "🏆", order: 0 },
    { id: "2", title: "8th Runner-up & Bronze Medalist", subtitle: "at \"BeatCode 253\"", emoji: "🥉", order: 1 },
];

function AboutSkeleton() {
    return (
        <section id="about" className="py-24 bg-muted/30 relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="flex flex-col items-center gap-4 mb-16">
                    <div className="h-7 w-32 bg-muted animate-pulse rounded-full" />
                    <div className="h-12 w-56 bg-muted animate-pulse rounded-lg" />
                </div>
                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4 space-y-8">
                        <div className="h-48 bg-muted animate-pulse rounded-2xl" />
                        <div className="h-24 bg-muted animate-pulse rounded-2xl" />
                    </div>
                    <div className="lg:col-span-8 grid sm:grid-cols-2 gap-8">
                        <div className="h-64 bg-muted animate-pulse rounded-2xl" />
                        <div className="h-64 bg-muted animate-pulse rounded-2xl" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function AboutSection() {
    const { data: profile, loading: profileLoading } = useFirestoreDoc<Profile>("profile", "main");
    const { data: education, loading: eduLoading } = useFirestoreCollection<Education>("education");
    const { data: experience, loading: expLoading } = useFirestoreCollection<Experience>("experience");
    const { data: achievements, loading: achLoading } = useFirestoreCollection<Achievement>("achievements");

    const loading = profileLoading || eduLoading || expLoading || achLoading;

    if (loading) return <AboutSkeleton />;

    const eduItems = education.length > 0 ? education : fallbackEducation;
    const expItems = experience.length > 0 ? experience : fallbackExperience;
    const achItems = achievements.length > 0 ? achievements : fallbackAchievements;
    const hobbies = profile?.hobbies || ["Reading", "Football", "Analyzing games", "Exploring", "Coffee ☕"];
    const philosophyTitle = profile?.philosophyTitle || "The Philosophy";
    const philosophyParagraphs = profile?.philosophyParagraphs || [
        "I'm a passionate Computer Science and Engineering student at UIU. I find joy in problem-solving, building web applications, and diving deep into the fundamentals of how things work.",
        "Whether mentoring in the Competitive Programming Community or teaching science to high schoolers, I believe teaching is the purest form of learning."
    ];

    return (
        <section id="about" className="py-24 bg-muted/30 relative">
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="flex flex-col items-center gap-4 mb-16">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary font-mono">
                        ~/.about_me
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight font-lora sm:text-5xl">Who Am I?</h2>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 text-muted-foreground">

                    {/* Left Column: Intro & Hobbies */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4 font-lora">
                                <BookOpen className="h-5 w-5 text-primary" /> {philosophyTitle}
                            </h3>
                            {philosophyParagraphs.map((para, i) => (
                                <p key={i} className={`leading-relaxed ${i === 0 ? 'mb-4' : 'text-sm'}`}>
                                    {para}
                                </p>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                <Heart className="h-4 w-4 text-rose-500" /> System Variables (Hobbies)
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {hobbies.map((hobby) => (
                                    <span key={hobby} className="px-3 py-1 bg-muted rounded-md text-xs font-mono text-foreground border border-border/50 hover:border-primary/50 transition-colors">
                                        {hobby}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-emerald-500" /> Achievements
                            </h3>
                            <div className="space-y-3">
                                {achItems.map((ach) => (
                                    <div key={ach.id} className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-start gap-3">
                                        <span className="text-2xl leading-none">{ach.emoji}</span>
                                        <div>
                                            <p className="font-bold">{ach.title}</p>
                                            <p className="text-xs opacity-80 mt-1">{ach.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Timeline */}
                    <div className="lg:col-span-8 grid sm:grid-cols-2 gap-8">

                        {/* Education Timeline */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-lora border-b border-border/50 pb-4">
                                <GraduationCap className="h-5 w-5 text-primary" /> Education
                            </h3>
                            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-border/50 before:to-transparent">
                                {eduItems.map((edu) => (
                                    <div key={edu.id} className="relative">
                                        <div className={`absolute top-1 -left-6 w-2.5 h-2.5 rounded-full ring-4 ring-background ${edu.isCurrent ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                                        <h4 className="font-bold text-foreground">{edu.institution}</h4>
                                        <p className={`text-sm font-medium mt-1 ${edu.isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{edu.period}</p>
                                        <p className="text-sm mt-2">{edu.degree}</p>
                                        <p className="text-xs font-mono mt-1 bg-muted inline-block px-2 py-0.5 rounded">{edu.grade}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Experience Timeline */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-lora border-b border-border/50 pb-4">
                                <Briefcase className="h-5 w-5 text-primary" /> Experience
                            </h3>
                            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-border/50 before:to-transparent">
                                {expItems.map((exp) => (
                                    <div key={exp.id} className="relative">
                                        <div className="absolute top-1 -left-6 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                                        <h4 className="font-bold text-foreground">{exp.role}</h4>
                                        <p className="text-sm text-primary font-medium mt-1">{exp.organization} • {exp.period}</p>
                                        <p className="text-sm mt-2 leading-relaxed">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
