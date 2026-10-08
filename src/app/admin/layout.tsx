"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminGuard } from "@/components/admin/admin-guard";
import toast from "react-hot-toast";
import {
  User,
  GraduationCap,
  Briefcase,
  Trophy,
  Code2,
  BookOpen,
  Share2,
  LogOut,
  LayoutDashboard,
  Newspaper,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

const navigationItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Updates", href: "/admin/updates", icon: Newspaper },
  { name: "Profile", href: "/admin/profile", icon: User },
  { name: "Education", href: "/admin/education", icon: GraduationCap },
  { name: "Experience", href: "/admin/experience", icon: Briefcase },
  { name: "Achievements", href: "/admin/achievements", icon: Trophy },
  { name: "Projects", href: "/admin/projects", icon: Code2 },
  { name: "Skills", href: "/admin/skills", icon: BookOpen },
  { name: "Classes", href: "/admin/classes", icon: BookOpen },
  { name: "Social Links", href: "/admin/social-links", icon: Share2 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If we are on the login page, don't show the dashboard sidebar layout
  if (pathname === "/admin/login" || pathname === "/admin/login/") {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully.");
      router.push("/admin/login");
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign out.");
    }
  };

  const normalizePath = (path: string) => path.replace(/\/$/, "") || "/";
  const currentNormalized = normalizePath(pathname || "");

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col md:flex-row bg-background">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
          <div className="p-4 md:p-6 border-b border-border/40 flex items-center justify-between">
            <Link
              href="/"
              className="font-mono text-sm font-bold text-foreground flex items-center gap-1.5 hover:text-primary transition-colors"
              title="Return to Public Site"
            >
              <span>reduan@portfolio</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </Link>

            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                title="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav
            className={`p-4 space-y-1 font-mono text-xs ${
              mobileMenuOpen ? "block" : "hidden md:block"
            }`}
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const itemNormalized = normalizePath(item.href);
              const isActive = currentNormalized === itemNormalized;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}

            <button
              onClick={handleSignOut}
              className="hidden md:flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors font-mono text-xs cursor-pointer mt-8"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-10 overflow-y-auto max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
