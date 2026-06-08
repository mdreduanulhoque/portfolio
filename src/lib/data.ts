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
