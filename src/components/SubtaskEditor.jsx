import { X, Calendar, Users } from 'lucide-react';
import UserMultiSelect from './ui/UserMultiSelect';

export default function SubtaskEditor({
    subtasks = [],
    teamMembers = [],
    onChange
}) {
    const toggleSubtask = (subtaskId) => {
        const updated = subtasks.map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        onChange(updated);
    };

    const updateSubtask = (subtaskId, updates) => {
        const updated = subtasks.map(s =>
            s.id === subtaskId ? { ...s, ...updates } : s
        );
        onChange(updated);
    };

    const removeSubtask = (subtaskId) => {
        onChange(subtasks.filter(s => s.id !== subtaskId));
    };

    const addSubtask = () => {
        const newSubtask = {
            id: crypto.randomUUID(),
            title: '',
            completed: false,
            dueDate: '',
            assignees: []
        };
        onChange([...subtasks, newSubtask]);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-xs text-zinc-500 font-medium uppercase">Subtareas</label>
                <button
                    onClick={addSubtask}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                    + Agregar
                </button>
            </div>

            {subtasks.length === 0 && (
                <p className="text-xs text-zinc-600 italic">Sin subtareas aún</p>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
                {subtasks.map(subtask => (
                    <div
                        key={subtask.id}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2"
                    >
                        {/* Title and checkbox */}
                        <div className="flex gap-2 items-start">
                            <button
                                onClick={() => toggleSubtask(subtask.id)}
                                className={`mt-1 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${subtask.completed
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'border-zinc-600'
                                    }`}
                            >
                                {subtask.completed && (
                                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                            <input
                                type="text"
                                value={subtask.title}
                                onChange={(e) => updateSubtask(subtask.id, { title: e.target.value })}
                                placeholder="Título de subtarea..."
                                className={`flex-1 bg-transparent border-none focus:outline-none text-sm ${subtask.completed ? 'line-through text-zinc-600' : 'text-zinc-300'
                                    }`}
                            />
                            <button
                                onClick={() => removeSubtask(subtask.id)}
                                className="text-zinc-600 hover:text-red-400 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Date and assignees */}
                        <div className="grid grid-cols-2 gap-3 pl-6">
                            {/* Due date */}
                            <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-zinc-600" />
                                <input
                                    type="date"
                                    value={subtask.dueDate || ''}
                                    onChange={(e) => updateSubtask(subtask.id, { dueDate: e.target.value })}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-400"
                                />
                            </div>

                            {/* Assignees */}
                            <div className="flex items-center gap-2">
                                <Users size={12} className="text-zinc-600" />
                                <div className="flex-1">
                                    <UserMultiSelect
                                        selectedUsers={subtask.assignees || []}
                                        availableUsers={teamMembers}
                                        onChange={(assignees) => updateSubtask(subtask.id, { assignees })}
                                        label=""
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
