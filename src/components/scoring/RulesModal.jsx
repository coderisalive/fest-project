import React from 'react';

export default function RulesModal({ sportId, rules, isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-card max-w-lg w-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-black text-white flex items-center uppercase italic tracking-tighter">
                        <span className="mr-3 text-primary-500">📜</span>
                        {rules?.name || sportId} Rules
                    </h2>
                </div>

                <div className="space-y-4">
                    {rules?.rules?.map((rule, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-primary-500 font-bold"># {index + 1}</span>
                            <p className="text-gray-300 text-sm font-medium italic">{rule}</p>
                        </div>
                    ))}
                    {!rules && (
                        <div className="text-center py-8 text-gray-500 italic">
                            No detailed rules found for this sport category.
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full btn-secondary py-3"
                    >
                        Understood
                    </button>
                </div>
            </div>
        </div>
    );
}
