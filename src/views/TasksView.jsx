import React from 'react';
import TaskCard from '../components/TaskCard';
import Badge from '../components/ui/Badge';

export default function TasksView({ tasks, onTaskClick, onStatusToggle }) {
    return (
        <div className="grid grid-cols-3 gap-6 h-full">
            {/* Columna 1: Tareas Pendientes */}
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
                <div className="p-3 border-b border-zinc-800 font-bold text-zinc-300 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    Tareas Pendientes
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                    {tasks
                        .filter(t => t.status !== 'done')
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

            {/* Columna 2: Subtareas (Nueva) */}
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
                <div className="p-3 border-b border-zinc-800 font-bold text-zinc-300 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    Subtareas Activas
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {tasks
                        .flatMap(t => (t.subtasks || []).map(s => ({ ...s, parentTask: t })))
                        .filter(s => !s.completed)
                        .map(sub => (
                            <div key={sub.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded hover:border-zinc-600 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm text-zinc-200">{sub.title}</span>
                                    <Badge color="gray" size="sm" className="text-[10px] whitespace-nowrap">
                                        {sub.parentTask.title.substring(0, 15)}...
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        {sub.assignees && sub.assignees.length > 0 ? (
                                            <div className="flex -space-x-1">
                                                {sub.assignees.map((uid, idx) => (
                                                    <div key={idx} className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-white border border-zinc-800">
                                                        {uid.substring(0, 1).toUpperCase()}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <span>Sin asignar</span>}
                                    </div>
                                    <span className={`${sub.dueDate ? 'text-amber-500' : ''}`}>
                                        {sub.dueDate || 'Sin fecha'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    {tasks.flatMap(t => (t.subtasks || [])).filter(s => !s.completed).length === 0 && (
                        <p className="text-zinc-600 text-sm text-center italic mt-10">No hay subtareas activas</p>
                    )}
                </div>
            </div>

            {/* Columna 3: Finalizadas */}
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
                <div className="p-3 border-b border-zinc-800 font-bold text-zinc-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Finalizadas
                </div>
                <div className="flex-1 overflow-y-auto p-3 opacity-50">
                    {tasks
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
    );
}
