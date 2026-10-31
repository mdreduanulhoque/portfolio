import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:" ||
      parsed.protocol === "mailto:"
    );
  } catch {
    return false;
  }
}

/**
 * Normalizes user-supplied image URLs, converting known preview links
 * (such as Google Drive preview/sharing links) into direct image stream endpoints.
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();

  // Google Drive: https://drive.google.com/file/d/{FILE_ID}/...
  const driveFilePattern = /^https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const matchFile = trimmed.match(driveFilePattern);
  if (matchFile && matchFile[1]) {
    return `https://lh3.googleusercontent.com/d/${matchFile[1]}`;
  }

  // Google Drive: https://drive.google.com/open?id={FILE_ID} or /uc?id={FILE_ID} or /uc?export=view&id={FILE_ID}
  const driveQueryPattern = /^https?:\/\/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]+)/i;
  const matchQuery = trimmed.match(driveQueryPattern);
  if (matchQuery && matchQuery[1]) {
    return `https://lh3.googleusercontent.com/d/${matchQuery[1]}`;
  }

  return trimmed;
}

/**
 * Checks whether a user-supplied string is a Google Drive Folder link or the Gallery Folder ID
 * rather than an individual image file.
 */
export function isDriveFolderInput(urlOrId: string | undefined | null): boolean {
  if (!urlOrId) return false;
  const trimmed = urlOrId.trim();
  if (/\/folders\//i.test(trimmed)) return true;
  if (trimmed === GOOGLE_DRIVE_GALLERY_FOLDER_ID) return true;
  return false;
}

/**
 * Extracts a Google Drive File ID from any sharing link, open link, uc link, thumbnail link,
 * or returns the raw ID if already provided. Rejects folder links.
 */
export function extractDriveFileId(urlOrId: string | undefined | null): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  if (isDriveFolderInput(trimmed)) return "";

  // /file/d/{ID} or lh3.googleusercontent.com/d/{ID}
  const filePattern = /\/(?:file\/)?d\/([a-zA-Z0-9_-]{20,})/i;
  const fileMatch = trimmed.match(filePattern);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  // id={ID}
  const idPattern = /[?&]id=([a-zA-Z0-9_-]{20,})/i;
  const idMatch = trimmed.match(idPattern);
  if (idMatch && idMatch[1]) return idMatch[1];

  // Raw alphanumeric ID (typically 28-44 chars)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return "";
}

export const GOOGLE_DRIVE_CERTIFICATES_FOLDER =
  "https://drive.google.com/drive/folders/1PBa---xjqgdlkNpy4bL4Tzask0NeRSxQ?usp=sharing";

export const GOOGLE_DRIVE_GALLERY_FOLDER_ID =
  "1QrwVkUnNKiHK8QF_3t8cgEArOqkXfzOZ";

export const GOOGLE_DRIVE_GALLERY_FOLDER =
  `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_GALLERY_FOLDER_ID}?usp=sharing`;

/**
 * Generates an embeddable Google Drive PDF preview URL for iframes.
 */
export function getDrivePdfPreviewUrl(urlOrId: string | undefined | null): string {
  const id = extractDriveFileId(urlOrId);
  if (!id) return "";
  return `https://drive.google.com/file/d/${id}/preview`;
}

/**
 * Generates a high-resolution PNG image thumbnail URL of a Google Drive PDF's first page.
 */
export function getDriveThumbnailUrl(urlOrId: string | undefined | null): string {
  const id = extractDriveFileId(urlOrId);
  if (!id) return "";
  return `https://lh3.googleusercontent.com/d/${id}=w800`;
}

/**
 * Generates a direct Google Drive image URL at a requested pixel width (e.g., w800 for cards, w1600 for lightbox).
 */
export function getDriveGalleryImageUrl(
  urlOrId: string | undefined | null,
  width: number = 800
): string {
  const id = extractDriveFileId(urlOrId);
  if (!id) return normalizeImageUrl(urlOrId);
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
}

/**
 * Returns ordered candidate URLs for rendering a Google Drive image resiliently across browsers.
 */
