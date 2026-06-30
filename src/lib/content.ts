export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w185";
export const INTERIS_BASE = "https://interis.gorkemkaryol.dev";

export const EXTERNAL_REPOS = [
  "WasteWise-Project/WasteWise",
];

export interface NavigationItem {
  href: "/" | "/projects" | "/interests" | "/experience" | "/cool";
  label: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  date: string;
  type?: string;
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
  iconId: "monitor" | "layers" | "code" | "terminal" | "globe";
}

export interface BandItem {
  name: string;
  image: string;
  url?: string;
}

export const navigationItems: NavigationItem[] = [
  { href: "/", label: "me" },
  { href: "/projects", label: "projects" },
  { href: "/experience", label: "experience" },
  { href: "/interests", label: "interests" },
  { href: "/cool", label: "cool" },
];

export const workExperiences: ExperienceItem[] = [
  {
    role: "Software Engineering Intern",
    company: "Lodos",
    date: "April 2026 – Present",
    type: "internship",
    description: [
      "Contributed to the development of social/community platforms that reached 5,000+ active users within 8 months.",
      "Worked on large-scale social/community platforms using React, Next.js, TypeScript, and shared backend architectures.",
      "Designed cross-application DM integration flows between interconnected platforms while minimizing changes to existing real-time messaging infrastructure.",
      "Improved frontend UX and permission handling for private community systems, including request-state management and protected navigation flows.",
    ],
    tags: ["React", "Next.js", "TypeScript", "Real-Time Systems", "Socket.IO"],
  },
  {
    role: "Full Stack Engineer",
    company: "Holala",
    date: "Feb 2026 – March 2026",
    type: "part-time",
    description: [
      "Built a high-performance AI SaaS for e-commerce photography using Bun.js, React, and TypeScript.",
      "Architected an asynchronous AI pipeline using webhooks to handle high-concurrency GPU bursts without dropping requests or hitting rate limits.",
      "Reduced AI payload sizes by 90% by implementing Cloudflare Images for on-the-fly compression of R2 storage assets.",
      "Designed a strict, type-safe Turborepo monorepo with Drizzle ORM and optimized frontend rendering state with TanStack Query, eliminating race conditions during real-time image generation.",
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
    company: "Opet",
    date: "Jul 2024 – Aug 2025",
    type: "internship",
    description: [
      "Conducted vulnerability assessments using tools such as Kali Linux and categorized findings by severity.",
      "Developed custom security tools in Go, including a port scanner with service detection and a hash-cracking utility.",
      "Analyzed and compared vulnerability reports from multiple external vendors to identify overlaps and gaps in findings.",
    ],
    tags: ["Cyber Security", "Network Security", "Kali Linux", "Go"],
  },
];

export const volunteeringExperiences: ExperienceItem[] = [
  {
    role: "Core Member, Project Team Member",
    company: "Google Developer Groups on Campus Halic",
    date: "Sep 2024 – Present",
    type: "community",
    description: [
      "Collaborating with my team to design and build applications that offer practical solutions to real-world challenges.",
      "Gaining hands-on experience in managing projects and working in a collaborative environment, all while making a positive impact within the university's tech ecosystem.",
      "Working with the social media team to create fun and engaging social media content to promote our events and showcase what we're doing.",
      "Actively participating in both community-focused initiatives and internal project development to support our team's mission and outreach.",
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
    iconId: "monitor",
  },
  {
    title: "OS",
    spec: "Arch Linux, Hyprland",
    description:
      "It was a mental challenge and still one of the best technical decisions I made.",
    iconId: "layers",
  },
  {
    title: "Editor",
    spec: "Zed",
    description:
      "Because waiting for VSCode to open was slowly ruining my life.",
    iconId: "code",
  },
  {
    title: "Terminal",
    spec: "Foot",
    description: "It’s so fast I make typos before I even think of them.",
    iconId: "terminal",
  },
  {
    title: "Browser",
    spec: "Helium Browser",
    description:
      "Because mainstream browsers were eating my RAM for breakfast.",
    iconId: "globe",
  },
];

export const interestsIntro =
  "This page captures the things I keep coming back to. Books, films, and series shape how I think, while basketball and skateboarding keep me moving. Recently, I’ve been building habits around the gym and playing guitar. Slow progress, but consistent.";

export const favoriteBands: BandItem[] = [
  {
    name: "Radiohead",
    image: "/radiohead.jpg",
    url: "https://radiohead.com/",
  },
  {
    name: "Deftones",
    image: "/deftones.jpg",
    url: "https://www.deftones.com/",
  },
];
