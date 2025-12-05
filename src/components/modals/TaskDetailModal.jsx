import { X, Save } from 'lucide-react';
import Card from '../ui/Card';
import SubtaskEditor from '../SubtaskEditor';

export default function TaskDetailModal({
    isOpen,
    editingTask,
    teamMembers = [],
    onClose,
    onChange,
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
                        <SubtaskEditor
                            subtasks={editingTask.subtasks || []}
                            teamMembers={teamMembers}
                            onChange={(updatedSubtasks) => onChange({ ...editingTask, subtasks: updatedSubtasks })}
                        />
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
