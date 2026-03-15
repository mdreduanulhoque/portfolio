import * as React from "react";
import { Terminal, Copy, HardDrive, Cpu, FileJson, Code2 } from "lucide-react";

export function SkillsSection() {
    const installedSkills = [
        { name: "HTML5.exe", type: "Core", size: "124 KB" },
        { name: "CSS3.exe", type: "Core", size: "256 KB" },
        { name: "Tailwind_CSS.exe", type: "Framework", size: "8.4 MB" },
        { name: "JavaScript.exe", type: "Language", size: "4.2 MB" },
        { name: "jQuery.exe", type: "Library", size: "88 KB" },
        { name: "NodeJS.exe", type: "Runtime", size: "32 MB" },
        { name: "C_Language.exe", type: "Language", size: "1.1 MB" },
        { name: "CPlusPlus.exe", type: "Language", size: "2.4 MB" },
        { name: "WordPress.exe", type: "CMS", size: "64 MB" },
        { name: "Canva.exe", type: "Design", size: "12 MB" },
        { name: "MS_Office_Suite.exe", type: "Tools", size: "1.2 GB" },
    ];

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
                        <div className="w-12"></div> {/* Spacer for center alignment */}
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

                            {installedSkills.map((skill, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 text-slate-300 py-1.5 hover:bg-white/5 transition-colors rounded px-2 -mx-2 items-center group cursor-default">
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
