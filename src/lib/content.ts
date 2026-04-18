import { Book, Film, Mic2, Music, type LucideIcon } from "lucide-react";

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

export interface FavoriteItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

export const navigationItems: NavigationItem[] = [
  { href: "/", label: "me" },
  { href: "/projects", label: "projects" },
  { href: "/interests", label: "interests" },
  { href: "/experience", label: "experience" },
  { href: "/cool", label: "cool" },
];

export const experiences: ExperienceItem[] = [
  {
    role: "Cyber Security Intern",
    company: "OPET",
    date: "Jun 2025 - Aug 2025",
    description: [
      "Conducted vulnerability assessments using Kali Linux and categorized findings by severity.",
      "Developed custom security tools in Go, including a port scanner with service detection and a hash-cracking utility.",
      "Collaborated with cybersecurity and infrastructure teams to plan and implement remediation strategies.",
      "Analyzed vulnerability reports from multiple external vendors to identify overlaps and blind spots.",
    ],
    tags: ["Cyber Security", "Network Security", "Kali Linux", "Go"],
  },
  {
    role: "Core/Project Team Member",
    company: "Google Developer Groups",
    date: "Sep 2024 - Present",
    description: [
      "Collaborating with my team to design and build applications that offer practical solutions to real-world challenges.",
      "Gaining hands-on experience in managing projects and working in a collaborative environment.",
      "Partnering with the social media team to produce creative and engaging content that promotes our events.",
      "Actively participating in both community-focused initiatives and internal project development.",
    ],
    tags: ["Teamwork", "Community Building", "Project Management"],
  },
];

export const introText =
  "I am a computer engineering student focused on backend systems and modern web applications. I enjoy building production software, contributing to open source, and continuously exploring better developer tools.";

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
  "I am passionate about technology and the things I enjoy outside of it. I love exploring Linux, experimenting with homelabs, and diving into computer networks. Outside of tech, I enjoy reading, watching movies, basketball, and skateboarding.";

export const favorites: FavoriteItem[] = [
  {
    icon: Film,
    label: "Favorite Movie",
    value: "Knockin' on Heaven's Door",
  },
  {
    icon: Book,
    label: "Favorite Book",
    value: "Hitchhiker's Guide to The Galaxy",
  },
  {
    icon: Music,
    label: "Favorite Band",
    value: "Radiohead",
  },
  {
    icon: Mic2,
    label: "Favorite Song",
    value: "Lover You Should've Come Over",
  },
];
