"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useFirestoreDoc } from "@/hooks/useFirestoreDoc";
import type { Profile } from "@/lib/data";

export function Navbar() {
    const pathname = usePathname();
    const { data: profile } = useFirestoreDoc<Profile>("profile", "main");

    // Do not render public navbar on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    const isHome = pathname === "/";
    const isUpdates = pathname?.startsWith("/updates") ?? false;
    const resumeUrl = profile?.resumeUrl || "/md_reduanul_hoque_resume.pdf";

    const getSectionHref = (hash: string) => {
        return isHome ? hash : `/${hash}`;
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Logo removed as per user request */}
                    </div>

                    <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
                        <Link href={getSectionHref("#about")} className="transition-colors hover:text-primary">About</Link>
                        <Link href={getSectionHref("#projects")} className="transition-colors hover:text-primary">Projects</Link>
                        <Link href={getSectionHref("#classes")} className="transition-colors hover:text-primary">Classes</Link>
                        <Link href={getSectionHref("#skills")} className="hidden sm:inline-block transition-colors hover:text-primary">Skills</Link>
                        <Link href={getSectionHref("#contact")} className="transition-colors hover:text-primary">Contact</Link>
                        <Link
                            href="/updates"
                            className={`transition-colors relative py-1 hover:text-primary ${
                                isUpdates
                                    ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                                    : "text-muted-foreground"
                            }`}
                        >
                            Updates
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noreferrer"
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
