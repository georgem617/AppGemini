import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import UserMultiSelect from '../ui/UserMultiSelect';

export default function TaskModal({
    isOpen,
    newTask,
    projects,
    teamMembers = [],
    onClose,
    onChange,
    onSubmit
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg">
                <h3 className="text-lg font-bold mb-4">Nueva Tarea</h3>
                <Input
                    placeholder="Título"
                    value={newTask.title}
                    onChange={e => onChange({ ...newTask, title: e.target.value })}
                    autoFocus
                />
                <Select
                    options={[
                        { value: '', label: 'Sin Proyecto' },
                        ...projects.map(p => ({ value: p.id, label: p.name }))
                    ]}
                    onChange={e => onChange({ ...newTask, projectId: e.target.value })}
                />
                <UserMultiSelect
                    label="Asignar a"
                    selectedUsers={newTask.assignees || []}
                    availableUsers={teamMembers}
                    onChange={assignees => onChange({ ...newTask, assignees })}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white px-4 py-2"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSubmit}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
                    >
                        Crear Tarea
                    </button>
                </div>
            </Card>
        </div>
    );
}
