"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Logo removed as per user request */}
                    </div>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link href="#about" className="transition-colors hover:text-primary">About</Link>
                        <Link href="#projects" className="transition-colors hover:text-primary">Projects</Link>
                        <Link href="#classes" className="transition-colors hover:text-primary">Classes</Link>
                        <Link href="#skills" className="transition-colors hover:text-primary">Skills</Link>
                        <Link href="#contact" className="transition-colors hover:text-primary">Contact</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <a
                            href="/md_reduanul_hoque_resume.pdf"
                            download
                            className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                            Resume
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}
