import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
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

export interface ExperienceItem {
  role: string;
  company: string;
  date: string;
  description: string[];
  tags: string[];
}

export interface FavoriteItem {
  label: string;
  value: string;
  icon: LucideIcon;
}
