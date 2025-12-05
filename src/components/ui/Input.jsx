export default function Input({ label, ...props }) {
    return (
        <div className="flex flex-col gap-1.5 mb-4 w-full">
            {label && (
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <input
                className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-600 w-full"
                {...props}
            />
        </div>
    );
}
