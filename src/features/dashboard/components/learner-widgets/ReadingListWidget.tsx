import React from 'react';
import { motion } from 'framer-motion';

export interface ReadingListWidgetProps {
    className?: string;
}

/**
 * Learner Widget: Reading List
 * 
 * Shows articles and notes queued for reading
 */
export const ReadingListWidget: React.FC<ReadingListWidgetProps> = ({ className = '' }) => {
    // Mock data for demonstration
    const readingList = [
        { id: 1, title: 'Introduction to RAG Systems', source: 'Medium', time: '15 min', priority: 'high' },
        { id: 2, title: 'Prompt Engineering Best Practices', source: 'Blog', time: '8 min', priority: 'medium' },
        { id: 3, title: 'Vector Databases Explained', source: 'ArXiv', time: '12 min', priority: 'low' },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
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
                <h3 className="font-sans font-bold text-neutral-800 text-sm">Reading List</h3>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded font-mono">
                    Learner
                </span>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-2 mb-3">
                <div className="flex-1 bg-blue-50 p-2 rounded border border-blue-100 text-center">
                    <div className="font-mono font-bold text-blue-700">{readingList.length}</div>
                    <div className="text-xs text-blue-600">To Read</div>
                </div>
                <div className="flex-1 bg-purple-50 p-2 rounded border border-purple-100 text-center">
                    <div className="font-mono font-bold text-purple-700">45m</div>
                    <div className="text-xs text-purple-600">Est. Time</div>
                </div>
            </div>

            {/* Reading Items */}
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {readingList.map((item) => (
                    <div 
                        key={item.id}
                        className="p-3 bg-neutral-50 rounded border border-neutral-100 hover:border-blue-300 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="font-sans text-sm font-medium text-neutral-800 flex-1">
                                {item.title}
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(item.priority)} ml-2`}>
                                {item.priority}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-neutral-600">
                            <span>{item.source}</span>
                            <span className="font-mono">{item.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reading Progress */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-neutral-600 mb-1">
                    <span>Weekly Goal</span>
                    <span className="font-mono font-bold text-blue-700">3/5 articles</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '60%' }} />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
                <button className="py-2 bg-emerald-600 text-white text-sm font-sans font-medium rounded hover:bg-emerald-700 transition-colors">
                    Read Next
                </button>
                <button className="py-2 bg-neutral-200 text-neutral-800 text-sm font-sans font-medium rounded hover:bg-neutral-300 transition-colors">
                    Add Article
                </button>
            </div>
        </motion.div>
    );
};

export default ReadingListWidget;
