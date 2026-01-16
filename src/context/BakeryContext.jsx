import { createContext, useContext, useState, useEffect } from 'react';

const BakeryContext = createContext();

export function useBakery() {
    return useContext(BakeryContext);
}

export function BakeryProvider({ children }) {
    // Load initial state from localStorage or use defaults
    const [suppliers, setSuppliers] = useState(() => {
        const saved = localStorage.getItem('bakery_suppliers');
        return saved ? JSON.parse(saved) : [];
    });

    const [ingredients, setIngredients] = useState(() => {
        const saved = localStorage.getItem('bakery_ingredients');
        return saved ? JSON.parse(saved) : [];
    });

    const [recipes, setRecipes] = useState(() => {
        const saved = localStorage.getItem('bakery_recipes');
        return saved ? JSON.parse(saved) : [];
    });

    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('bakery_products');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('bakery_suppliers', JSON.stringify(suppliers));
    }, [suppliers]);

    useEffect(() => {
        localStorage.setItem('bakery_ingredients', JSON.stringify(ingredients));
    }, [ingredients]);

    useEffect(() => {
        localStorage.setItem('bakery_recipes', JSON.stringify(recipes));
    }, [recipes]);

    useEffect(() => {
        localStorage.setItem('bakery_products', JSON.stringify(products));
    }, [products]);

    // Actions
    const addSupplier = (supplier) => {
        setSuppliers([...suppliers, { ...supplier, id: crypto.randomUUID() }]);
    };

    const deleteSupplier = (id) => {
        setSuppliers(suppliers.filter(s => s.id !== id));
    };

    const addIngredient = (ingredient) => {
        setIngredients([...ingredients, { ...ingredient, id: crypto.randomUUID() }]);
    };

    const deleteIngredient = (id) => {
        setIngredients(ingredients.filter(i => i.id !== id));
    };

    const addRecipe = (recipe) => {
        setRecipes([...recipes, { ...recipe, id: crypto.randomUUID() }]);
    };

    const deleteRecipe = (id) => {
        setRecipes(recipes.filter(r => r.id !== id));
    };

    const addProduct = (product) => {
        setProducts([...products, { ...product, id: crypto.randomUUID() }]);
    };

    const deleteProduct = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const value = {
        suppliers, addSupplier, deleteSupplier,
        ingredients, addIngredient, deleteIngredient,
        recipes, addRecipe, deleteRecipe,
        products, addProduct, deleteProduct,
    };

    return (
        <BakeryContext.Provider value={value}>
            {children}
        </BakeryContext.Provider>
    );
}
