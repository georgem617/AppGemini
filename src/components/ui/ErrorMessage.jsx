import { X } from 'lucide-react';

export default function ErrorMessage({ message, onClose }) {
    if (!message) return null;

    return (
        <div className="fixed top-4 right-4 max-w-md bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-200 shadow-lg z-50 animate-in slide-in-from-top">
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">Error</h3>
                    <p className="text-xs">{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-red-400 hover:text-red-200 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
