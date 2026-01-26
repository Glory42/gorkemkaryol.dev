function FavoriteItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-900/30 border border-neutral-800/50 hover:border-neutral-700 hover:bg-neutral-900/50 transition-all group">
            <span className="text-neutral-500 group-hover:text-white transition-colors">{icon}</span>
            <div className="flex flex-col">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-medium text-neutral-200 group-hover:text-white">{value}</span>
            </div>
        </div>
    );
}


export default FavoriteItem;