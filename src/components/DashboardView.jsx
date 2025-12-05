import { BarChart2 } from 'lucide-react';
import Card from './ui/Card';

export default function DashboardView({
    filteredProjects,
    filteredTasks,
    tasks,
    onProjectClick
}) {
    const total = filteredTasks.length;
    const done = filteredTasks.filter(t => t.status === 'done').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
                <Card className="h-24 flex flex-col justify-between border-l-4 border-l-zinc-600">
                    <span className="text-xs text-zinc-500 font-bold">TOTAL</span>
                    <span className="text-3xl font-bold text-white">{total}</span>
                </Card>
                <Card className="h-24 flex flex-col justify-between border-l-4 border-l-emerald-500">
                    <span className="text-xs text-zinc-500 font-bold">HECHAS</span>
                    <span className="text-3xl font-bold text-white">{done}</span>
                </Card>
                <Card className="h-24 flex flex-col justify-between border-l-4 border-l-indigo-500">
                    <span className="text-xs text-zinc-500 font-bold">PENDIENTES</span>
                    <span className="text-3xl font-bold text-white">{total - done}</span>
                </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                        <BarChart2 size={18} /> Avance Proyectos
                    </h3>
                    <div className="space-y-3">
                        {filteredProjects.map(p => {
                            const pt = tasks.filter(t => t.projectId === p.id);
                            let items = 0, completed = 0;
                            pt.forEach(t => {
                                items++;
                                if (t.status === 'done') completed++;
                                if (t.subtasks) {
                                    items += t.subtasks.length;
                                    completed += t.subtasks.filter(s => s.completed).length;
                                }
                            });
                            const pct = items === 0 ? 0 : Math.round((completed / items) * 100);

                            return (
                                <div
                                    key={p.id}
                                    className="cursor-pointer"
                                    onClick={() => onProjectClick(p.id)}
                                >
                                    <div className="flex justify-between text-xs mb-1 text-zinc-300">
                                        <span>{p.name}</span>
                                        <span>{pct}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-800 rounded-full">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}
