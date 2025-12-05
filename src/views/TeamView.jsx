import React from 'react';
import Card from '../components/ui/Card';

export default function TeamView({ teamMembers, onNewUser }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Equipo</h2>
                <button
                    onClick={onNewUser}
                    className="text-indigo-400 text-sm"
                >
                    + Nuevo
                </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {teamMembers.map(m => (
                    <Card key={m.id}>
                        <h3 className="font-bold">{m.name}</h3>
                        <p className="text-sm text-zinc-500">{m.role}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}