export function getDriveImageFallbackUrls(
  urlOrId: string | undefined | null,
  width: number = 1000
): string[] {
  const id = extractDriveFileId(urlOrId);
  if (!id) {
    const normalized = normalizeImageUrl(urlOrId);
    return normalized ? [normalized] : [];
  }
  return [
    `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`,
    `https://lh3.googleusercontent.com/d/${id}=w${width}`,
    `https://drive.google.com/uc?export=view&id=${id}`,
  ];
}

/**
 * Generates a direct Google Drive view sharing link.
 */
export function getDriveViewUrl(urlOrId: string | undefined | null): string {
  const id = extractDriveFileId(urlOrId);
  if (!id) return urlOrId || "";
  return `https://drive.google.com/file/d/${id}/view?usp=sharing`;
}

/**
 * Extracts a YouTube Video ID from any standard URL, short link, embed link, or raw 11-char ID.
 */
export function extractYouTubeVideoId(urlOrId: string | undefined | null): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();

  // Pattern for youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/embed/<id>, youtube.com/shorts/<id>, etc.
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) return match[1];

  // If already an 11-character YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return "";
}

/**
 * Generates a YouTube thumbnail image URL (defaulting to high quality with fallback).
 */
export function getYouTubeThumbnailUrl(
  urlOrId: string | undefined | null,
  quality: "hq" | "max" = "hq"
): string {
  const id = extractYouTubeVideoId(urlOrId);
  if (!id) return "";
  return quality === "max"
    ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Generates an embeddable YouTube player URL for iframes.
 */
export function getYouTubeEmbedUrl(urlOrId: string | undefined | null): string {
  const id = extractYouTubeVideoId(urlOrId);
  if (!id) return "";
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
}

/**
 * Generates a direct YouTube watch link.
 */
export function getYouTubeWatchUrl(urlOrId: string | undefined | null): string {
  const id = extractYouTubeVideoId(urlOrId);
  if (!id) return urlOrId || "";
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * Extracts GitHub repository owner and repo name from any GitHub URL.
 */
export function extractGitHubRepo(url: string | undefined | null): { owner: string; repo: string } | null {
  if (!url) return null;
  const match = url.trim().match(/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i);
  if (match) {
    const repoClean = match[2].replace(/\.git$/, "");
    return { owner: match[1], repo: repoClean };
  }
  return null;
}

/**
 * Resolves the best available preview image for a project with smart multi-tier fallback:
 * 1. Explicitly stored imageUrl (normalized for Google Drive, etc.)
 * 2. Static local screenshot matched by title or ID
 * 3. Automated GitHub OpenGraph repository preview card
 */
export function getProjectImageUrl(project: Partial<Project> | null | undefined): string {
  if (!project) return "";
  if (project.imageUrl && project.imageUrl.trim()) {
    return normalizeImageUrl(project.imageUrl);
  }

  // Automatic match by project title or ID to local high-res screenshots
  const title = (project.title || "").toLowerCase();
  const id = (project.id || "").toLowerCase();
  if (title.includes("simon") || id === "proj1") return "/projects/simon-game.png";
  if (title.includes("chess") || id.includes("chess") || id === "xiumrrydcbnnn6zq0mu9") return "/projects/vibe-chess.png";
  if (title.includes("campus") || title.includes("eat") || id === "dfkm4riksrn0pdlbpnqm") return "/projects/campus-eats.png";
  if (title.includes("array") || title.includes("memory") || id === "proj3") return "/projects/array-memory-mapping.png";

  // Automatic fallback to GitHub OpenGraph preview
  const repo = extractGitHubRepo(project.githubLink);
  if (repo) {
    return `https://opengraph.githubassets.com/1/${repo.owner}/${repo.repo}`;
  }

  return "";
}

export async function swapCollectionOrder<T extends { id: string; order: number }>(
  collectionName: string,
  items: T[],
  index: number,
  direction: "up" | "down"
): Promise<boolean> {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return false;

  const itemA = items[index];
  const itemB = items[targetIndex];
  const newOrderA = itemA.order === itemB.order ? targetIndex : itemB.order;
  const newOrderB = itemA.order === itemB.order ? index : itemA.order;

  const batch = writeBatch(db);
  batch.update(doc(db, collectionName, itemA.id), { order: newOrderA });
  batch.update(doc(db, collectionName, itemB.id), { order: newOrderB });
  await batch.commit();
  return true;
}

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
  imageUrl?: string;
  category?: string;
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

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate?: string;
  description?: string;
  driveUrl: string;
  fileId?: string;
  order: number;
}

export interface GalleryItem {
  id: string;
  fileId: string;
  description?: string;
  date?: string;
  driveUrl: string;
  order: number;
  isHidden?: boolean;
  createdAt?: string;
  fromDriveOnly?: boolean;
}

export interface GallerySettings {
  bridgeUrl?: string;
  folderUrl?: string;
  updatedAt?: string;
}

export interface DriveBridgeFile {
  id: string;
  description?: string;
  mimeType?: string;
  createdTime?: string;
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
  fontFamily?: string;
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

export async function getCertificates(): Promise<Certificate[]> {
  return getOrderedCollection<Certificate>("certificates");
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
    content: `# Welcome to My Digital Archive\n\nI built this space as a personal writing archive and blog. In computer science and engineering, things evolve rapidly—new frameworks, new models, and endless abstractions. Yet, the fundamentals remain timeless.\n\n### Why Write?\nWriting forces clarity of thought. When you can articulate a complex concept simply, you truly understand it. Whether it's dissecting algorithmic edge cases, building web architectures, or sharing life philosophies, this is where I document the journey.\n\n![Workspace & Deep Work](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80)\n\n### Video Breakdown & Teaching\nTeaching is one of the purest forms of learning. Here is one of my recent problem-solving sessions on Threads in Java:\n\nhttps://youtu.be/uobWZ7FA6XM\n\nStay tuned for more updates, technical deep-dives, and personal reflections!`,
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    tags: ["Philosophy", "Engineering", "Teaching"],
    isPublic: true,
    readTimeMinutes: 3,
    fontFamily: "claude",
    createdAt: new Date("2026-03-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-03-01T10:00:00Z").toISOString(),
  },
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, "updates"),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc")
    );
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
  tagline: "",
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
  {
    id: "proj1",
    title: "Simon Game",
    description: "A classic colorful memory game. Features interactive buttons, sound effects, full responsiveness, and game over animations.",
    techStack: ["HTML5", "CSS3", "JS (ES6)", "jQuery"],
    liveLink: "https://mdreduanulhoque.github.io/SimonGame/",
    githubLink: "https://github.com/mdreduanulhoque/SimonGame",
    features: ["Colorful interactive buttons", "Sound effects for each color", "Game Over animation"],
    imageUrl: "/projects/simon-game.png",
    order: 0,
  },
  {
    id: "proj2",
    title: "Vibe Chess",
    description: "A relaxing, timer-based chess variant. Games end when the 5-minute timer expires, winner determined by territorial control.",
    techStack: ["Vanilla JS", "HTML5", "CSS3"],
    liveLink: "https://mdreduanulhoque.github.io/vibe-chess/",
    githubLink: "https://github.com/mdreduanulhoque/vibe-chess",
    features: ["Territorial Victory System", "Relaxing Design & Animations", "Smart 5-minute Timer display"],
    imageUrl: "/projects/vibe-chess.png",
    order: 1,
  },
  {
    id: "proj3",
    title: "Campus Eats",
    description: "A platform where students order food and select a pickup time, so that they do not need to stuck in queue for ling time.",
    techStack: ["HTML", "CSS", "React.js", "Node.js", "Express.JS", "MySQL"],
    liveLink: "",
    githubLink: "https://github.com/mdreduanulhoque/campus_eats",
    features: ["Select available pickup time", "Compare items across multiple kitchen", "Daily budget guardrail"],
    imageUrl: "/projects/campus-eats.png",
    order: 2,
  },
  {
    id: "proj4",
    title: "Array Memory Visualizer",
    description: "A visualization tool for Array Memory Mapping. Shows grid generation, step-by-step calculations, and major mapping.",
    techStack: ["JavaScript", "HTML", "CSS"],
    liveLink: "https://mdreduanulhoque.github.io/Array-Memory-Mapping/",
    githubLink: "https://github.com/mdreduanulhoque/Array-Memory-Mapping",
    features: ["Dynamic grid generation", "Row/Column Major mapping", "Formula calculation steps"],
    imageUrl: "/projects/array-memory-mapping.png",
    order: 3,
  },
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

