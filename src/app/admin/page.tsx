"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { useFirestoreDoc } from "@/hooks/useFirestoreDoc";
import { db } from "@/lib/firebase";
import { doc, setDoc, writeBatch, collection } from "firebase/firestore";
import type { Profile, Education, Experience, Achievement, Project, Skill, ClassItem, SocialLinks } from "@/lib/data";
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
} from "lucide-react";
import toast from "react-hot-toast";

const fallbackProfile: Profile = {
  name: "MD REDUANUL HOQUE",
  tagline: "\"Bro, we have one life. Why waste it? Let's follow the orders of God, make Him happy & pass innovations to the next generations.\"",
  badges: ["Computer Science Student", "Educator"],
  location: "Dhaka, Bangladesh",
  eduStatus: "5th Trimester B.Sc. in CSE @ UIU",
  statusLine: "Learning, Building, Teaching...",
  hobbies: ["Reading", "Football", "Gaming", "☕"],
  philosophyTitle: "The Philosophy",
  philosophyParagraphs: [
    "I'm a passionate Computer Science and Engineering student at UIU. I find joy in problem-solving, building web applications, and diving deep into the fundamentals of how things work.",
    "Whether mentoring in the Competitive Programming Community or teaching science to high schoolers, I believe teaching is the purest form of learning."
  ],
  profileImageUrl: "/Formal.jpg",
  resumeUrl: "/md_reduanul_hoque_resume.pdf",
};

const fallbackSocialLinks: SocialLinks = {
  email: "mdreduanulhoquesadik@gmail.com",
  linkedin: "https://www.linkedin.com/in/md-reduanul-hoque-/",
  github: "https://github.com/mdreduanulhoque",
  facebook: "https://www.facebook.com/reduan.sadik.9",
  resumeUrl: "/md_reduanul_hoque_resume.pdf",
};

const fallbackEducation: Education[] = [
  { id: "edu1", institution: "United International University", period: "Present (5th Trimester)", degree: "B.Sc. in Computer Science & Engineering", grade: "CGPA: 3.90/4.00", isCurrent: true, order: 0 },
  { id: "edu2", institution: "Gurudayal Govt College", period: "2023 - 2024", degree: "HSC - Science Group", grade: "GPA: 5.00/5.00", isCurrent: false, order: 1 },
  { id: "edu3", institution: "Kishoreganj Govt Boys High School", period: "2021 - 2022", degree: "SSC - Science Group", grade: "GPA: 5.00/5.00", isCurrent: false, order: 2 },
];

const fallbackExperience: Experience[] = [
  { id: "exp1", role: "Volunteer", organization: "UIU CPC", period: "2025 - Present", description: "Organizing contests & mentoring junior students in algorithmic problem-solving.", isCurrent: true, order: 0 },
  { id: "exp2", role: "Course Instructor", organization: "NovoNex", period: "2024 - Present", description: "Mentoring in Intro to Computing, C Programming & OOP.", isCurrent: true, order: 1 },
  { id: "exp3", role: "General Member", organization: "UIU Computer Club", period: "2024 - Present", description: "Project management and team collaboration for club events.", isCurrent: true, order: 2 },
  { id: "exp4", role: "Science Teacher", organization: "IHT Study Point", period: "2023 - Present", description: "Mentoring 500+ students in Physics, Chemistry & Biology.", isCurrent: true, order: 3 },
];

const fallbackAchievements: Achievement[] = [
  { id: "ach1", title: "1st Runner-up", subtitle: "at Phitron X App Forum: KickStart Contest", emoji: "🏆", order: 0 },
  { id: "ach2", title: "8th Runner-up & Bronze Medalist", subtitle: "at \"BeatCode 253\"", emoji: "🥉", order: 1 },
];

const fallbackProjects: Project[] = [
  { id: "proj1", title: "Simon Game", description: "A classic colorful memory game. Features interactive buttons, sound effects, full responsiveness, and game over animations.", techStack: ["HTML5", "CSS3", "JS (ES6)", "jQuery"], liveLink: "https://mdreduanulhoque.github.io/SimonGame/", githubLink: "https://github.com/mdreduanulhoque/SimonGame", features: ["Colorful interactive buttons", "Sound effects for each color", "Game Over animation"], order: 0 },
  { id: "proj2", title: "Vibe Chess", description: "A relaxing, timer-based chess variant. Games end when the 5-minute timer expires, winner determined by territorial control.", techStack: ["Vanilla JS", "HTML5", "CSS3"], liveLink: "https://mdreduanulhoque.github.io/vibe-chess/", githubLink: "https://github.com/mdreduanulhoque/vibe-chess", features: ["Territorial Victory System", "Relaxing Design & Animations", "Smart 5-minute Timer display"], order: 1 },
  { id: "proj3", title: "Array Memory Visualizer", description: "A visualization tool for Array Memory Mapping. Shows grid generation, step-by-step calculations, and major mapping.", techStack: ["JavaScript", "HTML", "CSS"], liveLink: "https://mdreduanulhoque.github.io/Array-Memory-Mapping/", githubLink: "https://github.com/mdreduanulhoque/Array-Memory-Mapping", features: ["Dynamic grid generation", "Row/Column Major mapping", "Formula calculation steps"], order: 2 },
];

