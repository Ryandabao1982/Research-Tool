import React, { memo } from 'react';
import { motion } from 'framer-motion';

export interface SpacedRepetitionWidgetProps {
    className?: string;
}

export const SpacedRepetitionWidget: React.FC<SpacedRepetitionWidgetProps> = ({ className = '' }) => {
    const items = [
        { id: 1, title: 'React Hooks Deep Dive', nextReview: 'Today', difficulty: 'Hard' },
        { id: 2, title: 'TypeScript Generics', nextReview: 'Tomorrow', difficulty: 'Medium' },
        { id: 3, title: 'CSS Grid Layout', nextReview: 'In 3 days', difficulty: 'Easy' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-sans font-bold text-neutral-800 text-sm">Spaced Repetition</h3>
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded font-mono">
                    Learner
                </span>
            </div>

            <div className="space-y-2 mb-3">
                {items.map((item) => (
                    <div 
                        key={item.id}
                        className="flex items-center gap-2 p-2 bg-neutral-50 rounded border border-neutral-100 hover:border-green-300 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="font-sans text-sm text-neutral-800 truncate">
                                {item.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-neutral-500">
                                    Next: {item.nextReview}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    item.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                                    item.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {item.difficulty}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <button className="flex-1 py-2 bg-green-600 text-white text-sm font-sans font-medium rounded hover:bg-green-700 transition-colors">
                    Review Now
                </button>
                <button className="flex-1 py-2 bg-white text-green-700 border border-green-300 text-sm font-sans font-medium rounded hover:bg-green-50 transition-colors">
                    Add Item
                </button>
            </div>
        </motion.div>
    );
};

export default memo(SpacedRepetitionWidget);