export const fallbackCertificates: Certificate[] = [
  {
    id: "cert1",
    title: "BeatCode 253 - Certificate of Achievement",
    issuer: "Phitron & App Forum",
    issueDate: "2024",
    description: "Recognized as 8th Runner-up & Bronze Medalist at BeatCode 253 competitive programming contest.",
    driveUrl: "https://drive.google.com/file/d/1_crI2rnNAPRxxTLNAKoS9sc17r50JuRE/view?usp=sharing",
    fileId: "1_crI2rnNAPRxxTLNAKoS9sc17r50JuRE",
    order: 0,
  },
  {
    id: "cert2",
    title: "The Complete Full-Stack Web Development Bootcamp",
    issuer: "Udemy / Angela Yu",
    issueDate: "2024",
    description: "Comprehensive Full-Stack Web Development certification covering frontend and backend engineering.",
    driveUrl: "https://drive.google.com/file/d/1LCASjuVEyCQ5HAIldBoa5p984GCQbyUN/view?usp=sharing",
    fileId: "1LCASjuVEyCQ5HAIldBoa5p984GCQbyUN",
    order: 1,
  },
  {
    id: "cert3",
    title: "UIUCPC Batch Representative Recognition",
    issuer: "UIU Competitive Programming Community",
    issueDate: "2024 - Present",
    description: "Recognition for leadership and mentoring as Batch Representative at UIU CPC.",
    driveUrl: "https://drive.google.com/file/d/1Loi3_x_7HfSzIzCvEEPeYA6MhehJFEoD/view?usp=sharing",
    fileId: "1Loi3_x_7HfSzIzCvEEPeYA6MhehJFEoD",
    order: 2,
  },
  {
    id: "cert4",
    title: "Impactful Presentations",
    issuer: "Grameenphone Academy",
    issueDate: "2024",
    description: "Professional certification on storytelling, presentation design, and high-impact corporate communications.",
    driveUrl: "https://drive.google.com/file/d/1lIN3XrXcXdMN1SeQ0fxPrWHYu4QWz1CC/view?usp=sharing",
    fileId: "1lIN3XrXcXdMN1SeQ0fxPrWHYu4QWz1CC",
    order: 3,
  },
  {
    id: "cert5",
    title: "Build Your Future Before Graduation",
    issuer: "Grameenphone Academy",
    issueDate: "2024",
    description: "Corporate readiness and career planning certification focused on pre-graduation competencies.",
    driveUrl: "https://drive.google.com/file/d/1Xyx91AkjckZcdb6y9c8-UBvAXCzDuWpF/view?usp=sharing",
    fileId: "1Xyx91AkjckZcdb6y9c8-UBvAXCzDuWpF",
    order: 4,
  },
  {
    id: "cert6",
    title: "BeatCode 253 - Recognition Poster",
    issuer: "BeatCode Community",
    issueDate: "2024",
    description: "Official recognition poster commemorating the Top 10 finish in algorithmic problem solving.",
    driveUrl: "https://drive.google.com/file/d/1Q65d1UB7QbHnckt40w9t-l3NCHzyRnEs/view?usp=sharing",
    fileId: "1Q65d1UB7QbHnckt40w9t-l3NCHzyRnEs",
    order: 5,
  },
];

