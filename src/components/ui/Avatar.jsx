import { User } from 'lucide-react';

export default function Avatar({ name, size = 'md' }) {
    const sizes = {
        sm: 'w-5 h-5 text-[9px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-12 h-12 text-lg'
    };

    return (
        <div
            className={`${sizes[size]} bg-zinc-700 rounded-full flex items-center justify-center text-zinc-200 font-bold border border-zinc-600 flex-shrink-0`}
            title={name}
        >
            {name ? name.substring(0, 2).toUpperCase() : <User size={12} />}
        </div>
    );
}
