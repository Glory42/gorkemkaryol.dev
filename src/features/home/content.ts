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

export const introText =
  "I’m a software engineer building web apps and experimenting with different parts of the stack. I like working on real projects, trying out new tools, and figuring out better ways to build and ship things.";

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
