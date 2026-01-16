import { useState } from 'react';
import { useBakery } from '../context/BakeryContext';
import { Plus, Trash2, Phone, FileText } from 'lucide-react';
import { cn } from '../utils/cn';

export default function SuppliersView() {
    const { suppliers, addSupplier, deleteSupplier } = useBakery();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact: '', notes: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) return;
        addSupplier(formData);
        setFormData({ name: '', contact: '', notes: '' });
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Directorio de Proveedores</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn btn-primary gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Proveedor
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="card p-6 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="label">Nombre del Proveedor *</label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="contact" className="label">Contacto (Tel/Email)</label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="contact"
                                    id="contact"
                                    className="input"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="notes" className="label">Notas</label>
                            <div className="mt-2">
                                <textarea
                                    name="notes"
                                    id="notes"
                                    rows={3}
                                    className="input"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Guardar Proveedor
                        </button>
                    </div>
                </form>
            )}

            {suppliers.length === 0 ? (
                <div className="text-center py-12 card border-dashed">
                    <p className="text-slate-500">No hay proveedores registrados aún.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {suppliers.map((supplier) => (
                        <div key={supplier.id} className="card p-4 relative group hover:border-rose-200 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-slate-900">{supplier.name}</h3>
                                    {supplier.contact && (
                                        <div className="mt-1 flex items-center text-sm text-slate-500">
                                            <Phone className="h-3 w-3 mr-1" />
                                            {supplier.contact}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteSupplier(supplier.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            {supplier.notes && (
                                <div className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-start gap-1">
                                    <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <p className="line-clamp-2">{supplier.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
