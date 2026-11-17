// Who the site is about; SEO, the home panel, the palette and the shell all read from here.
export const profile = {
  name: "Görkem Karyol",
  /** The name without diacritics, as people often type it. */
  asciiName: "Gorkem Karyol",
  role: "full-stack engineer",
  city: "Istanbul",
  location: "Istanbul, Türkiye",
  timezone: "Europe/Istanbul",
  timezoneLabel: "UTC+3",
} as const;

export interface ContactItem {
  href: string;
  label: string;
  icon: "github" | "linkedin" | "mail" | "file";
}

export const contactItems: ContactItem[] = [
  { href: "https://github.com/glory42", label: "GitHub", icon: "github" },
  { href: "https://linkedin.com/in/glory42", label: "LinkedIn", icon: "linkedin" },
  { href: "mailto:me@gorkemkaryol.dev", label: "Mail", icon: "mail" },
  { href: "/Gorkem-Karyol-CV.pdf", label: "CV", icon: "file" },
];

export const DOTFILES_URL = "https://github.com/Glory42/arch-config";
