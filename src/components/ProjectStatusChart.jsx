import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProjectStatusChart({ projects, tasks, onProjectClick }) {
    // Calcular estado de cada proyecto
    const projectData = projects.map(project => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const total = projectTasks.length;
        const completed = projectTasks.filter(t => t.status === 'done').length;
        const inProgress = projectTasks.filter(t => t.status !== 'done' && t.status !== 'backlog').length;
        const pending = projectTasks.filter(t => t.status === 'backlog').length;

        return {
            name: project.name,
            id: project.id,
            total,
            completed,
            inProgress,
            pending,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    });

    const COLORS = {
        completed: '#10b981',
        inProgress: '#8b5cf6',
        pending: '#6b7280'
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Estado de Proyectos
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectData} onClick={(data) => data?.activePayload && onProjectClick(data.activePayload[0].payload.id)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                        dataKey="name"
                        stroke="#71717a"
                        tick={{ fill: '#a1a1aa', fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#71717a"
                        tick={{ fill: '#a1a1aa', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            color: '#e4e4e7'
                        }}
                        cursor={{ fill: '#27272a50' }}
                    />
                    <Bar
                        dataKey="completed"
                        stackId="a"
                        fill={COLORS.completed}
                        name="Completadas"
                        cursor="pointer"
                    />
                    <Bar
                        dataKey="inProgress"
                        stackId="a"
                        fill={COLORS.inProgress}
                        name="En Progreso"
                        cursor="pointer"
                    />
                    <Bar
                        dataKey="pending"
                        stackId="a"
                        fill={COLORS.pending}
                        name="Pendientes"
                        cursor="pointer"
                    />
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 flex gap-4 justify-center flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.completed }}></div>
                    <span className="text-xs text-zinc-400">Completadas</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.inProgress }}></div>
                    <span className="text-xs text-zinc-400">En Progreso</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.pending }}></div>
                    <span className="text-xs text-zinc-400">Pendientes</span>
                </div>
            </div>
        </div>
    );
}
