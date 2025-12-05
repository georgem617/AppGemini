import { BarChart2 } from 'lucide-react';
import Card from './ui/Card';
import ProjectStatusChart from './ProjectStatusChart';

export default function DashboardView({
    filteredProjects,
    filteredTasks,
    tasks,
    onProjectClick
}) {
    const total = filteredTasks.length;
    const done = filteredTasks.filter(t => t.status === 'done').length;
    const inProgress = filteredTasks.filter(t => t.status !== 'done' && t.status !== 'backlog').length;
    const backlog = filteredTasks.filter(t => t.status === 'backlog').length;

    return (
        <div className="space-y-6">
            {/* KPIs en Tiempo Real */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="h-24 flex flex-col justify-between border-l-4 border-l-zinc-600">
                    <span className="text-xs text-zinc-500 font-bold">TOTAL</span>
                    <span className="text-3xl font-bold text-white">{total}</span>
                </Card>
                <Card className="h-24 flex flex-col justify-between border-l-4 border-l-emerald-500">
                    <span className="text-xs text-zinc-500 font-bold">COMPLETADAS</span>
                    <span className="text-3xl font-bold text-white">{done}</span>
                </Card>
                <Card className="h-24 flex flex-col justify-between border-l-4 border-l-indigo-500">
                    <span className="text-xs text-zinc-500 font-bold">EN PROGRESO</span>
                    <span className="text-3xl font-bold text-white">{inProgress}</span>
                </Card>
                <Card className="h-24 flex flex-col justify-between border-l-4 border-l-amber-500">
                    <span className="text-xs text-zinc-500 font-bold">BACKLOG</span>
                    <span className="text-3xl font-bold text-white">{backlog}</span>
                </Card>
            </div>

            {/* Gráfica de Estado de Proyectos con Drilldown */}
            <ProjectStatusChart
                projects={filteredProjects}
                tasks={tasks}
                onProjectClick={onProjectClick}
            />

            {/* Avance Detallado por Proyecto */}
            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                        <BarChart2 size={18} /> Avance Detallado
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
                                    className="cursor-pointer hover:bg-zinc-800/50 p-2 rounded transition-colors"
                                    onClick={() => onProjectClick(p.id)}
                                >
                                    <div className="flex justify-between text-xs mb-1 text-zinc-300">
                                        <span className="font-medium">{p.name}</span>
                                        <span className="text-zinc-500">{completed}/{items} · {pct}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-800 rounded-full">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all"
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
