import { useState, useMemo } from 'react';
import { useBakery } from '../context/BakeryContext';
import { Plus, Trash2, ChefHat, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils/cn';
import { ALL_UNITS, WEIGHT_UNITS, VOLUME_UNITS, convertUnit } from '../utils/conversions';

export default function RecipesView() {
    const { recipes, ingredients, addRecipe, deleteRecipe } = useBakery();
    const [isAdding, setIsAdding] = useState(false);
    const [expandedRecipe, setExpandedRecipe] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        yield: 1, // How many units/servings does this recipe make?
        items: [] // { ingredientId, quantity, unit }
    });

    const [currentItem, setCurrentItem] = useState({
        ingredientId: '',
        quantity: '',
        unit: ''
    });

    // Calculate cost of the recipe being created/edited
    const currentRecipeCost = useMemo(() => {
        return formData.items.reduce((total, item) => {
            const ingredient = ingredients.find(i => i.id === item.ingredientId);
            if (!ingredient) return total;

            const pricePerPurchaseUnit = ingredient.cost / ingredient.quantity;
            const amountInPurchaseUnit = convertUnit(item.quantity, item.unit, ingredient.unit);

            return total + (amountInPurchaseUnit * pricePerPurchaseUnit);
        }, 0);
    }, [formData.items, ingredients]);

    const handleAddItem = () => {
        if (!currentItem.ingredientId || !currentItem.quantity || !currentItem.unit) return;
        setFormData({
            ...formData,
            items: [...formData.items, { ...currentItem, quantity: parseFloat(currentItem.quantity) }]
        });
        setCurrentItem({ ingredientId: '', quantity: '', unit: '' });
    };

    const handleRemoveItem = (index) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || formData.items.length === 0) return;

        addRecipe({
            ...formData,
            totalCost: currentRecipeCost
        });

        setFormData({ name: '', yield: 1, items: [] });
        setIsAdding(false);
    };

    const getIngredientLines = (recipe) => {
        return recipe.items.map(item => {
            const ing = ingredients.find(i => i.id === item.ingredientId);
            return ing ? `${item.quantity} ${item.unit} de ${ing.name}` : 'Ingrediente desconocido';
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    const getCompatibleUnits = (ingredientId) => {
        const ing = ingredients.find(i => i.id === ingredientId);
        if (!ing) return [];

        const isWeight = WEIGHT_UNITS.some(u => u.value === ing.unit);
        if (isWeight) return WEIGHT_UNITS;

        const isVolume = VOLUME_UNITS.some(u => u.value === ing.unit);
        if (isVolume) return VOLUME_UNITS;

        return [{ value: ing.unit, label: ing.unit }]; // Fallback for special units like 'pza'
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Recetario</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn btn-primary gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Receta
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="card p-6 animate-in fade-in slide-in-from-top-4">
                    {/* Header inputs */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="label">Nombre de la Receta *</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                className="input mt-2"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej. Pastel de Chocolate"
                            />
                        </div>
                        <div>
                            <label htmlFor="yield" className="label">Rendimiento (Porciones/Unidades)</label>
                            <input
                                type="number"
                                name="yield"
                                id="yield"
                                min="1"
                                required
                                className="input mt-2"
                                value={formData.yield}
                                onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="my-6 border-t border-slate-100" />

                    {/* Ingredient Adder */}
                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-3">Agregar Ingredientes</h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
                            <div className="sm:col-span-4">
                                <label className="text-xs text-slate-500 mb-1 block">Ingrediente</label>
                                <select
                                    className="input"
                                    value={currentItem.ingredientId}
                                    onChange={(e) => setCurrentItem({ ...currentItem, ingredientId: e.target.value, unit: '' })}
                                >
                                    <option value="">Seleccionar</option>
                                    {ingredients.map(i => (
                                        <option key={i.id} value={i.id}>{i.name} ({i.quantity} {i.unit} - {formatCurrency(i.cost)})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Cantidad</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="0"
                                    value={currentItem.quantity}
                                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label className="text-xs text-slate-500 mb-1 block">Unidad</label>
                                <select
                                    className="input"
                                    value={currentItem.unit}
                                    onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
                                    disabled={!currentItem.ingredientId}
                                >
                                    <option value="">Unidad</option>
                                    {getCompatibleUnits(currentItem.ingredientId).map(u => (
                                        <option key={u.value} value={u.value}>{u.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-3">
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    disabled={!currentItem.ingredientId || !currentItem.quantity || !currentItem.unit}
                                    className="btn btn-secondary w-full"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Ingredient List Preview */}
                    <div className="mt-4">
                        {formData.items.length > 0 && (
                            <ul className="divide-y divide-slate-100 border border-slate-100 rounded-md bg-white">
                                {formData.items.map((item, idx) => {
                                    const ing = ingredients.find(i => i.id === item.ingredientId);
                                    return (
                                        <li key={idx} className="p-3 flex justify-between items-center text-sm">
                                            <span>
                                                <span className="font-medium text-slate-900">{item.quantity} {item.unit}</span>
                                                <span className="text-slate-500 mx-1">de</span>
                                                <span>{ing?.name}</span>
                                            </span>
                                            <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="mt-6 flex justify-between items-center p-4 bg-rose-50 rounded-lg border border-rose-100">
                        <div>
                            <p className="text-sm text-rose-600 font-medium">Costo Total Estimado</p>
                            <p className="text-2xl font-bold text-rose-700">{formatCurrency(currentRecipeCost)}</p>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary">Cancelar</button>
                            <button type="submit" className="btn btn-primary">Guardar Receta</button>
                        </div>
                    </div>
                </form>
            )}

            {/* Recipe List */}
            <div className="grid grid-cols-1 gap-4">
                {recipes.map((recipe) => (
                    <div key={recipe.id} className="card overflow-hidden">
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                                    <ChefHat className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-900">{recipe.name}</h3>
                                    <p className="text-sm text-slate-500">{recipe.yield} porciones</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Costo Total</p>
                                    <p className="font-bold text-slate-900">{formatCurrency(recipe.totalCost)}</p>
                                </div>
                                {expandedRecipe === recipe.id ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                            </div>
                        </div>

                        {expandedRecipe === recipe.id && (
                            <div className="bg-slate-50 p-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                                <h4 className="text-sm font-medium text-slate-900 mb-2">Ingredientes:</h4>
                                <ul className="list-disc list-inside text-sm text-slate-600 mb-4 space-y-1">
                                    {getIngredientLines(recipe).map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                                <div className="flex justify-end">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }}
                                        className="text-red-600 text-sm hover:underline flex items-center gap-1"
                                    >
                                        <Trash2 className="h-3 w-3" /> Eliminar Receta
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
