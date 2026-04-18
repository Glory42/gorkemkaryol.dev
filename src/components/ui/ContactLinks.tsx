import { FileText, Mail } from "lucide-react";
import type { ContactItem } from "@/lib/content";

interface Props {
  items: ContactItem[];
}

export function ContactLinks({ items }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const external =
          item.href.startsWith("http") || item.href.startsWith("mailto:");

        return (
          <a
            key={`${item.href}-${item.label}`}
            href={item.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="focus-ring mono inline-flex items-center gap-1.5 border border-[rgba(64,61,82,0.8)] bg-[rgba(31,29,46,0.5)] px-[11px] py-[5px] text-[10px] tracking-[0.1em] text-[rgba(224,222,244,0.6)] no-underline transition hover:border-[rgba(196,167,231,0.35)] hover:text-[rgba(224,222,244,0.9)]"
          >
            {item.icon === "github" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            ) : item.icon === "linkedin" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            ) : item.icon === "mail" ? (
              <Mail size={11} />
            ) : (
              <FileText size={11} />
            )}

            {item.label}
          </a>
        );
      })}
    </div>
  );
}
