export default function Badge({ children, color = 'gray', className = '', onClick }) {
    const colors = {
        gray: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        blue: 'bg-blue-900/30 text-blue-300 border-blue-800',
        green: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
        yellow: 'bg-amber-900/30 text-amber-300 border-amber-800',
        red: 'bg-red-900/30 text-red-300 border-red-800',
    };

    return (
        <span
            onClick={onClick}
            className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[color]} ${className} ${onClick ? 'cursor-pointer hover:brightness-110' : ''}`}
        >
            {children}
        </span>
    );
}
