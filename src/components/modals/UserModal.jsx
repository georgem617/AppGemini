import Card from '../ui/Card';
import Input from '../ui/Input';

export default function UserModal({
    isOpen,
    newUser,
    onChange,
    onClose,
    onSubmit
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
                <h3 className="mb-4 font-bold">Nuevo Miembro</h3>
                <Input
                    placeholder="Nombre"
                    value={newUser.name}
                    onChange={e => onChange({ ...newUser, name: e.target.value })}
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="text-zinc-400"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSubmit}
                        className="bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                        Crear
                    </button>
                </div>
            </Card>
        </div>
    );
}
