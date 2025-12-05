export default function UserMultiSelect({
    selectedUsers = [],
    availableUsers = [],
    onChange,
    label = "Asignar a"
}) {
    const toggleUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            onChange(selectedUsers.filter(id => id !== userId));
        } else {
            onChange([...selectedUsers, userId]);
        }
    };

    return (
        <div className="flex flex-col gap-1.5 mb-4 w-full">
            {label && (
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap gap-2">
                {availableUsers.map(user => {
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                        <button
                            key={user.id}
                            type="button"
                            onClick={() => toggleUser(user.id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isSelected
                                    ? 'bg-indigo-600 text-white border border-indigo-600'
                                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600'
                                }`}
                        >
                            {user.name}
                        </button>
                    );
                })}
            </div>
            {selectedUsers.length === 0 && (
                <p className="text-xs text-zinc-600 mt-1">Ningún usuario asignado</p>
            )}
        </div>
    );
}
