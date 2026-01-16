import { useState, useMemo } from 'react';
import { useBakery } from '../context/BakeryContext';
import { Plus, Trash2, ShoppingTag, BadgeDollarSign } from 'lucide-react';
import { cn } from '../utils/cn';

export default function ProductsView() {
    const { products, recipes, addProduct, deleteProduct } = useBakery();
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState({
        recipeId: '',
        margin: 30, // Default 30%
        priceOverride: '' // If they want to manually set a price
    });

    const selectedRecipe = useMemo(() => {
        return recipes.find(r => r.id === formData.recipeId);
    }, [formData.recipeId, recipes]);

    const calculatePrice = (cost, margin) => {
        // Current Logic: Markup (Cost + Margin%)
        // Alternative: Margin (Cost / (1 - Margin%))
        // Using Markup as requested "Costo + %"
        if (!cost) return 0;
        return cost * (1 + (parseFloat(margin) / 100));
    };

    const calculatedPrice = useMemo(() => {
        if (!selectedRecipe) return 0;
        // Cost per serving/unit if yield > 1?
        // Usually products are sold per unit. The recipe totalCost is for the whole batch.
        // If recipe yields 12 cupcakes, cost per cupcake is totalCost / 12.
        const costPerUnit = selectedRecipe.totalCost / selectedRecipe.yield;
        return calculatePrice(costPerUnit, formData.margin);
    }, [selectedRecipe, formData.margin]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedRecipe) return;

        addProduct({
            recipeId: formData.recipeId,
            recipeName: selectedRecipe.name,
            margin: parseFloat(formData.margin),
            finalPrice: calculatedPrice,
            costAtCreation: selectedRecipe.totalCost / selectedRecipe.yield
        });

        setFormData({ recipeId: '', margin: 30, priceOverride: '' });
        setIsAdding(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Catálogo de Productos para Venta</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn btn-primary gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Producto
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="card p-6 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="label">Seleccionar Receta Base</label>
                            <select
                                className="input mt-2"
                                value={formData.recipeId}
                                onChange={(e) => setFormData({ ...formData, recipeId: e.target.value })}
                                required
                            >
                                <option value="">-- Elegir Receta --</option>
                                {recipes.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} (Rinde {r.yield})</option>
                                ))}
                            </select>
                        </div>

                        {selectedRecipe && (
                            <>
                                <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                                    <p className="text-sm text-slate-500">Costo Total Receta</p>
                                    <p className="font-semibold text-slate-900">{formatCurrency(selectedRecipe.totalCost)}</p>

                                    <div className="mt-2 pt-2 border-t border-slate-200">
                                        <p className="text-sm text-slate-500">Costo Unitario (x1)</p>
                                        <p className="font-semibold text-slate-900">{formatCurrency(selectedRecipe.totalCost / selectedRecipe.yield)}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="label">Margen de Ganancia (%)</label>
                                        <div className="mt-2 flex items-center gap-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="200"
                                                step="5"
                                                className="flex-1"
                                                value={formData.margin}
                                                onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                className="input w-20 text-right"
                                                value={formData.margin}
                                                onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
                                            />
                                            <span className="text-slate-500">%</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-green-50 rounded-md border border-green-100 text-center">
                                        <p className="text-sm text-green-700 font-medium">Precio de Venta Sugerido</p>
                                        <p className="text-3xl font-bold text-green-800">{formatCurrency(calculatedPrice)}</p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Ganancia: {formatCurrency(calculatedPrice - (selectedRecipe.totalCost / selectedRecipe.yield))} por unidad
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary">Cancelar</button>
                        <button type="submit" disabled={!selectedRecipe} className="btn btn-primary">Guardar Producto</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map(product => (
                    <div key={product.id} className="card p-0 overflow-hidden group">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <ShoppingTag className="h-4 w-4 text-rose-500" />
                                    {product.recipeName}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Margen: {product.margin}%</p>
                            </div>
                            <button
                                onClick={() => deleteProduct(product.id)}
                                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Costo Base:</span>
                                <span className="font-medium text-slate-700">{formatCurrency(product.costAtCreation)}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold text-green-700 mt-2 pt-2 border-t border-slate-100">
                                <span>Precio Venta:</span>
                                <span>{formatCurrency(product.finalPrice)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
