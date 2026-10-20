"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useFirestoreDoc } from "@/hooks/useFirestoreDoc";
import { fallbackProfile, type Profile } from "@/lib/data";

function applyFaviconHref(href: string) {
    const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    if (links.length > 0) {
        links.forEach((link) => {
            link.href = href;
        });
    } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = href;
        document.head.appendChild(link);
    }
}

export function Navbar() {
    const pathname = usePathname();
    const { data: profile } = useFirestoreDoc<Profile>("profile", "main");
    const profileImageUrl = profile?.profileImageUrl || fallbackProfile.profileImageUrl;

    React.useEffect(() => {
        if (!profileImageUrl) return;

        let cancelled = false;
        const img = new window.Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            if (cancelled) return;
            try {
                const size = 64;
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    applyFaviconHref(profileImageUrl);
                    return;
                }

                // Crop a square focused on the upper/face region for portrait photos
                const sSize = Math.min(img.width, img.height);
                const sx = (img.width - sSize) / 2;
                const sy = img.height > img.width ? (img.height - sSize) * 0.12 : 0;

                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, size, size);
                applyFaviconHref(canvas.toDataURL("image/png"));
            } catch {
                applyFaviconHref(profileImageUrl);
            }
        };

        img.onerror = () => {
            if (!cancelled) {
                applyFaviconHref(profileImageUrl);
            }
        };

        img.src = profileImageUrl;

        return () => {
            cancelled = true;
        };
    }, [profileImageUrl]);

    // Do not render public navbar on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    const isHome = pathname === "/";
    const isUpdates = pathname?.startsWith("/updates") ?? false;
    const isCertificates = pathname?.startsWith("/certificates") ?? false;
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
                        <Link
                            href={isHome ? "#certificates" : "/certificates"}
                            className={`transition-colors relative py-1 hover:text-primary ${
                                isCertificates
                                    ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                                    : "text-muted-foreground hover:text-primary"
                            }`}
                        >
                            Certificates
                        </Link>
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
