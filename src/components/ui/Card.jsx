export default function Card({ children, className = '', onClick }) {
    return (
        <div
            onClick={onClick}
            className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-zinc-200 ${className}`}
        >
            {children}
        </div>
    );
}
