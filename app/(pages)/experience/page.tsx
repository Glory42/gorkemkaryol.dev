"use client";

import AnimatedContainer, {
  AnimatedElement,
} from "@/components/AnimatedContainer";

const experiences = [
    {
        role: "Cyber Security Intern",
        company: "OPET",
        date: "Jun 2025 - Aug 2025",
        description: [
        "Conducted vulnerability assessments using tools such as Kali Linux and categorized findings by severity.",
        "Developed custom security tools in Go, including a port scanner with service detection and a hash-cracking utility.",
        "Collaborated with cybersecurity and infrastructure teams to plan and implement remediation strategies.",
        "Analyzed and compared vulnerability reports from multiple external vendors to identify overlaps and gaps in findings.",
        ],
        tech: ["Cyber Security", "Network Security", "Kali Linux", "Go"],
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
        tech: ["Teamwork", "Community Building", "Project Management"],
    },
];

export default function ExperiencePage() {
    return (
        <section className="min-h-screen py-20 px-4 md:px-9 md:py-40">
        <AnimatedContainer className="border-neutral-800 ml-3 md:ml-6 space-y-12">
            {experiences.map((item, index) => (
            <AnimatedElement key={index} className="relative pl-8 md:pl-12 group">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-600 transition-colors">
                    {item.role}
                </h3>
                <span className="font-mono text-ms text-white mt-1 sm:mt-0">
                    {item.company} <span className="mx-2">|</span> {item.date}
                </span>
                </div>

                <ul className="space-y-2 mb-6">
                {item.description.map((desc, i) => (
                    <li
                    key={i}
                    className="text-neutral-400 text-sm leading-relaxed flex items-start"
                    >
                    <span className="mr-3 mt-1.5 h-1 w-1 rounded-full bg-neutral-600 shrink-0" />
                    {desc}
                    </li>
                ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                {item.tech.map((t) => (
                    <span
                    key={t}
                    className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-500 border border-neutral-800 rounded bg-neutral-900/50"
                    >
                    {t}
                    </span>
                ))}
                </div>
            </AnimatedElement>
            ))}

            <AnimatedElement className="relative pl-8 md:pl-12 pt-4">
            <span className="text-xs font-mono text-neutral-600">
                End of history
            </span>
            </AnimatedElement>
        </AnimatedContainer>
        </section>
    );
}
