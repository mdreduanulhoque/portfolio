"use client";

import * as React from "react";
import { Terminal, Copy, HardDrive, Cpu, FileJson, Code2 } from "lucide-react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { Skill } from "@/lib/data";

const fallbackSkills: Skill[] = [
    { id: "1", name: "HTML5.exe", type: "Core", size: "124 KB", order: 0 },
    { id: "2", name: "CSS3.exe", type: "Core", size: "256 KB", order: 1 },
    { id: "3", name: "Tailwind_CSS.exe", type: "Framework", size: "8.4 MB", order: 2 },
    { id: "4", name: "JavaScript.exe", type: "Language", size: "4.2 MB", order: 3 },
    { id: "5", name: "jQuery.exe", type: "Library", size: "88 KB", order: 4 },
    { id: "6", name: "NodeJS.exe", type: "Runtime", size: "32 MB", order: 5 },
    { id: "7", name: "C_Language.exe", type: "Language", size: "1.1 MB", order: 6 },
    { id: "8", name: "CPlusPlus.exe", type: "Language", size: "2.4 MB", order: 7 },
    { id: "9", name: "WordPress.exe", type: "CMS", size: "64 MB", order: 8 },
    { id: "10", name: "Canva.exe", type: "Design", size: "12 MB", order: 9 },
    { id: "11", name: "MS_Office_Suite.exe", type: "Tools", size: "1.2 GB", order: 10 },
];

function SkillsSkeleton() {
    return (
        <section id="skills" className="py-24 bg-background text-foreground relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <div className="flex flex-col items-center gap-4 mb-16">
                    <div className="h-12 w-56 bg-muted animate-pulse rounded-lg" />
                    <div className="h-5 w-72 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-96 bg-muted animate-pulse rounded-xl" />
            </div>
        </section>
    );
}

export function SkillsSection() {
    const { data: skills, loading } = useFirestoreCollection<Skill>("skills");

    if (loading) return <SkillsSkeleton />;

    const installedSkills = skills.length > 0 ? skills : fallbackSkills;

    return (
        <section id="skills" className="py-24 bg-background text-foreground relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
                <div className="flex flex-col items-center gap-4 mb-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tight font-lora sm:text-5xl">Skills Installed</h2>
                    <p className="text-muted-foreground font-mono text-sm">
                        C:\Users\Reduan\AppData\Local\Programs
                    </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-[#0f172a] shadow-2xl overflow-hidden max-w-4xl mx-auto">
                    {/* Terminal Header */}
                    <div className="flex items-center px-4 py-3 bg-[#1e293b] border-b border-border/20 justify-between">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-400 transition-colors"></div>
                        </div>
                        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                            <HardDrive className="w-3 h-3" /> System_Root
                        </div>
                        <div className="w-12"></div>
                    </div>

                    {/* Terminal Body */}
                    <div className="p-4 md:p-6 font-mono text-sm overflow-x-auto">
                        <div className="text-emerald-400 mb-4">
                            <span className="text-pink-500">PS C:\Users\Reduan\Skills{">"}</span> ls -l
                        </div>

                        <div className="min-w-[600px]">
                            <div className="grid grid-cols-12 gap-4 text-slate-500 border-b border-slate-700/50 pb-2 mb-3">
                                <div className="col-span-1">Mode</div>
                                <div className="col-span-2">LastWriteTime</div>
                                <div className="col-span-2 text-right">Length</div>
                                <div className="col-span-7">Name</div>
                            </div>

                            {installedSkills.map((skill) => (
                                <div key={skill.id} className="grid grid-cols-12 gap-4 text-slate-300 py-1.5 hover:bg-white/5 transition-colors rounded px-2 -mx-2 items-center group cursor-default">
                                    <div className="col-span-1 text-slate-500">-rwxrwx</div>
                                    <div className="col-span-2 text-slate-500">Recent</div>
                                    <div className="col-span-2 text-right text-cyan-400">{skill.size}</div>
                                    <div className="col-span-7 flex items-center gap-2">
                                        <FileJson className="w-4 h-4 text-emerald-500" />
                                        <span className="group-hover:text-emerald-400 transition-colors">{skill.name}</span>
                                        <span className="text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity ml-4">// {skill.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-emerald-400 flex items-center animate-pulse">
                            <span className="text-pink-500">PS C:\Users\Reduan\Skills{">"}</span> <span className="ml-2 w-2 h-4 bg-emerald-400"></span>
                        </div>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-12 border-t border-border/40 text-center">
                    <div className="space-y-2 group">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Cpu className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-medium text-sm">Processing</h4>
                        <p className="text-xs text-muted-foreground">Fast & Efficient</p>
                    </div>
                    <div className="space-y-2 group">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Code2 className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-medium text-sm">Logic</h4>
                        <p className="text-xs text-muted-foreground">Clean Algorithms</p>
                    </div>
                    <div className="space-y-2 group">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Terminal className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-medium text-sm">Execution</h4>
                        <p className="text-xs text-muted-foreground">No Excuses</p>
                    </div>
                    <div className="space-y-2 group">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Copy className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-medium text-sm">Continuous</h4>
                        <p className="text-xs text-muted-foreground">Always Learning</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
