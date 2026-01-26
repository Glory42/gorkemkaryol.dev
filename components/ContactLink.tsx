import { ArrowUpRight } from "lucide-react";

function ContactLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
        >
        {icon}
        <span className="relative">
            {label}
            <span className="absolute left-0 bottom-0 w-0 h-px bg-black dark:bg-white transition-all group-hover:w-full"></span>
        </span>
        <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
        </a>
    );
}

export default ContactLink;