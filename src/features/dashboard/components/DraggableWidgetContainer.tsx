import React, { useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DraggableWidgetContainerProps {
    widgetId: string;
    children: React.ReactNode;
    onDragStart: (widgetId: string) => void;
    onDragEnd: (widgetId: string, targetIndex: number) => void;
    index: number;
    isDragging?: boolean;
    className?: string;
}

/**
 * Draggable wrapper for dashboard widgets
 * Implements drag-and-drop functionality for layout management
 */
export const DraggableWidgetContainer: React.FC<DraggableWidgetContainerProps> = ({
    widgetId,
    children,
    onDragStart,
    onDragEnd,
    index,
    isDragging = false,
    className = ''
}) => {
    const [isOver, setIsOver] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', widgetId);
        onDragStart(widgetId);
        
        // Visual feedback
        if (containerRef.current) {
            containerRef.current.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (containerRef.current) {
            containerRef.current.style.opacity = '1';
        }
        setIsOver(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        
        const draggedWidgetId = e.dataTransfer.getData('text/plain');
        if (draggedWidgetId && draggedWidgetId !== widgetId) {
            onDragEnd(draggedWidgetId, index);
        }
    };

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
                opacity: 1, 
                scale: 1,
                boxShadow: isOver ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : '0 0 0 0px rgba(59, 130, 246, 0)'
            }}
            whileHover={{ scale: 1.02 }}
            className={`
                relative
                ${isDragging ? 'opacity-50' : ''}
                ${isOver ? 'border-2 border-blue-400 bg-blue-50' : ''}
                ${className}
            `}
            style={{ cursor: 'grab' }}
        >
            {/* Drag wrapper with native events */}
            <div
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="h-full"
            >
                {/* Drag Handle */}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-neutral-800 text-white text-xs px-2 py-1 rounded font-mono">
                        ⋮⋮
                    </div>
                </div>

                {/* Widget Content */}
                <div className="group">
                    {children}
                </div>

                {/* Drop Indicator */}
                <AnimatePresence>
                    {isOver && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 4 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="absolute -top-2 left-0 right-0 bg-blue-500 rounded-full"
                        />
                    )}
                </AnimatePresence>

                {/* Index Badge */}
                <div className="absolute top-2 left-2 bg-neutral-800 text-white text-xs px-1.5 py-0.5 rounded font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {index + 1}
                </div>
            </div>
        </motion.div>
    );
};

export default memo(DraggableWidgetContainer);
