"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { useFirestoreDoc } from "@/hooks/useFirestoreDoc";
import { db } from "@/lib/firebase";
import { doc, setDoc, writeBatch, collection } from "firebase/firestore";
import type { Profile, Education, Experience, Achievement, Project, Skill, ClassItem, SocialLinks, BlogPost } from "@/lib/data";
import { fallbackBlogPosts, fallbackProfile, fallbackSocialLinks, fallbackEducation, fallbackExperience, fallbackAchievements, fallbackProjects, fallbackSkills, fallbackClasses } from "@/lib/data";
import {
  User,
  GraduationCap,
  Briefcase,
  Trophy,
  Code2,
  BookOpen,
  ArrowRight,
  Database,
  Loader2,
  Newspaper,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";



export default function AdminDashboardOverview() {
  const { data: profile } = useFirestoreDoc<Profile>("profile", "main");
  const { data: socialLinks } = useFirestoreDoc<SocialLinks>("social_links", "main");
  const { data: edu } = useFirestoreCollection<Education>("education");
  const { data: exp } = useFirestoreCollection<Experience>("experience");
  const { data: achievements } = useFirestoreCollection<Achievement>("achievements");
  const { data: projects } = useFirestoreCollection<Project>("projects");
  const { data: skills } = useFirestoreCollection<Skill>("skills");
  const { data: classes } = useFirestoreCollection<ClassItem>("classes");
  const { data: updates } = useFirestoreCollection<BlogPost>("updates");

  const [seeding, setSeeding] = useState(false);

  const sections = [
    { name: "Updates", count: updates.length, href: "/admin/updates", icon: Newspaper, desc: "Write, edit, and archive blog articles, thoughts, and updates." },
    { name: "Profile", count: profile ? 1 : 0, href: "/admin/profile", icon: User, desc: "Manage name, bio, philosophy, hobbies, and profile photo." },
    { name: "Education", count: edu.length, href: "/admin/education", icon: GraduationCap, desc: "Manage university, high school, degrees, and GPA info." },
    { name: "Experience", count: exp.length, href: "/admin/experience", icon: Briefcase, desc: "Manage roles, organizations, dates, and descriptions." },
    { name: "Achievements", count: achievements.length, href: "/admin/achievements", icon: Trophy, desc: "Manage awards, contest runner-ups, and emojis." },
    { name: "Projects", count: projects.length, href: "/admin/projects", icon: Code2, desc: "Manage coding projects, features, tech stack, and URLs." },
    { name: "Skills", count: skills.length, href: "/admin/skills", icon: BookOpen, desc: "Manage skills list, file size style, and categories." },
    { name: "Classes", count: classes.length, href: "/admin/classes", icon: BookOpen, desc: "Manage YouTube classes, descriptions, and video IDs." },
    { name: "Social Links", count: socialLinks ? 1 : 0, href: "/admin/social-links", icon: Share2, desc: "Manage social profiles, email, and resume URLs." },
  ];

  const handleSeedDatabase = async () => {
    if (!confirm("Are you sure you want to seed the database? This will copy all original portfolio content into Firestore!")) return;
    setSeeding(true);

    try {
      // 1. Seed Profile
      await setDoc(doc(db, "profile", "main"), fallbackProfile);

      // 2. Seed Social Links
      await setDoc(doc(db, "social_links", "main"), fallbackSocialLinks);

      // 3. Seed Collections using Batches
      const batch = writeBatch(db);

      // Education
      fallbackEducation.forEach((item) => {
        const docRef = doc(db, "education", item.id);
        const data = { ...item };
        delete (data as { id?: string }).id;
        batch.set(docRef, data);
      });

      // Experience
      fallbackExperience.forEach((item) => {
        const docRef = doc(db, "experience", item.id);
        const data = { ...item };
        delete (data as { id?: string }).id;
        batch.set(docRef, data);
      });

      // Achievements
      fallbackAchievements.forEach((item) => {
        const docRef = doc(db, "achievements", item.id);
        const data = { ...item };
        delete (data as { id?: string }).id;
        batch.set(docRef, data);
      });

      // Projects
      fallbackProjects.forEach((item) => {
        const docRef = doc(db, "projects", item.id);
        const data = { ...item };
        delete (data as { id?: string }).id;
        batch.set(docRef, data);
      });

      // Skills
      fallbackSkills.forEach((item) => {
        const docRef = doc(db, "skills", item.id);
        const data = { ...item };
        delete (data as { id?: string }).id;
        batch.set(docRef, data);
      });

      // Classes
      fallbackClasses.forEach((item) => {
        const docRef = doc(db, "classes", item.id);
        const data = { ...item };
        delete (data as { id?: string }).id;
        batch.set(docRef, data);
      });

      // Updates (Blog)
      fallbackBlogPosts.forEach((item) => {
        const docRef = doc(db, "updates", item.id);
        const data = { ...item };
        delete (data as { id?: string }).id;
        batch.set(docRef, data);
      });

      await batch.commit();
      toast.success("Database seeded successfully with default values!");
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast.error(`Seeding failed: ${msg}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 font-mono text-sm">
      <div>
        <h1 className="text-3xl font-bold font-lora text-foreground">Command Center Overview</h1>
        <p className="text-muted-foreground font-mono text-xs mt-1">Status check: All systems operational.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.name}
              href={section.href}
              className="group p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold bg-muted px-2.5 py-1 rounded-full text-foreground border border-border/40">
                    {section.count} {section.count === 1 ? "document" : "documents"}
                  </span>
                </div>
                <h3 className="font-bold text-foreground font-lora text-lg group-hover:text-primary transition-colors">
                  {section.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {section.desc}
                </p>
              </div>
              <div className="flex items-center text-xs font-mono font-bold text-primary mt-6 group-hover:translate-x-1 transition-transform">
                Configure
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Database Seeding Utility Section */}
      <div className="p-6 rounded-2xl border border-dashed border-border bg-muted/20 space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-foreground font-lora text-lg">Database Setup & Seeding</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              If this is your first time deploying or launching the site on a new Firebase database, you can seed all standard content automatically. This matches your original hardcoded experience, education, projects, skills, and classes so you don&apos;t start with a blank portfolio.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeedDatabase}
            className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            {seeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Seeding Data...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Seed Original Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

