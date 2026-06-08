"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminGuard } from "@/components/admin/admin-guard";
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
} from "lucide-react";

const navigationItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
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

  // If we are on the login page, don't show the dashboard sidebar layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col md:flex-row bg-background">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
          <div className="p-6 border-b border-border/40 flex items-center justify-between">
            <Link href="/" className="font-mono text-sm font-bold text-foreground">
              reduan@portfolio
            </Link>
            <button
              onClick={() => signOut()}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <nav className="p-4 space-y-1 font-mono text-xs">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}

            <button
              onClick={() => signOut()}
              className="hidden md:flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors font-mono text-xs cursor-pointer mt-8"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
