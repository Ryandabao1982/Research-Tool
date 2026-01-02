import React from 'react';
import { motion } from 'framer-motion';

export interface TasksPaddingWidgetProps {
    className?: string;
}

/**
 * Manager Widget: Tasks Padding
 * 
 * Shows task management with padding analysis for workload balancing
 */
export const TasksPaddingWidget: React.FC<TasksPaddingWidgetProps> = ({ className = '' }) => {
    // Mock data for demonstration
    const tasks = [
        { id: 1, title: 'Q4 Budget Review', priority: 'high', due: 'Tomorrow' },
        { id: 2, title: 'Team Performance Analysis', priority: 'medium', due: 'This Week' },
        { id: 3, title: 'Project Timeline Update', priority: 'low', due: 'Next Week' },
    ];

    const paddingAnalysis = {
        totalPadding: 48,
        optimalRange: '40-60 hours',
        status: 'balanced'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-sans font-bold text-neutral-800 text-sm">Tasks Padding</h3>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-mono">
                    Manager
                </span>
            </div>

            {/* Padding Analysis */}
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-100">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-600">Workload Padding</span>
                    <span className="font-mono font-bold text-blue-700">
                        {paddingAnalysis.totalPadding}h
                    </span>
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                    Optimal: {paddingAnalysis.optimalRange}
                </div>
                <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: '80%' }}
                    />
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {tasks.map((task) => (
                    <div 
                        key={task.id}
                        className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-100 hover:border-blue-300 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="font-sans text-sm text-neutral-800 truncate">
                                {task.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {task.priority}
                                </span>
                                <span className="text-xs text-neutral-500">{task.due}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            <button className="w-full mt-3 py-2 bg-blue-600 text-white text-sm font-sans font-medium rounded hover:bg-blue-700 transition-colors">
                Manage Tasks
            </button>
        </motion.div>
    );
};

export default TasksPaddingWidget;
