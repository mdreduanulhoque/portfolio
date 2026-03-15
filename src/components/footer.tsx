import * as React from "react";
import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-background mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="flex flex-col items-center justify-center gap-6 text-center">
                    <p className="text-sm leading-loose text-muted-foreground">
                        Built by{" "}
                        <span className="font-medium text-foreground">Reduanul Hoque</span>
                        . Deep thinking, silent execution. 🥷🧠
                    </p>
                    <div className="flex items-center gap-4 justify-center">
                        <a
                            href="https://github.com/mdreduanulhoque"
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="GitHub"
                        >
                            <Github className="h-5 w-5" />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/md-reduanul-hoque-/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="h-5 w-5" />
                        </a>
                        <a
                            href="mailto:mdreduanulhoquesadik@gmail.com"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Email"
                        >
                            <Mail className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
