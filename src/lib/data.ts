import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ────────────────────────────────────────────────────────────

export interface Profile {
  name: string;
  tagline: string;
  badges: string[];
  location: string;
  eduStatus: string;
  statusLine: string;
  hobbies: string[];
  philosophyTitle: string;
  philosophyParagraphs: string[];
  profileImageUrl: string;
  resumeUrl: string;
}

export interface Education {
  id: string;
  institution: string;
  period: string;
  degree: string;
  grade: string;
  isCurrent: boolean;
  order: number;
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  period: string;
  description: string;
  isCurrent: boolean;
  order: number;
}

export interface Achievement {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  liveLink: string;
  githubLink: string;
  order: number;
}

export interface Skill {
  id: string;
  name: string;
  type: string;
  size: string;
  order: number;
}

export interface ClassItem {
  id: string;
  title: string;
  videoId: string;
  description: string;
  url: string;
  order: number;
}

export interface SocialLinks {
  email: string;
  linkedin: string;
  github: string;
  facebook: string;
  resumeUrl: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  isPublic: boolean;
  readTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Fetch Functions ──────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  try {
    const docRef = doc(db, "profile", "main");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Profile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

async function getOrderedCollection<T>(
  collectionName: string
): Promise<T[]> {
  try {
    const q = query(
      collection(db, collectionName),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as T)
    );
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

export async function getEducation(): Promise<Education[]> {
  return getOrderedCollection<Education>("education");
}

export async function getExperience(): Promise<Experience[]> {
  return getOrderedCollection<Experience>("experience");
}

export async function getAchievements(): Promise<Achievement[]> {
  return getOrderedCollection<Achievement>("achievements");
}

export async function getProjects(): Promise<Project[]> {
  return getOrderedCollection<Project>("projects");
}

export async function getSkills(): Promise<Skill[]> {
  return getOrderedCollection<Skill>("skills");
}

export async function getClasses(): Promise<ClassItem[]> {
  return getOrderedCollection<ClassItem>("classes");
}

export async function getSocialLinks(): Promise<SocialLinks | null> {
  try {
    const docRef = doc(db, "social_links", "main");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SocialLinks;
    }
    return null;
  } catch (error) {
    console.error("Error fetching social links:", error);
    return null;
  }
}

export const fallbackBlogPosts: BlogPost[] = [
  {
    id: "welcome-to-updates",
    title: "Welcome to My Digital Archive: Learning, Building, and Teaching",
    slug: "welcome-to-updates",
    excerpt: "Why I built this personal archive, thoughts on engineering fundamentals, teaching as learning, and what to expect here.",
    content: `# Welcome to My Digital Archive\n\nI built this space as a personal writing archive and blog. In computer science and engineering, things evolve rapidly—new frameworks, new models, and endless abstractions. Yet, the fundamentals remain timeless.\n\n> "Bro, we have one life. Why waste it? Let's follow the orders of God, make Him happy & pass innovations to the next generations."\n\n### Why Write?\nWriting forces clarity of thought. When you can articulate a complex concept simply, you truly understand it. Whether it's dissecting algorithmic edge cases, building web architectures, or sharing life philosophies, this is where I document the journey.\n\n![Workspace & Deep Work](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80)\n\n### Video Breakdown & Teaching\nTeaching is one of the purest forms of learning. Here is one of my recent problem-solving sessions on Threads in Java:\n\nhttps://youtu.be/uobWZ7FA6XM\n\nStay tuned for more updates, technical deep-dives, and personal reflections!`,
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    tags: ["Philosophy", "Engineering", "Teaching"],
    isPublic: true,
    readTimeMinutes: 3,
    createdAt: new Date("2026-03-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-03-01T10:00:00Z").toISOString(),
  },
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const q = query(collection(db, "updates"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return fallbackBlogPosts;
    }
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BlogPost));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return fallbackBlogPosts;
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const docRef = doc(db, "updates", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BlogPost;
    }
    // Check fallback
    const fallback = fallbackBlogPosts.find((p) => p.id === id || p.slug === id);
    return fallback || null;
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    const fallback = fallbackBlogPosts.find((p) => p.id === id || p.slug === id);
    return fallback || null;
  }
}


