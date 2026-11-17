import { DOTFILES_URL, profile } from "@/lib/profile";

export interface TechItem {
  /** Stable key the shell's fastfetch looks rows up by. */
  id: "laptop" | "os" | "editor" | "terminal" | "browser";
  title: string;
  spec: string;
  description: string;
  iconId: "monitor" | "layers" | "code" | "terminal" | "globe";
  /** Makes the spec a link (e.g. the config repo behind it). */
  href?: string;
}

export const hero = {
  /** Typed out in turn under the name; the first is also the role screen readers get. */
  roles: [profile.role, "linux enjoyer", "web developer"],
  status: "Open to full-stack & freelance work",
};

export const introText =
  "I build web apps end to end, all in TypeScript: React and Next.js on the front, NestJS or Bun with Postgres behind it. At Lodos I work on Gathin; on my own I build and run Interis.";

export interface NowItem {
  label: "building" | "at work" | "shipped";
  text: string;
  href: string;
}

/** Hand-written `now.txt` lines; reading and watching are appended live. Keep each to one short line. */
export const nowItems: NowItem[] = [
  { label: "building", text: "Interis film & TV diary", href: "https://interis.gorkemkaryol.dev" },
  { label: "at work", text: "Gathin at Lodos", href: "https://gathin.com" },
  { label: "shipped", text: "RigCheck for Linux", href: "https://rigcheck.gorkemkaryol.dev" },
];

export const techItems: TechItem[] = [
  {
    id: "laptop",
    title: "Laptop",
    spec: "ASUS Zenbook UM3402YAR",
    description:
      "I have been using this for more than a year. It is light, stable, and reliable.",
    iconId: "monitor",
  },
  {
    id: "os",
    title: "OS",
    spec: "Arch Linux, Hyprland",
    description:
      "It was a mental challenge and still one of the best technical decisions I made.",
    iconId: "layers",
    href: DOTFILES_URL,
  },
  {
    id: "editor",
    title: "Editor",
    spec: "Zed",
    description:
      "Because waiting for VSCode to open was slowly ruining my life.",
    iconId: "code",
  },
  {
    id: "terminal",
    title: "Terminal",
    spec: "Foot",
    description: "It’s so fast I make typos before I even think of them.",
    iconId: "terminal",
  },
  {
    id: "browser",
    title: "Browser",
    spec: "Helium Browser",
    description:
      "Because mainstream browsers were eating my RAM for breakfast.",
    iconId: "globe",
  },
];
