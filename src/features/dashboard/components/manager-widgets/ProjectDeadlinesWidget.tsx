import React, { memo } from 'react';
import { motion } from 'framer-motion';

export interface ProjectDeadlinesWidgetProps {
    className?: string;
}

export const ProjectDeadlinesWidget: React.FC<ProjectDeadlinesWidgetProps> = ({ className = '' }) => {
    const projects = [
        { id: 1, name: 'Q4 Marketing Campaign', deadline: '2024-12-15', progress: 75 },
        { id: 2, name: 'Product Launch v2', deadline: '2024-12-20', progress: 45 },
        { id: 3, name: 'Team Onboarding', deadline: '2024-12-28', progress: 20 },
    ];

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

            <div className="space-y-3">
                {projects.map((project) => (
                    <div key={project.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-neutral-700">
                                {project.name}
                            </span>
                            <span className="text-xs text-neutral-500">
                                {project.deadline}
                            </span>
                        </div>
                        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-orange-500 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-3 py-2 bg-orange-500 text-white text-sm font-sans font-medium rounded hover:bg-orange-600 transition-colors">
                View All Projects
            </button>
        </motion.div>
    );
};

export default memo(ProjectDeadlinesWidget);
