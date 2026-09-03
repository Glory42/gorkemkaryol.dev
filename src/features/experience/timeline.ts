export interface ExperienceItem {
  role: string;
  company: string;
  date: string;
  type?: string;
  description: string[];
  tags: string[];
}

export const workExperiences: ExperienceItem[] = [
  {
    role: "Frontend Developer Intern",
    company: "Lodos",
    date: "April 2026 – Present",
    type: "internship",
    description: [
      "Frontend engineer on Gathin (an event/community platform) and Huddin (a Discord-style community app), which share one backend and reached 5,000+ active users within 8 months.",
      "On Gathin: rebuilt profile and community pages around a shared events timeline, redesigned the event gallery and blog, and shipped attendee–organizer direct messaging.",
      "Delivered organizer-panel features: event schedules, sponsor management, speaker drag-and-drop ordering, Excel export for ticket holders, and client-side ticket poster sharing.",
      "On Huddin: built the cross-app DM bridge that renders sibling-app messages as context cards with no chat-renderer changes, and gated channel visibility behind three-way public/shared/private semantics in the Next.js BFF.",
    ],
    tags: ["React", "Next.js", "TypeScript", "Real-Time Systems", "Socket.IO"],
  },
  {
    role: "Full Stack Intern",
    company: "Troy Depo",
    date: "Jul 2026 – Sep 2026",
    type: "internship",
    description: [
      "Built three full-stack products end to end: a self-storage booking platform (Next.js, Prisma), an internal ops dashboard (NestJS, Astro), and a moving-logistics tracker (Go Fiber, Next.js).",
      "Prevented double-booking race conditions with atomic PostgreSQL transactions and conditional row locking across Prisma and Go pgxpool.",
      "Implemented auth from first principles: JWT guards, bcrypt, RBAC, algorithm-confusion protection, and server-side httpOnly cookie proxying.",
      "Modeled core logic as pure, unit-tested functions: tier pricing, Haversine distance, and a deterministic job-lifecycle state machine.",
    ],
    tags: ["Nest.js", "TypeScript", "Next.js", "Astro", "Go", "PostgreSQL", "Prisma", "Docker"],
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
