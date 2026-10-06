"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const [mounted, setMounted] = React.useState(false);
    const { setTheme, resolvedTheme } = useTheme();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background/50 text-muted-foreground hover:bg-accent transition-colors"
                aria-label="Toggle theme"
            >
                <Sun className="h-4 w-4 opacity-50" />
            </button>
        );
    }

    const isDark = resolvedTheme === "dark";

    const handleToggle = () => {
        const nextTheme = isDark ? "light" : "dark";
        if (typeof document !== "undefined") {
            document.documentElement.classList.add("theme-transitioning");
            setTheme(nextTheme);
            window.setTimeout(() => {
                document.documentElement.classList.remove("theme-transitioning");
            }, 350);
        } else {
            setTheme(nextTheme);
        }
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background/50 hover:bg-accent hover:border-primary/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary overflow-hidden"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <Sun
                className={`h-4 w-4 text-amber-500 transition-all duration-300 ease-in-out ${
                    isDark
                        ? "rotate-90 scale-0 opacity-0 pointer-events-none"
                        : "rotate-0 scale-100 opacity-100"
                }`}
            />
            <Moon
                className={`absolute h-4 w-4 text-primary transition-all duration-300 ease-in-out ${
                    isDark
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-0 opacity-0 pointer-events-none"
                }`}
            />
        </button>
    );
}
