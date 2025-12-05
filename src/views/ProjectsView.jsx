import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Card from '../components/ui/Card';
import TaskCard from '../components/TaskCard';

export default function ProjectsView({
    projects,
    tasks,
    selectedProjectId,
    onProjectClick,
    onBack,
    onNewProject,
    onTaskClick,
    onStatusToggle
}) {
    // View: List of Projects
    if (!selectedProjectId) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between">
                    <h2 className="text-2xl font-bold">Proyectos</h2>
                    <button
                        onClick={onNewProject}
                        className="text-indigo-400 text-sm"
                    >
                        + Nuevo
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {projects.map(p => (
                        <Card
                            key={p.id}
                            className="cursor-pointer hover:border-indigo-500"
                            onClick={() => onProjectClick(p.id)}
                        >
                            <h3 className="font-bold">{p.name}</h3>
                            <p className="text-xs text-zinc-500">{p.clientName}</p>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // View: Project Detail
    const project = projects.find(p => p.id === selectedProjectId);
    const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={onBack}>
                    <ArrowLeft />
                </button>
                <h2 className="text-2xl font-bold">
                    {project?.name}
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
                <div className="space-y-6">
                    {/* Pendientes */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">Pendientes</h3>
                        <div className="space-y-2">
                            {projectTasks
                                .filter(t => t.status !== 'done')
                                .map(t => (
                                    <TaskCard
                                        key={t.id}
                                        task={t}
                                        onTaskClick={onTaskClick}
                                        onStatusToggle={onStatusToggle}
                                    />
                                ))}
                            {projectTasks.filter(t => t.status !== 'done').length === 0 && (
                                <p className="text-zinc-600 text-sm italic">No hay tareas pendientes</p>
                            )}
                        </div>
                    </div>

                    {/* Completadas */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wider">Completadas</h3>
                        <div className="space-y-2 opacity-60">
                            {projectTasks
                                .filter(t => t.status === 'done')
                                .map(t => (
                                    <TaskCard
                                        key={t.id}
                                        task={t}
                                        onTaskClick={onTaskClick}
                                        onStatusToggle={onStatusToggle}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
