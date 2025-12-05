import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function ClientsView({
    clients,
    projects,
    selectedClientId,
    onClientClick,
    onBack,
    onNewClient,
    onNewProject,// Prop to open modal for new project linked to client
    onProjectClick
}) {
    // View: Clients List
    if (!selectedClientId) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between">
                    <h2 className="text-2xl font-bold">Clientes</h2>
                    <button
                        onClick={onNewClient}
                        className="text-indigo-400 text-sm"
                    >
                        + Nuevo
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {clients.map(c => (
                        <Card
                            key={c.id}
                            className="cursor-pointer hover:border-emerald-500"
                            onClick={() => onClientClick(c.id)}
                        >
                            <h3 className="font-bold">{c.name}</h3>
                            <Badge color={c.status === 'activo' ? 'green' : 'gray'}>
                                {c.status}
                            </Badge>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // View: Client Detail
    const client = clients.find(c => c.id === selectedClientId);
    const clientProjects = projects.filter(p => p.clientId === selectedClientId);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-zinc-800 rounded-full"
                >
                    <ArrowLeft />
                </button>
                <div>
                    <h2 className="text-2xl font-bold">
                        {client?.name}
                    </h2>
                    <p className="text-zinc-500 text-sm">
                        {client?.contactPerson}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-zinc-300">
                        Proyectos Asociados
                    </h3>
                    <button
                        onClick={onNewProject}
                        className="text-indigo-400 text-sm hover:underline"
                    >
                        + Conectar Nuevo Proyecto
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {clientProjects.map(p => (
                        <Card
                            key={p.id}
                            className="cursor-pointer hover:border-indigo-500"
                            onClick={() => onProjectClick(p.id)}
                        >
                            <h3 className="font-bold">{p.name}</h3>
                            <p className="text-xs text-zinc-500">Click para ver tareas</p>
                        </Card>
                    ))}
                    {clientProjects.length === 0 && (
                        <div className="col-span-3 text-zinc-600 italic py-4">
                            No hay proyectos conectados aún.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
