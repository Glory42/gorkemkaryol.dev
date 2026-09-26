import { contactItems, introText, techItems } from "@/features/home/content";
import { SECTION_LIST, SECTIONS } from "@/lib/sections";

export interface ShellSegment {
  text: string;
  color?: string;
}

export interface ShellResult {
  lines: string[];
  navigateTo?: string;
  clear?: boolean;
  /** Colored segments per row, for commands lines can't express (fastfetch). */
  rich?: ShellSegment[][];
}

// The site's first commit — fastfetch's "uptime" counts from here, for real.
const SITE_LAUNCH = new Date("2025-10-01T21:09:30+03:00");

function uptimeSinceLaunch(): string {
  const totalSeconds = Math.max(0, Math.floor((Date.now() - SITE_LAUNCH.getTime()) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${days} days, ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

const DIRS: Record<string, string> = {
  "/": "home",
  home: "home",
  experience: "experience",
  projects: "projects",
  interests: "interests",
  playground: "playground",
};

const FILES: Record<string, string[]> = {
  "about.txt": [introText],
  "stack.txt": techItems.map((t) => `${t.title}: ${t.spec} — ${t.description}`),
  "contact.txt": contactItems.map((c) => `${c.label}: ${c.href}`),
};

const HELP_LINES = [
  "help ............ this list",
  "ls ............... what's here",
  "cat <file> ....... about.txt, stack.txt, contact.txt",
  "cd <section> ..... home, experience, projects, interests, playground",
  "whoami ........... who's running this thing",
  "fastfetch ........ the setup, terminal-style",
  "clear ............ wipe the scrollback",
  "exit ............. back to the playground",
];

const FASTFETCH_ART = [
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⣄⡀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡸⠋⠀⠘⣇⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠇⠀⠀⠀⢸⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡜⠀⠀⠀⠀⢸⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠇⠀⠀⠀⠀⢸⠇⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡎⠀⠀⠀⠀⠀⢸⠀⠀⠀",
  "⠀⠀⢀⣀⣀⣀⠀⠀⠀⠀⠀⢀⣀⣤⡤⠤⠤⠤⠤⢤⣤⣀⡤⢖⡿⠛⠉⢳⠀⠀⠀⠀⠀⢸⠀⠀⠀",
  "⠀⢼⠁⠉⠉⠛⠻⢭⡓⠒⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⣏⠀⠀⠀⢸⠀⠀⠀⠀⠀⡤⠀⠀⠀",
  "⠀⠸⡄⠀⠀⠀⠀⢸⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠂⠀⠀⡜⠀⠀⠀⠀⢀⡇⠀⠀⠀",
  "⠀⠀⢷⠀⠀⠀⠠⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢣⢠⠏⠀⠀⠀⠀⢸⠃⠀⠀⠀",
  "⠀⠀⠈⢧⠀⢀⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡞⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀",
  "⠀⠀⠀⠈⢳⡈⠁⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀⠀⠀⠀⠀⣶⣶⣦⠀⠀⢹⠀⠀⠀⠀⠀⡎⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⢠⣾⣟⣹⡄⠀⠀⠀⠀⡀⠀⣿⣿⣿⡇⠀⢈⣧⠤⠤⠶⠶⢷⠒⠒⠂⠀",
  "⠀⠀⢀⣀⣠⡧⠄⠀⠀⠀⣾⣿⣿⣿⠇⠀⠀⠀⠙⠁⠀⠙⠻⠿⠃⠀⠨⣼⣤⣀⡀⠀⠈⢧⠀⠀⠀",
  "⠘⠉⠁⠀⢸⣤⡤⠀⠀⠀⠛⢿⡿⠋⠀⠀⠀⠀⠴⠦⠀⠀⠀⠀⠀⠐⣲⣯⡀⠀⠈⠙⠓⠺⣧⣄⡀",
  "⠀⣀⡤⠚⠉⢳⡴⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡼⠃⠀⠈⠓⢦⡀⠀⠀⢸⠀⠈",
  "⠀⠁⠀⢀⡔⠉⠙⡶⢄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠴⠚⠁⠀⠀⠀⠀⠀⠀⠈⠓⠆⠀⡇⠀",
  "⠀⠀⠰⠋⠀⠀⢸⡇⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠁⠀",
  "⠀⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡎⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠹⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠙⢆⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠄⠀⢰⠇⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠶⠺⣇⠀⣀⡜⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢱⡄⠀⠀⠀⠹⡟⠒⢢⡀⠀⠀⠀⠀⢀⡏⠀⠀⠀⠈⠉⠉⠁⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣄⠀⠀⢀⡇⠀⠀⠻⣄⠀⠀⠀⡸⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⠶⠋⠀⠀⠀⠀⠈⣣⠶⠖⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
];

function fastfetchOutput(): { lines: string[]; rich: ShellSegment[][] } {
  const spec = (title: string) => techItems.find((t) => t.title === title)?.spec ?? "";
  const [osName, wm] = spec("OS").split(",").map((s) => s.trim());

  const info = [
    "gorkem@portfolio",
    "-----------------",
    `OS: ${osName} x86_64`,
    `Host: ${spec("Laptop")}`,
    "Kernel: 6.12.10-arch1-1",
    `Uptime: ${uptimeSinceLaunch()}`,
    "Shell: zsh 5.9",
    `WM: ${wm}`,
    `Terminal: ${spec("Terminal")}`,
    `Editor: ${spec("Editor")}`,
    `Browser: ${spec("Browser")}`,
    "CPU: overheats easily, just like the owner",
    "Memory: too expensive to disclose",
  ];

  const artWidth = Math.max(...FASTFETCH_ART.map((line) => line.length)) + 4;
  const colorRow = info.length + 1;
  const rows = Math.max(FASTFETCH_ART.length, colorRow + 1);

  const plainColorRow = SECTION_LIST.map(() => "███ ").join("");

  const lines: string[] = [];
  const rich: ShellSegment[][] = [];

  for (let i = 0; i < rows; i++) {
    const art = (FASTFETCH_ART[i] ?? "").padEnd(artWidth);
    const artSegment: ShellSegment = { text: art, color: SECTIONS.playground.accentHex };

    if (i < info.length) {
      lines.push(art + info[i]);
      rich.push([artSegment, { text: info[i] }]);
    } else if (i === colorRow) {
      lines.push(art + plainColorRow);
      rich.push([
        artSegment,
        ...SECTION_LIST.map((s) => ({ text: "███ ", color: s.accentHex })),
      ]);
    } else {
      lines.push(art);
      rich.push([artSegment]);
    }
  }

  return { lines, rich };
}

export function runShellCommand(input: string): ShellResult {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [] };

  const [name, ...rest] = trimmed.split(/\s+/);
  const arg = rest.join(" ");

  switch (name) {
    case "help":
      return { lines: HELP_LINES };

    case "ls":
      return { lines: [Object.keys(FILES).join("  "), "experience/  projects/  interests/  playground/"] };

    case "cat": {
      if (!arg) return { lines: ["usage: cat <file>"] };
      const file = FILES[arg];
      return file ? { lines: file } : { lines: [`cat: ${arg}: no such file`] };
    }

    case "cd": {
      const dest = arg.trim();
      const section = DIRS[dest] ?? DIRS[dest.replace(/^\.\//, "")];
      if (!section) return { lines: [`cd: ${arg || "~"}: no such section`] };
      return {
        lines: [`heading to /${section === "home" ? "" : section} ...`],
        navigateTo: section === "home" ? "/" : `/${section}`,
      };
    }

    case "whoami":
      return {
        lines: [
          "gorkem karyol — software engineer",
          "(the real one lives at /playground/whoami)",
        ],
      };

    case "fastfetch": {
      const output = fastfetchOutput();
      return { lines: output.lines, rich: output.rich };
    }

    case "echo":
      return { lines: [arg] };

    case "date":
      return { lines: [new Date().toString()] };

    case "sudo":
      return { lines: ["permission denied: nice try"] };

    case "clear":
      return { lines: [], clear: true };

    case "exit":
    case "logout":
      return { lines: ["logging out ..."], navigateTo: "/playground" };

    default:
      return { lines: [`command not found: ${name}`, "type 'help' to see what's here."] };
  }
}