export const fallbackProfile: Profile = {
  name: "MD REDUANUL HOQUE",
  tagline: "\"Bro, we have one life. Why waste it? Let's follow the orders of God, make Him happy & pass innovations to the next generations.\"",
  badges: ["Computer Science Student", "Educator"],
  location: "Dhaka, Bangladesh",
  eduStatus: "5th Trimester B.Sc. in CSE @ UIU",
  statusLine: "Learning, Building, Teaching...",
  hobbies: ["Reading", "Football", "Gaming", "⚽"],
  philosophyTitle: "The Philosophy",
  philosophyParagraphs: [
    "I'm a passionate Computer Science and Engineering student at UIU. I find joy in problem-solving, building web applications, and diving deep into the fundamentals of how things work.",
    "Whether mentoring in the Competitive Programming Community or teaching science to high schoolers, I believe teaching is the purest form of learning."
  ],
  profileImageUrl: "/Formal.jpg",
  resumeUrl: "/md_reduanul_hoque_resume.pdf",
};

export const fallbackSocialLinks: SocialLinks = {
  email: "mdreduanulhoquesadik@gmail.com",
  linkedin: "https://www.linkedin.com/in/md-reduanul-hoque-/",
  github: "https://github.com/mdreduanulhoque",
  facebook: "https://www.facebook.com/reduan.sadik.9",
  resumeUrl: "/md_reduanul_hoque_resume.pdf",
};

export const fallbackEducation: Education[] = [
  { id: "edu1", institution: "United International University", period: "Present (5th Trimester)", degree: "B.Sc. in Computer Science & Engineering", grade: "CGPA: 3.90/4.00", isCurrent: true, order: 0 },
  { id: "edu2", institution: "Gurudayal Govt College", period: "2023 - 2024", degree: "HSC - Science Group", grade: "GPA: 5.00/5.00", isCurrent: false, order: 1 },
  { id: "edu3", institution: "Kishoreganj Govt Boys High School", period: "2021 - 2022", degree: "SSC - Science Group", grade: "GPA: 5.00/5.00", isCurrent: false, order: 2 },
];

export const fallbackExperience: Experience[] = [
  { id: "exp1", role: "Volunteer", organization: "UIU CPC", period: "2025 - Present", description: "Organizing contests & mentoring junior students in algorithmic problem-solving.", isCurrent: true, order: 0 },
  { id: "exp2", role: "Course Instructor", organization: "NovoNex", period: "2024 - Present", description: "Mentoring in Intro to Computing, C Programming & OOP.", isCurrent: true, order: 1 },
  { id: "exp3", role: "General Member", organization: "UIU Computer Club", period: "2024 - Present", description: "Project management and team collaboration for club events.", isCurrent: true, order: 2 },
  { id: "exp4", role: "Science Teacher", organization: "IHT Study Point", period: "2023 - Present", description: "Mentoring 500+ students in Physics, Chemistry & Biology.", isCurrent: true, order: 3 },
];

export const fallbackAchievements: Achievement[] = [
  { id: "ach1", title: "1st Runner-up", subtitle: "at Phitron X App Forum: KickStart Contest", emoji: "🏆", order: 0 },
  { id: "ach2", title: "8th Runner-up & Bronze Medalist", subtitle: "at \"BeatCode 253\"", emoji: "🥉", order: 1 },
];

