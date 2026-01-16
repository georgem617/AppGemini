import { useState, useMemo } from 'react';
import { useBakery } from '../context/BakeryContext';
import { Plus, Trash2, Package } from 'lucide-react';
import { cn } from '../utils/cn';
import { ALL_UNITS, WEIGHT_UNITS, VOLUME_UNITS } from '../utils/conversions';

export default function IngredientsView() {
    const { ingredients, suppliers, addIngredient, deleteIngredient } = useBakery();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        supplierId: '',
        cost: '',
        quantity: '',
        unit: 'kg', // Default
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.cost || !formData.quantity) return;

        addIngredient({
            ...formData,
            cost: parseFloat(formData.cost),
            quantity: parseFloat(formData.quantity)
        });

        setFormData({
            name: '',
            supplierId: '',
            cost: '',
            quantity: '',
            unit: 'kg',
        });
        setIsAdding(false);
    };

    const getSupplierName = (id) => {
        const s = suppliers.find(s => s.id === id);
        return s ? s.name : 'Desconocido/Sin Asignar';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Inventario de Ingredientes</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn btn-primary gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Ingrediente
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="card p-6 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label htmlFor="name" className="label">Nombre del Ingrediente *</label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Harina de Trigo"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="supplier" className="label">Proveedor</label>
                            <div className="mt-2">
                                <select
                                    id="supplier"
                                    name="supplier"
                                    className="input"
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Empty column for layout on large screens if needed, or just let it flow */}

                        <div className="w-full h-px sm:col-span-2 lg:col-span-3 bg-slate-100 my-2" />

                        <div>
                            <label htmlFor="cost" className="label">Costo de Compra ($) *</label>
                            <div className="mt-2 relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="cost"
                                    id="cost"
                                    min="0"
                                    step="0.01"
                                    required
                                    className="input pl-7"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="quantity" className="label">Cantidad del Paquete *</label>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    name="quantity"
                                    id="quantity"
                                    min="0"
                                    step="0.01"
                                    required
                                    className="input"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    placeholder="Ej. 1, 5, 250"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="unit" className="label">Unidad de Compra *</label>
                            <div className="mt-2">
                                <select
                                    id="unit"
                                    name="unit"
                                    className="input"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    <optgroup label="Peso">
                                        {WEIGHT_UNITS.map(u => (
                                            <option key={u.value} value={u.value}>{u.label}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Volumen">
                                        {VOLUME_UNITS.map(u => (
                                            <option key={u.value} value={u.value}>{u.label}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Guardar Ingrediente
                        </button>
                    </div>
                </form>
            )}

            {ingredients.length === 0 ? (
                <div className="text-center py-12 card border-dashed">
                    <p className="text-slate-500">No hay ingredientes registrados. Comienza agregando tus insumos.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 bg-white">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ingrediente</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paquete</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Costo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Proveedor</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {ingredients.map((item) => (
                                <tr key={item.id} className="group hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Package className="h-5 w-5 text-slate-400 mr-3" />
                                            <span className="font-medium text-slate-900">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {item.quantity} {item.unit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                                        {formatCurrency(item.cost)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {getSupplierName(item.supplierId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => deleteIngredient(item.id)}
                                            className="text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
