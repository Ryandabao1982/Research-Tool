import React from 'react';
import { motion } from 'framer-motion';

export interface ProjectDeadlinesWidgetProps {
    className?: string;
}

/**
 * Manager Widget: Project Deadlines
 * 
 * Shows upcoming project deadlines and milestones
 */
export const ProjectDeadlinesWidget: React.FC<ProjectDeadlinesWidgetProps> = ({ className = '' }) => {
    // Mock data for demonstration
    const deadlines = [
        { id: 1, project: 'Q4 Product Launch', deadline: '2024-12-15', daysLeft: 3, status: 'critical' },
        { id: 2, project: 'Team Onboarding', deadline: '2024-12-20', daysLeft: 8, status: 'warning' },
        { id: 3, project: 'Annual Review', deadline: '2024-12-28', daysLeft: 16, status: 'normal' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'critical': return 'bg-red-50 text-red-700 border-red-200';
            case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default: return 'bg-green-50 text-green-700 border-green-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-sans font-bold text-neutral-800 text-sm">Project Deadlines</h3>
                <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded font-mono">
                    Manager
                </span>
            </div>

            {/* Deadline List */}
            <div className="space-y-2">
                {deadlines.map((deadline) => (
                    <div 
                        key={deadline.id}
                        className={`p-3 rounded border ${getStatusColor(deadline.status).split(' ')[2]} ${getStatusColor(deadline.status)} transition-all hover:scale-[1.02]`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="font-sans font-medium text-sm flex-1">
                                {deadline.project}
                            </div>
                            <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-white/50 rounded">
                                {deadline.daysLeft}d
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="opacity-75">Due: {deadline.deadline}</span>
                            <span className="font-medium capitalize">
                                {deadline.status === 'critical' ? 'Urgent' : 
                                 deadline.status === 'warning' ? 'Soon' : 'On Track'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-3 pt-3 border-t border-neutral-100">
                <div className="flex justify-between items-center text-xs text-neutral-600">
                    <span>Total Projects</span>
                    <span className="font-mono font-bold text-neutral-800">{deadlines.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-600 mt-1">
                    <span>At Risk</span>
                    <span className="font-mono font-bold text-red-600">
                        {deadlines.filter(d => d.status === 'critical').length}
                    </span>
                </div>
            </div>

            {/* Action Button */}
            <button className="w-full mt-3 py-2 bg-orange-600 text-white text-sm font-sans font-medium rounded hover:bg-orange-700 transition-colors">
                View Timeline
            </button>
        </motion.div>
    );
};

export default ProjectDeadlinesWidget;