export const fallbackProjects: Project[] = [
  { id: "proj1", title: "Simon Game", description: "A classic colorful memory game. Features interactive buttons, sound effects, full responsiveness, and game over animations.", techStack: ["HTML5", "CSS3", "JS (ES6)", "jQuery"], liveLink: "https://mdreduanulhoque.github.io/SimonGame/", githubLink: "https://github.com/mdreduanulhoque/SimonGame", features: ["Colorful interactive buttons", "Sound effects for each color", "Game Over animation"], order: 0 },
  { id: "proj2", title: "Vibe Chess", description: "A relaxing, timer-based chess variant. Games end when the 5-minute timer expires, winner determined by territorial control.", techStack: ["Vanilla JS", "HTML5", "CSS3"], liveLink: "https://mdreduanulhoque.github.io/vibe-chess/", githubLink: "https://github.com/mdreduanulhoque/vibe-chess", features: ["Territorial Victory System", "Relaxing Design & Animations", "Smart 5-minute Timer display"], order: 1 },
  { id: "proj3", title: "Array Memory Visualizer", description: "A visualization tool for Array Memory Mapping. Shows grid generation, step-by-step calculations, and major mapping.", techStack: ["JavaScript", "HTML", "CSS"], liveLink: "https://mdreduanulhoque.github.io/Array-Memory-Mapping/", githubLink: "https://github.com/mdreduanulhoque/Array-Memory-Mapping", features: ["Dynamic grid generation", "Row/Column Major mapping", "Formula calculation steps"], order: 2 },
];

export const fallbackSkills: Skill[] = [
  { id: "sk1", name: "HTML5.exe", type: "Core", size: "124 KB", order: 0 },
  { id: "sk2", name: "CSS3.exe", type: "Core", size: "256 KB", order: 1 },
  { id: "sk3", name: "Tailwind_CSS.exe", type: "Framework", size: "8.4 MB", order: 2 },
  { id: "sk4", name: "JavaScript.exe", type: "Language", size: "4.2 MB", order: 3 },
  { id: "sk5", name: "jQuery.exe", type: "Library", size: "88 KB", order: 4 },
  { id: "sk6", name: "NodeJS.exe", type: "Runtime", size: "32 MB", order: 5 },
  { id: "sk6_1", name: "Express.js", type: "Framework", size: "16 MB", order: 5.1 },
  { id: "sk6_2", name: "MySQL", type: "Database", size: "64 MB", order: 5.2 },
  { id: "sk6_3", name: "Python", type: "Language", size: "28 MB", order: 5.3 },
  { id: "sk7", name: "C_Language.exe", type: "Language", size: "1.1 MB", order: 6 },
  { id: "sk8", name: "CPlusPlus.exe", type: "Language", size: "2.4 MB", order: 7 },
  { id: "sk9", name: "WordPress.exe", type: "CMS", size: "64 MB", order: 8 },
  { id: "sk10", name: "Canva.exe", type: "Design", size: "12 MB", order: 9 },
  { id: "sk11", name: "MS_Office_Suite.exe", type: "Tools", size: "1.2 GB", order: 10 },
];

export const fallbackClasses: ClassItem[] = [
  { id: "cl1", title: "Thread in Java || Question Solve || OOP", videoId: "uobWZ7FA6XM", description: "A detailed problem-solving session covering Threads in Object-Oriented Programming.", url: "https://youtu.be/uobWZ7FA6XM?si=87TNoOs94kpDdL2S", order: 0 },
  { id: "cl2", title: "GUI - Design Part in Java", videoId: "Rs6k1PNkVf4", description: "A comprehensive guide on designing Graphical User Interfaces (GUI) in Java.", url: "https://youtu.be/Rs6k1PNkVf4?si=nMWrT2wIJMuSGoRP", order: 1 },
  { id: "cl3", title: "ICS One Shot Class For Mid", videoId: "GWtQ2FKl6ks", description: "A complete one-shot review class designed to prepare students for the Introduction to Computer Systems (ICS) midterm.", url: "https://youtu.be/GWtQ2FKl6ks?si=scAGxTYf92YBeWY-", order: 2 },
];
