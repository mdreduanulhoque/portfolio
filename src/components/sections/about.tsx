import * as React from "react";
import { GraduationCap, Briefcase, BookOpen, Trophy, Heart } from "lucide-react";

export function AboutSection() {
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
                                <BookOpen className="h-5 w-5 text-primary" /> The Philosophy
                            </h3>
                            <p className="leading-relaxed mb-4">
                                I'm a passionate Computer Science and Engineering student at UIU.
                                I find joy in problem-solving, building web applications, and diving deep into the fundamentals of how things work.
                            </p>
                            <p className="leading-relaxed text-sm">
                                Whether mentoring in the Competitive Programming Community or teaching science to high schoolers, I believe teaching is the purest form of learning.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                <Heart className="h-4 w-4 text-rose-500" /> System Variables (Hobbies)
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {["Reading", "Football", "Analyzing games", "Exploring", "Coffee ☕"].map((hobby) => (
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
                                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-start gap-3">
                                    <span className="text-2xl leading-none">🏆</span>
                                    <div>
                                        <p className="font-bold">1st Runner-up</p>
                                        <p className="text-xs opacity-80 mt-1">at Phitron X App Forum: KickStart Contest</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-start gap-3">
                                    <span className="text-2xl leading-none">🥉</span>
                                    <div>
                                        <p className="font-bold">8th Runner-up & Bronze Medalist</p>
                                        <p className="text-xs opacity-80 mt-1">at "BeatCode 253"</p>
                                    </div>
                                </div>
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

                                <div className="relative">
                                    <div className="absolute top-1 -left-6 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                                    <h4 className="font-bold text-foreground">United International University</h4>
                                    <p className="text-sm text-primary font-medium mt-1">Present (5th Trimester)</p>
                                    <p className="text-sm mt-2">B.Sc. in Computer Science & Engineering</p>
                                    <p className="text-xs font-mono mt-1 bg-muted inline-block px-2 py-0.5 rounded">CGPA: 3.90/4.00</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute top-1 -left-6 w-2.5 h-2.5 rounded-full bg-muted-foreground ring-4 ring-background"></div>
                                    <h4 className="font-bold text-foreground">Gurudayal Govt College</h4>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">2023 - 2024</p>
                                    <p className="text-sm mt-2">HSC - Science Group</p>
                                    <p className="text-xs font-mono mt-1 bg-muted inline-block px-2 py-0.5 rounded">GPA: 5.00/5.00</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute top-1 -left-6 w-2.5 h-2.5 rounded-full bg-muted-foreground ring-4 ring-background"></div>
                                    <h4 className="font-bold text-foreground">Kishoreganj Govt Boys High School</h4>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">2021 - 2022</p>
                                    <p className="text-sm mt-2">SSC - Science Group</p>
                                    <p className="text-xs font-mono mt-1 bg-muted inline-block px-2 py-0.5 rounded">GPA: 5.00/5.00</p>
                                </div>

                            </div>
                        </div>

                        {/* Experience Timeline */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-lora border-b border-border/50 pb-4">
                                <Briefcase className="h-5 w-5 text-primary" /> Experience
                            </h3>
                            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-border/50 before:to-transparent">

                                <div className="relative">
                                    <div className="absolute top-1 -left-6 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                                    <h4 className="font-bold text-foreground">Volunteer</h4>
                                    <p className="text-sm text-primary font-medium mt-1">UIU CPC • 2025 - Present</p>
                                    <p className="text-sm mt-2 leading-relaxed">Organizing contests & mentoring junior students in algorithmic problem-solving.</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute top-1 -left-6 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                                    <h4 className="font-bold text-foreground">Course Instructor</h4>
                                    <p className="text-sm text-primary font-medium mt-1">NovoNex • 2024 - Present</p>
                                    <p className="text-sm mt-2 leading-relaxed">Mentoring in Intro to Computing, C Programming & OOP.</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute top-1 -left-6 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                                    <h4 className="font-bold text-foreground">General Member</h4>
                                    <p className="text-sm text-primary font-medium mt-1">UIU Computer Club • 2024 - Present</p>
                                    <p className="text-sm mt-2 leading-relaxed">Project management and team collaboration for club events.</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute top-1 -left-6 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                                    <h4 className="font-bold text-foreground">Science Teacher</h4>
                                    <p className="text-sm text-primary font-medium mt-1">IHT Study Point • 2023 - Present</p>
                                    <p className="text-sm mt-2 leading-relaxed">Mentoring 500+ students in Physics, Chemistry & Biology.</p>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
