export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w185";
export const INTERIS_BASE = "https://interis.gorkemkaryol.dev";

export interface SkillGroup {
  category: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: "Languages",
    skills: ["TypeScript", "JavaScript", "Python", "Go", "SQL"],
  },
  {
    category: "Backend",
    skills: ["Node.js", "Bun", "Express", "REST APIs", "API Documentation"],
  },
  {
    category: "Frontend",
    skills: ["React", "Next.js", "Astro", "TailwindCSS"],
  },
  {
    category: "Database",
    skills: ["PostgreSQL", "Redis"],
  },
  {
    category: "Infrastructure",
    skills: ["Linux", "Docker", "Cloudflare", "Dokploy", "Git"],
  },
];

export interface NavigationItem {
  href: "/" | "/projects" | "/interests" | "/experience" | "/cool";
  label: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  date: string;
  description: string[];
  tags: string[];
}

export interface ContactItem {
  href: string;
  label: string;
  icon: "github" | "linkedin" | "mail" | "file";
}

export interface TechItem {
  title: string;
  spec: string;
  description: string;
}

export interface BandItem {
  name: string;
  image: string;
}

export const navigationItems: NavigationItem[] = [
  { href: "/", label: "me" },
  { href: "/projects", label: "projects" },
  { href: "/experience", label: "experience" },
  { href: "/interests", label: "interests" },
  { href: "/cool", label: "cool" },
];

export const experiences: ExperienceItem[] = [
  {
    role: "Full Stack Engineer",
    company: "Holala.ai",
    date: "Feb 2026 – Mar 2026",
    description: [
      "Built a high-performance AI SaaS for e-commerce photography using Bun.js, React, and TypeScript.",
      "Architected an asynchronous AI pipeline using webhooks to handle high-concurrency GPU bursts without dropping requests or hitting rate limits.",
      "Reduced AI payload sizes by 90% by implementing Cloudflare Images for on-the-fly compression of R2 storage assets.",
      "Designed a strict, type-safe monorepo with Turborepo and Drizzle ORM to enforce seamless client-server data boundaries.",
      "Optimized frontend rendering state with advanced deduplication and caching via TanStack Query, eliminating race conditions during real-time image generation.",
    ],
    tags: [
      "Bun.js",
      "React",
      "TypeScript",
      "Drizzle ORM",
      "TanStack Query",
      "Cloudflare",
    ],
  },
  {
    role: "Cyber Security Intern",
    company: "OPET",
    date: "Jul 2024 – Aug 2025",
    description: [
      "Conducted vulnerability assessments using tools such as Kali Linux and categorized findings by severity.",
      "Developed custom security tools in Go, including a port scanner with service detection and a hash-cracking utility.",
      "Analyzed and compared vulnerability reports from multiple external vendors to identify overlaps and gaps in findings.",
    ],
    tags: ["Cyber Security", "Network Security", "Kali Linux", "Go"],
  },
  {
    role: "Core Member, Project Team Member",
    company: "Google Developer Groups on Campus Halic",
    date: "Sep 2024 – Present",
    description: [
      "Collaborating with the team to design and build applications that offer practical solutions to real-world challenges.",
      "Gaining hands-on experience in managing projects and working in a collaborative environment, making a positive impact within the university's tech ecosystem.",
      "Working with the social media team to create engaging content that promotes events and showcases ongoing work.",
      "Actively participating in both community-focused initiatives and internal project development to support the team's mission and outreach.",
    ],
    tags: ["Teamwork", "Community Building", "Project Management"],
  },
];

export const introText =
  "I’m a computer engineering student building web apps and experimenting with different parts of the stack. I like working on real projects, trying out new tools, and figuring out better ways to build and ship things.";

export const contactItems: ContactItem[] = [
  { href: "https://github.com/glory42", label: "GitHub", icon: "github" },
  {
    href: "https://linkedin.com/in/glory42",
    label: "LinkedIn",
    icon: "linkedin",
  },
  { href: "mailto:me@gorkemkaryol.dev", label: "Mail", icon: "mail" },
  { href: "/Gorkem-Karyol-CV.pdf", label: "CV", icon: "file" },
];

export const techItems: TechItem[] = [
  {
    title: "Laptop",
    spec: "ASUS Zenbook UM3402YAR",
    description:
      "I have been using this for more than a year. It is light, stable, and reliable.",
  },
  {
    title: "OS",
    spec: "Arch Linux, Hyprland",
    description:
      "It was a mental challenge and still one of the best technical decisions I made.",
  },
  {
    title: "Mouse",
    spec: "Logitech G302",
    description: "I have been using it for years, and it still does the job.",
  },
  {
    title: "Keyboard",
    spec: "Inca IKG-441 Blue Switch",
    description: "Best price-performance blue switch keyboard I have used.",
  },
];

export const interestsIntro =
  "This page captures the things I keep coming back to. Books, films, and series shape how I think, while basketball and skateboarding keep me moving. Recently, I’ve been building habits around the gym and playing guitar. Slow progress, but consistent.";

export const favoriteBands: BandItem[] = [
  { name: "Radiohead", image: "/radiohead.jpg" },
  { name: "Deftones", image: "/deftones.jpg" },
];