const fallbackSkills: Skill[] = [
  { id: "sk1", name: "HTML5.exe", type: "Core", size: "124 KB", order: 0 },
  { id: "sk2", name: "CSS3.exe", type: "Core", size: "256 KB", order: 1 },
  { id: "sk3", name: "Tailwind_CSS.exe", type: "Framework", size: "8.4 MB", order: 2 },
  { id: "sk4", name: "JavaScript.exe", type: "Language", size: "4.2 MB", order: 3 },
  { id: "sk5", name: "jQuery.exe", type: "Library", size: "88 KB", order: 4 },
  { id: "sk6", name: "NodeJS.exe", type: "Runtime", size: "32 MB", order: 5 },
  { id: "sk7", name: "C_Language.exe", type: "Language", size: "1.1 MB", order: 6 },
  { id: "sk8", name: "CPlusPlus.exe", type: "Language", size: "2.4 MB", order: 7 },
  { id: "sk9", name: "WordPress.exe", type: "CMS", size: "64 MB", order: 8 },
  { id: "sk10", name: "Canva.exe", type: "Design", size: "12 MB", order: 9 },
  { id: "sk11", name: "MS_Office_Suite.exe", type: "Tools", size: "1.2 GB", order: 10 },
];

const fallbackClasses: ClassItem[] = [
  { id: "cl1", title: "Thread in Java || Question Solve || OOP", videoId: "uobWZ7FA6XM", description: "A detailed problem-solving session covering Threads in Object-Oriented Programming.", url: "https://youtu.be/uobWZ7FA6XM?si=87TNoOs94kpDdL2S", order: 0 },
  { id: "cl2", title: "GUI - Design Part in Java", videoId: "Rs6k1PNkVf4", description: "A comprehensive guide on designing Graphical User Interfaces (GUI) in Java.", url: "https://youtu.be/Rs6k1PNkVf4?si=nMWrT2wIJMuSGoRP", order: 1 },
  { id: "cl3", title: "ICS One Shot Class For Mid", videoId: "GWtQ2FKl6ks", description: "A complete one-shot review class designed to prepare students for the Introduction to Computer Systems (ICS) midterm.", url: "https://youtu.be/GWtQ2FKl6ks?si=scAGxTYf92YBeWY-", order: 2 },
];

export default function AdminDashboardOverview() {
  const { data: profile } = useFirestoreDoc<Profile>("profile", "main");
  const { data: socialLinks } = useFirestoreDoc<SocialLinks>("social_links", "main");
  const { data: edu } = useFirestoreCollection<Education>("education");
  const { data: exp } = useFirestoreCollection<Experience>("experience");
  const { data: achievements } = useFirestoreCollection<Achievement>("achievements");
  const { data: projects } = useFirestoreCollection<Project>("projects");
  const { data: skills } = useFirestoreCollection<Skill>("skills");
  const { data: classes } = useFirestoreCollection<ClassItem>("classes");

  const [seeding, setSeeding] = useState(false);

  const sections = [
    { name: "Profile", count: profile ? 1 : 0, href: "/admin/profile", icon: User, desc: "Manage name, bio, philosophy, hobbies, and profile photo." },
    { name: "Education", count: edu.length, href: "/admin/education", icon: GraduationCap, desc: "Manage university, high school, degrees, and GPA info." },
    { name: "Experience", count: exp.length, href: "/admin/experience", icon: Briefcase, desc: "Manage roles, organizations, dates, and descriptions." },
    { name: "Achievements", count: achievements.length, href: "/admin/achievements", icon: Trophy, desc: "Manage awards, contest runner-ups, and emojis." },
    { name: "Projects", count: projects.length, href: "/admin/projects", icon: Code2, desc: "Manage coding projects, features, tech stack, and URLs." },
    { name: "Skills", count: skills.length, href: "/admin/skills", icon: BookOpen, desc: "Manage skills list, file size style, and categories." },
    { name: "Classes", count: classes.length, href: "/admin/classes", icon: BookOpen, desc: "Manage YouTube classes, descriptions, and video IDs." },
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
        const docRef = doc(collection(db, "education"));
        const { id, ...data } = item;
        batch.set(docRef, data);
      });

      // Experience
      fallbackExperience.forEach((item) => {
        const docRef = doc(collection(db, "experience"));
        const { id, ...data } = item;
        batch.set(docRef, data);
      });

      // Achievements
      fallbackAchievements.forEach((item) => {
        const docRef = doc(collection(db, "achievements"));
        const { id, ...data } = item;
        batch.set(docRef, data);
      });

      // Projects
      fallbackProjects.forEach((item) => {
        const docRef = doc(collection(db, "projects"));
        const { id, ...data } = item;
        batch.set(docRef, data);
      });

      // Skills
      fallbackSkills.forEach((item) => {
        const docRef = doc(collection(db, "skills"));
        const { id, ...data } = item;
        batch.set(docRef, data);
      });

      // Classes
      fallbackClasses.forEach((item) => {
        const docRef = doc(collection(db, "classes"));
        const { id, ...data } = item;
        batch.set(docRef, data);
      });

      await batch.commit();
      toast.success("Database seeded successfully with default values!");
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(`Seeding failed: ${err.message}`);
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
              If this is your first time deploying or launching the site on a new Firebase database, you can seed all standard content automatically. This matches your original hardcoded experience, education, projects, skills, and classes so you don't start with a blank portfolio.
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
