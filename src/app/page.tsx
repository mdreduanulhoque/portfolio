import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ProjectsSection } from "@/components/sections/projects";
import { SkillsSection } from "@/components/sections/skills";
import { ClassesSection } from "@/components/sections/classes";
import { ContactSection } from "@/components/sections/contact";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <ClassesSection />
      <SkillsSection />
      <ContactSection />
    </div>
  );
}
