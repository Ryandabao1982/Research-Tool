import React from 'react';
import { motion } from 'framer-motion';

export interface SpacedRepetitionWidgetProps {
    className?: string;
}

/**
 * Learner Widget: Spaced Repetition Queue
 * 
 * Shows learning items due for review using spaced repetition
 */
export const SpacedRepetitionWidget: React.FC<SpacedRepetitionWidgetProps> = ({ className = '' }) => {
    // Mock data for demonstration
    const queue = [
        { id: 1, item: 'Neural Networks Basics', interval: '2 days', difficulty: 'medium' },
        { id: 2, item: 'Attention Mechanisms', interval: '1 day', difficulty: 'hard' },
        { id: 3, item: 'Transformer Architecture', interval: '4 hours', difficulty: 'easy' },
    ];

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'hard': return 'bg-purple-100 text-purple-700';
            case 'medium': return 'bg-blue-100 text-blue-700';
            default: return 'bg-green-100 text-green-700';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-sans font-bold text-neutral-800 text-sm">Spaced Repetition</h3>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded font-mono">
                    Learner
                </span>
            </div>

            {/* Queue Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-emerald-50 p-2 rounded border border-emerald-100 text-center">
                    <div className="font-mono font-bold text-emerald-700 text-lg">{queue.length}</div>
                    <div className="text-xs text-emerald-600">Due Today</div>
                </div>
                <div className="bg-blue-50 p-2 rounded border border-blue-100 text-center">
                    <div className="font-mono font-bold text-blue-700 text-lg">12</div>
                    <div className="text-xs text-blue-600">In Queue</div>
                </div>
            </div>

            {/* Review Queue */}
            <div className="space-y-2 mb-3">
                {queue.map((item) => (
                    <div 
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-100 hover:border-emerald-300 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="font-sans text-sm text-neutral-800 truncate">
                                {item.item}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${getDifficultyColor(item.difficulty)}`}>
                                    {item.difficulty}
                                </span>
                                <span className="text-xs text-neutral-500">Due: {item.interval}</span>
                            </div>
                        </div>
                        <button className="ml-2 px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 transition-colors">
                            Review
                        </button>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
                <div className="flex justify-between text-xs text-neutral-600 mb-1">
                    <span>Today's Progress</span>
                    <span className="font-mono font-bold text-emerald-700">3/12</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '25%' }} />
                </div>
            </div>

            {/* Action Button */}
            <button className="w-full mt-2 py-2 bg-emerald-600 text-white text-sm font-sans font-medium rounded hover:bg-emerald-700 transition-colors">
                Start Review Session
            </button>
        </motion.div>
    );
};

export default SpacedRepetitionWidget;
