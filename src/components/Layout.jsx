import { useState } from 'react';
import { Store, Workflow, ChefHat, ShoppingTag } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Layout({ children }) {
    // We'll manage the active tab in the parent component (App.jsx) usually, 
    // but if we want the layout to control the view rendering passed as children,
    // it might be better to lift the state up. 
    // For this pattern, Layout will receive the current tab and the setter.
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ChefHat className="h-8 w-8 text-rose-600" />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">
                                SweetQuote
                            </h1>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
