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

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background/50 hover:bg-accent hover:border-primary/40 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <Moon className="h-4 w-4 text-primary transition-transform duration-200" />
            ) : (
                <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200" />
            )}
        </button>
    );
}
