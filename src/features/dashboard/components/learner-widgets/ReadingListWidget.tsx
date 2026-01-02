import React, { memo } from 'react';
import { motion } from 'framer-motion';

export interface ReadingListWidgetProps {
    className?: string;
}

export const ReadingListWidget: React.FC<ReadingListWidgetProps> = ({ className = '' }) => {
    const articles = [
        { id: 1, title: 'Advanced TypeScript Patterns', source: 'Dev.to', time: '8 min' },
        { id: 2, title: 'React Server Components', source: 'React Docs', time: '12 min' },
        { id: 3, title: 'CSS Architecture', source: 'Smashing Mag', time: '6 min' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-sans font-bold text-neutral-800 text-sm">Reading List</h3>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-mono">
                    Learner
                </span>
            </div>

            <div className="space-y-2">
                {articles.map((article) => (
                    <div 
                        key={article.id}
                        className="flex items-center gap-2 p-2 hover:bg-neutral-50 rounded transition-colors cursor-pointer"
                    >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                            {article.source.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-sans text-sm text-neutral-800 truncate">
                                {article.title}
                            </div>
                            <div className="text-xs text-neutral-500">
                                {article.source} • {article.time}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-3 py-2 bg-blue-600 text-white text-sm font-sans font-medium rounded hover:bg-blue-700 transition-colors">
                Add Article
            </button>
        </motion.div>
    );
};

export default memo(ReadingListWidget);
