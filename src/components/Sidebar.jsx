import { Layout, Briefcase, CheckSquare, Users, UserPlus } from 'lucide-react';

export default function Sidebar({ currentView, onViewChange }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Layout },
        { id: 'projects', label: 'Proyectos', icon: Briefcase },
        { id: 'tasks', label: 'Tareas', icon: CheckSquare },
        { id: 'clients', label: 'Clientes', icon: Users },
        { id: 'team', label: 'Equipo', icon: UserPlus }
    ];

    return (
        <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-zinc-800 font-bold text-lg">
                AppGemini
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium ${currentView === item.id
                                ? 'bg-zinc-800 text-white'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
