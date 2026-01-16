import { useState } from 'react';
import { BakeryProvider } from './context/BakeryContext';
import Layout from './components/Layout';
import SuppliersView from './views/SuppliersView';
import IngredientsView from './views/IngredientsView';
import RecipesView from './views/RecipesView';
import ProductsView from './views/ProductsView';
import { Store, Wheat, ChefHat, ShoppingTag } from 'lucide-react';
import { cn } from './utils/cn';

function App() {
  const [activeTab, setActiveTab] = useState('suppliers');

  const tabs = [
    { id: 'suppliers', label: 'Proveedores', icon: Store, component: SuppliersView },
    { id: 'ingredients', label: 'Ingredientes', icon: Wheat, component: IngredientsView },
    { id: 'recipes', label: 'Recetas', icon: ChefHat, component: RecipesView },
    { id: 'products', label: 'Productos', icon: ShoppingTag, component: ProductsView },
  ];

  return (
    <BakeryProvider>
      <Layout>
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    activeTab === tab.id
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                    'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-colors'
                  )}
                >
                  <Icon
                    className={cn(
                      activeTab === tab.id ? 'text-rose-500' : 'text-slate-400 group-hover:text-slate-500',
                      '-ml-0.5 mr-2 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {tabs.map((tab) => (
            <div key={tab.id} className={cn(activeTab === tab.id ? 'block' : 'hidden')}>
              <tab.component />
            </div>
          ))}
        </div>
      </Layout>
    </BakeryProvider>
  );
}

export default App;