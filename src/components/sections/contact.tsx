import * as React from "react";
import { Mail, Github, Linkedin, MapPin } from "lucide-react";

export function ContactSection() {
    return (
        <section id="contact" className="py-24 relative overflow-hidden bg-muted/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="flex flex-col items-center gap-4 mb-16 text-center">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary font-mono cursor-default hover:bg-primary/20 transition-colors">
                        ./ping_me.sh
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight font-lora sm:text-5xl relative inline-block">
                        Let's Connect
                        <div className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
                        I'm always open to discussing tech, sharing ideas, or exploring opportunities. Feel free to reach out to me through any of the channels below.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    <a href="mailto:mdreduanulhoquesadik@gmail.com" className="group p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg transition-all flex items-center gap-4 hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Email</h3>
                            <p className="text-sm text-muted-foreground mt-1">mdreduanulhoquesadik@gmail.com</p>
                        </div>
                    </a>

                    <a href="https://www.linkedin.com/in/md-reduanul-hoque-/" target="_blank" rel="noreferrer" className="group p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:border-[#0A66C2]/50 hover:shadow-lg transition-all flex items-center gap-4 hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-full bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2] group-hover:scale-110 group-hover:bg-[#0A66C2] group-hover:text-white transition-all duration-300">
                            <Linkedin className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">LinkedIn</h3>
                            <p className="text-sm text-muted-foreground mt-1">Connect professionally</p>
                        </div>
                    </a>

                    <a href="https://github.com/mdreduanulhoque" target="_blank" rel="noreferrer" className="group p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:border-foreground/50 hover:shadow-lg transition-all flex items-center gap-4 hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center text-foreground group-hover:scale-110 group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                            <Github className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">GitHub</h3>
                            <p className="text-sm text-muted-foreground mt-1">Check out my repos</p>
                        </div>
                    </a>

                    <a href="https://www.facebook.com/reduan.sadik.9" target="_blank" rel="noreferrer" className="group p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:border-[#1877F2]/50 hover:shadow-lg transition-all flex items-center gap-4 hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] group-hover:scale-110 group-hover:bg-[#1877F2] group-hover:text-white transition-all duration-300">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Facebook</h3>
                            <p className="text-sm text-muted-foreground mt-1">Say hello!</p>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    );
}
