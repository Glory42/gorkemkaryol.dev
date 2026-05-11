import { FileText, Mail } from "lucide-react";
import type { ContactItem } from "@/lib/content";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";

interface Props {
  items: ContactItem[];
}

export function ContactLinks({ items }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      {items.map((item) => {
        const external =
          item.href.startsWith("http") || item.href.startsWith("mailto:");

        return (
          <a
            key={`${item.href}-${item.label}`}
            href={item.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="focus-ring mono inline-flex items-center gap-1.5 text-[11px] tracking-[0.06em] text-[#555] no-underline transition-colors duration-150 hover:text-white"
          >
            {item.icon === "github" ? (
              <GithubIcon size={11} />
            ) : item.icon === "linkedin" ? (
              <LinkedinIcon size={11} />
            ) : item.icon === "mail" ? (
              <Mail size={11} aria-hidden="true" />
            ) : (
              <FileText size={11} aria-hidden="true" />
            )}
            {item.label}
          </a>
        );
      })}
    </div>
  );
}