/**
 * Checks whether any of the default fallback certificates exist in the database collection.
 */
export function isCertificatesCollectionSeeded(dbCertificates: Certificate[] | undefined | null): boolean {
  if (!dbCertificates || dbCertificates.length === 0) return false;
  return dbCertificates.some((c) =>
    fallbackCertificates.some(
      (fb) =>
        fb.id === c.id ||
        (c.fileId && fb.fileId && c.fileId === fb.fileId) ||
        (c.driveUrl && fb.driveUrl && c.driveUrl === fb.driveUrl)
    )
  );
}

/**
 * Returns any fallback certificates that are not currently in the database collection.
 */
export function getMissingFallbackCertificates(dbCertificates: Certificate[] | undefined | null): Certificate[] {
  if (!dbCertificates || dbCertificates.length === 0) return fallbackCertificates;
  return fallbackCertificates.filter(
    (fb) =>
      !dbCertificates.some(
        (c) =>
          c.id === fb.id ||
          (c.fileId && fb.fileId && c.fileId === fb.fileId) ||
          (c.driveUrl && fb.driveUrl && c.driveUrl === fb.driveUrl) ||
          (c.title && fb.title && c.title.toLowerCase().trim() === fb.title.toLowerCase().trim())
      )
  );
}

/**
 * Resolves the active certificates list by seamlessly merging Firestore items with
 * original portfolio certificates when default certificates have not yet been migrated to the database.
 */
