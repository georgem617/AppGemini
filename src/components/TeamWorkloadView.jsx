import Card from './ui/Card';
import Badge from './ui/Badge';

export default function TeamWorkloadView({ teamMembers, tasks, projects }) {
    // Calcular carga de trabajo por miembro
    const workload = teamMembers.map(member => {
        const memberTasks = tasks.filter(t =>
            t.assignees && t.assignees.includes(member.id)
        );

        const tasksByProject = {};
        memberTasks.forEach(task => {
            const projectName = task.projectName || 'Sin Proyecto';
            if (!tasksByProject[projectName]) {
                tasksByProject[projectName] = { total: 0, completed: 0 };
            }
            tasksByProject[projectName].total++;
            if (task.status === 'done') {
                tasksByProject[projectName].completed++;
            }
        });

        const totalTasks = memberTasks.length;
        const completedTasks = memberTasks.filter(t => t.status === 'done').length;
        const activeTasks = totalTasks - completedTasks;
        const workloadLevel = totalTasks === 0 ? 'low' : totalTasks < 5 ? 'low' : totalTasks < 10 ? 'medium' : 'high';

        return {
            member,
            totalTasks,
            completedTasks,
            activeTasks,
            tasksByProject,
            workloadLevel
        };
    });

    const getWorkloadColor = (level) => {
        switch (level) {
            case 'high': return 'red';
            case 'medium': return 'yellow';
            case 'low': return 'green';
            default: return 'gray';
        }
    };

    const getWorkloadLabel = (level) => {
        switch (level) {
            case 'high': return 'Alta';
            case 'medium': return 'Media';
            case 'low': return 'Baja';
            default: return 'Sin tareas';
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Carga de Trabajo del Equipo</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {workload.map(({ member, totalTasks, completedTasks, activeTasks, tasksByProject, workloadLevel }) => (
                    <Card key={member.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-white">{member.name}</h3>
                                <p className="text-sm text-zinc-500">{member.role || 'Miembro del equipo'}</p>
                            </div>
                            <Badge color={getWorkloadColor(workloadLevel)}>
                                {getWorkloadLabel(workloadLevel)}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-zinc-950 rounded-lg p-3">
                                <div className="text-xs text-zinc-500 mb-1">Activas</div>
                                <div className="text-2xl font-bold text-indigo-400">{activeTasks}</div>
                            </div>
                            <div className="bg-zinc-950 rounded-lg p-3">
                                <div className="text-xs text-zinc-500 mb-1">Completadas</div>
                                <div className="text-2xl font-bold text-emerald-400">{completedTasks}</div>
                            </div>
                            <div className="bg-zinc-950 rounded-lg p-3">
                                <div className="text-xs text-zinc-500 mb-1">Total</div>
                                <div className="text-2xl font-bold text-white">{totalTasks}</div>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-zinc-500 font-medium mb-2 uppercase">Tareas por Proyecto</div>
                            {Object.keys(tasksByProject).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(tasksByProject).map(([projectName, { total, completed }]) => (
                                        <div key={projectName} className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-300 flex-1 truncate">{projectName}</span>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-zinc-500">{completed}/{total}</span>
                                                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-indigo-500 h-full rounded-full"
                                                        style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-600 text-sm italic">Sin tareas asignadas</p>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {workload.length === 0 && (
                <div className="text-center py-12 text-zinc-600">
                    <p>No hay miembros en el equipo aún.</p>
                </div>
            )}
        </div>
    );
}
