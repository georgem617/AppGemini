import { X, Save, ArrowUpRight } from 'lucide-react';
import Card from '../ui/Card';

export default function TaskDetailModal({
    isOpen,
    editingTask,
    tempSubtask,
    onClose,
    onChange,
    onSubtaskChange,
    onSubtaskAdd,
    onConvertSubtaskToTask,
    onSave,
    onDelete
}) {
    if (!isOpen || !editingTask) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <input
                        className="bg-transparent text-xl font-bold text-white border-none focus:ring-0 w-full"
                        value={editingTask.title}
                        onChange={e => onChange({ ...editingTask, title: e.target.value })}
                    />
                    <button onClick={onClose}>
                        <X className="text-zinc-500" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs text-zinc-500 block mb-2">CHECKLIST</label>
                        <div className="space-y-2">
                            {editingTask.subtasks?.map(sub => (
                                <div
                                    key={sub.id}
                                    className="flex items-center gap-2 bg-zinc-950 p-2 rounded border border-zinc-800 group"
                                >
                                    <div
                                        className={`w-4 h-4 border rounded cursor-pointer ${sub.completed ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-600'
                                            }`}
                                        onClick={() => {
                                            const updated = editingTask.subtasks.map(s =>
                                                s.id === sub.id ? { ...s, completed: !s.completed } : s
                                            );
                                            onChange({ ...editingTask, subtasks: updated });
                                        }}
                                    ></div>
                                    <input
                                        className="bg-transparent text-sm text-zinc-300 flex-1 border-none focus:ring-0"
                                        value={sub.title}
                                        onChange={e => {
                                            const updated = editingTask.subtasks.map(s =>
                                                s.id === sub.id ? { ...s, title: e.target.value } : s
                                            );
                                            onChange({ ...editingTask, subtasks: updated });
                                        }}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onConvertSubtaskToTask(sub.id);
                                        }}
                                        className="p-1 bg-zinc-800 hover:bg-indigo-600 rounded text-zinc-400 hover:text-white transition-colors"
                                        title="Convertir en Tarea Principal"
                                    >
                                        <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            ))}
                            <div className="flex gap-2 mt-2">
                                <input
                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm"
                                    placeholder="Nueva subtarea..."
                                    value={tempSubtask}
                                    onChange={e => onSubtaskChange(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && tempSubtask.trim()) {
                                            onSubtaskAdd();
                                        }
                                    }}
                                />
                                <button
                                    onClick={onSubtaskAdd}
                                    className="bg-zinc-800 px-3 rounded text-zinc-300"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 block mb-2">DETALLES</label>
                        <textarea
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-zinc-300 mb-4"
                            rows={5}
                            placeholder="Notas..."
                            value={editingTask.notes || ''}
                            onChange={e => onChange({ ...editingTask, notes: e.target.value })}
                        />
                        <label className="text-xs text-zinc-500 block mb-1">Fecha Límite</label>
                        <input
                            type="date"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-zinc-300"
                            value={editingTask.dueDate || ''}
                            onChange={e => onChange({ ...editingTask, dueDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
                    <button
                        className="text-red-400 hover:text-red-300 text-sm px-3"
                        onClick={onDelete}
                    >
                        Eliminar Tarea
                    </button>
                    <button
                        onClick={onSave}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <Save size={16} /> Guardar Cambios
                    </button>
                </div>
            </Card>
        </div>
    );
}