export function resolveCertificates(dbCertificates: Certificate[] | undefined | null): Certificate[] {
  if (!dbCertificates || dbCertificates.length === 0) {
    return fallbackCertificates;
  }

  // If default certificates were seeded into the DB, DB is the source of truth
  const isSeeded = isCertificatesCollectionSeeded(dbCertificates);
  if (isSeeded) {
    return [...dbCertificates].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  // If DB only has user-created certificates and none of the original defaults were seeded,
  // merge missing defaults so original certificates do not vanish.
  const missing = getMissingFallbackCertificates(dbCertificates);
  if (missing.length === 0) {
    return [...dbCertificates].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const maxDbOrder = Math.max(...dbCertificates.map((c) => c.order ?? 0), -1);
  const adjustedMissing = missing.map((fb, idx) => ({
    ...fb,
    order: fb.order !== undefined && fb.order > maxDbOrder ? fb.order : maxDbOrder + 1 + idx,
  }));

  return [...dbCertificates, ...adjustedMissing].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Checks whether any of the default fallback classes exist in the database collection.
 */
export function isClassesCollectionSeeded(dbClasses: ClassItem[] | undefined | null): boolean {
  if (!dbClasses || dbClasses.length === 0) return false;
  return dbClasses.some((c) =>
    fallbackClasses.some(
      (fb) =>
        fb.id === c.id ||
        (c.videoId && fb.videoId && c.videoId === fb.videoId) ||
        (c.url && fb.url && c.url === fb.url)
    )
  );
}

/**
 * Returns any fallback classes that are not currently in the database collection.
 */
export function getMissingFallbackClasses(dbClasses: ClassItem[] | undefined | null): ClassItem[] {
  if (!dbClasses || dbClasses.length === 0) return fallbackClasses;
  return fallbackClasses.filter(
    (fb) =>
      !dbClasses.some(
        (c) =>
          c.id === fb.id ||
          (c.videoId && fb.videoId && c.videoId === fb.videoId) ||
          (c.url && fb.url && c.url === fb.url) ||
          (c.title && fb.title && c.title.toLowerCase().trim() === fb.title.toLowerCase().trim())
      )
  );
}

/**
 * Resolves the active classes list by seamlessly merging Firestore items with
 * original portfolio classes when default classes have not yet been migrated to the database.
 */
export function resolveClasses(dbClasses: ClassItem[] | undefined | null): ClassItem[] {
  if (!dbClasses || dbClasses.length === 0) {
    return fallbackClasses;
  }

  const isSeeded = isClassesCollectionSeeded(dbClasses);
  if (isSeeded) {
    return [...dbClasses].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const missing = getMissingFallbackClasses(dbClasses);
  if (missing.length === 0) {
    return [...dbClasses].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const maxDbOrder = Math.max(...dbClasses.map((c) => c.order ?? 0), -1);
  const adjustedMissing = missing.map((fb, idx) => ({
    ...fb,
    order: fb.order !== undefined && fb.order > maxDbOrder ? fb.order : maxDbOrder + 1 + idx,
  }));

  return [...dbClasses, ...adjustedMissing].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Checks whether any of the default fallback projects exist in the database collection.
 */
export function isProjectsCollectionSeeded(dbProjects: Project[] | undefined | null): boolean {
  if (!dbProjects || dbProjects.length === 0) return false;
  return dbProjects.some((p) =>
    fallbackProjects.some(
      (fb) =>
        fb.id === p.id ||
        (p.githubLink && fb.githubLink && p.githubLink === fb.githubLink) ||
        (p.title && fb.title && p.title.toLowerCase().trim() === fb.title.toLowerCase().trim())
    )
  );
}

/**
 * Returns any fallback projects that are not currently in the database collection.
 */
export function getMissingFallbackProjects(dbProjects: Project[] | undefined | null): Project[] {
  if (!dbProjects || dbProjects.length === 0) return fallbackProjects;
  return fallbackProjects.filter(
    (fb) =>
      !dbProjects.some(
        (p) =>
          p.id === fb.id ||
          (p.githubLink && fb.githubLink && p.githubLink === fb.githubLink) ||
          (p.title && fb.title && p.title.toLowerCase().trim() === fb.title.toLowerCase().trim())
      )
  );
}

/**
 * Resolves the active projects list by seamlessly merging Firestore items with
 * original portfolio projects when default projects have not yet been migrated to the database.
 */
export function resolveProjects(dbProjects: Project[] | undefined | null): Project[] {
  if (!dbProjects || dbProjects.length === 0) {
    return fallbackProjects;
  }

  const isSeeded = isProjectsCollectionSeeded(dbProjects);
  if (isSeeded) {
    return [...dbProjects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const missing = getMissingFallbackProjects(dbProjects);
  if (missing.length === 0) {
    return [...dbProjects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const maxDbOrder = Math.max(...dbProjects.map((c) => c.order ?? 0), -1);
  const adjustedMissing = missing.map((fb, idx) => ({
    ...fb,
    order: fb.order !== undefined && fb.order > maxDbOrder ? fb.order : maxDbOrder + 1 + idx,
  }));

  return [...dbProjects, ...adjustedMissing].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ─── Google Drive Gallery Bridge & Resolution ─────────────────────────

export const GOOGLE_APPS_SCRIPT_BRIDGE_CODE = `// Hardened Google Apps Script Bridge for Portfolio Gallery
// 1. Go to https://script.google.com and create a New Project
// 2. Paste this code into Code.gs and click Save
// 3. Click "Deploy" -> "New deployment" -> Select type: "Web app"
// 4. Set "Execute as": "Me" and "Who has access": "Anyone"
// 5. Copy the Web App URL (https://script.google.com/macros/s/.../exec) and paste it in Admin Gallery!

// Strictly locked to this single public folder ID (never accepts folderId from request params)
const FOLDER_ID = "${GOOGLE_DRIVE_GALLERY_FOLDER_ID}";
const CACHE_KEY = "PORTFOLIO_GALLERY_ITEMS_V1";
const CACHE_TTL_SECONDS = 120; // 2-minute cache to protect personal Google account quotas

function doGet() {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      return ContentService
        .createTextOutput(cached)
        .setMimeType(ContentService.MimeType.JSON);
    }

    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFiles();
    const items = [];

    while (files.hasNext()) {
      const file = files.next();
      if (file.isTrashed()) continue;
      const mime = file.getMimeType() || "";
      if (mime.indexOf("image/") === 0) {
        // Ensure image inside the public gallery folder is viewable by portfolio <img> tags
        try {
          if (file.getSharingAccess() === DriveApp.Access.PRIVATE) {
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          }
        } catch (shareErr) {}

        items.push({
          id: file.getId(),
          description: file.getDescription() || "",
          mimeType: mime,
          createdTime: file.getDateCreated().toISOString()
        });
      }
    }

    // Sort newest first by default
    items.sort(function(a, b) {
      return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
    });

    const output = JSON.stringify({ items: items });
    cache.put(CACHE_KEY, output, CACHE_TTL_SECONDS);

    return ContentService
      .createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: "Unable to list gallery folder", items: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

/**
 * Validates that a Google Apps Script Web App URL points to an allowed Google host.
 */
export function isValidAppsScriptUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "script.google.com" ||
        parsed.hostname === "script.googleusercontent.com")
    );
  } catch {
    return false;
  }
}

/**
 * Fetches the live image file list from the Google Apps Script Web App Bridge
 * with bounded timeout and strict response schema validation.
 */
export async function fetchDriveFolderImages(
  bridgeUrl: string | undefined | null,
  signal?: AbortSignal
): Promise<DriveBridgeFile[]> {
  const resolvedUrl = (bridgeUrl || process.env.NEXT_PUBLIC_GALLERY_BRIDGE_URL || "").trim();
  if (!isValidAppsScriptUrl(resolvedUrl)) {
    return [];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    const response = await fetch(resolvedUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Drive bridge returned HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    const rawList = Array.isArray(payload)
      ? payload
      : payload &&
          typeof payload === "object" &&
          "items" in payload &&
          Array.isArray((payload as { items: unknown }).items)
        ? (payload as { items: unknown[] }).items
        : [];

    const validated: DriveBridgeFile[] = [];
    for (const entry of rawList) {
      if (!entry || typeof entry !== "object") continue;
      const obj = entry as Record<string, unknown>;
      const id = typeof obj.id === "string" ? obj.id.trim() : "";
      if (!/^[a-zA-Z0-9_-]{10,}$/.test(id)) continue;

      validated.push({
        id,
        description:
          typeof obj.description === "string"
            ? obj.description.trim().slice(0, 1000)
            : "",
        mimeType:
          typeof obj.mimeType === "string"
            ? obj.mimeType.trim().slice(0, 100)
            : "image/jpeg",
        createdTime:
          typeof obj.createdTime === "string"
            ? obj.createdTime.trim().slice(0, 64)
            : undefined,
      });
    }

    return validated;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onAbort);
  }
}

/**
 * Merges Firestore gallery documents with live Google Drive folder images.
 * - Any image in the Google Drive folder automatically appears even if not yet saved in Firestore.
 * - Firestore metadata (description, date, driveUrl, order, isHidden) enriches/overrides the Drive file.
 */
export function mergeGalleryItems(
  dbItems: GalleryItem[] | undefined | null,
  driveFiles: DriveBridgeFile[] | undefined | null,
  includeHidden: boolean = false
): GalleryItem[] {
  const safeDb = dbItems ? [...dbItems] : [];
  const safeDrive = driveFiles ? [...driveFiles] : [];

  const merged: GalleryItem[] = [];
  const seenFileIds = new Set<string>();

  // 1. Add all Firestore items first (enriching with Drive metadata if matched)
  for (const dbItem of safeDb) {
    const fid = extractDriveFileId(dbItem.fileId || dbItem.driveUrl);
    const matchingDrive = fid ? safeDrive.find((df) => df.id === fid) : undefined;
    if (fid) seenFileIds.add(fid);

    merged.push({
      id: dbItem.id,
      fileId: fid || dbItem.fileId,
      driveUrl: fid ? getDriveViewUrl(fid) : dbItem.driveUrl || "",
      description: (dbItem.description || matchingDrive?.description || "").trim(),
      date: (dbItem.date || "").trim(),
      order: dbItem.order ?? 0,
      isHidden: Boolean(dbItem.isHidden),
      createdAt: dbItem.createdAt,
      fromDriveOnly: false,
    });
  }

  // 2. Append any newly uploaded Google Drive folder images not yet saved in Firestore
  const maxOrder = merged.length > 0 ? Math.max(...merged.map((m) => m.order ?? 0)) : -1;
  safeDrive.forEach((df, idx) => {
    if (seenFileIds.has(df.id)) return;
    seenFileIds.add(df.id);

    const formattedDate = df.createdTime
      ? new Date(df.createdTime).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : undefined;

    merged.push({
      id: `drive_${df.id}`,
      fileId: df.id,
      description: df.description || "",
      date: formattedDate || "",
      driveUrl: getDriveViewUrl(df.id),
      order: maxOrder + 1 + idx,
      isHidden: false,
      createdAt: df.createdTime,
      fromDriveOnly: true,
    });
  });

  const filtered = includeHidden ? merged : merged.filter((item) => !item.isHidden);
  return filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
