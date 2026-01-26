function TechCard({ title, spec, desc }: { title: string; spec: string; desc: string }) {
    return (
        <div className="p-4 rounded-lg  border border-neutral-100 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-white transition-colors">
        <h3 className="text-xs font-mono text-neutral-400 mb-1 uppercase">{title}</h3>
        <p className="font-medium text-black dark:text-white mb-2">{spec}</p>
        <p className="text-sm text-neutral-500 leading-snug">{desc}</p>
        </div>
    );
}

export default TechCard;