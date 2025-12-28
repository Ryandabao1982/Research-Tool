import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder as FolderIcon, FolderOpen, MoreVertical, Plus } from 'lucide-react';
import { Folder } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FolderTreeProps {
    folders: Folder[];
    selectedId?: string;
    onSelect: (id: string) => void;
    onCreateSubfolder: (parentId: string) => void;
}

export function FolderTree({ folders, selectedId, onSelect, onCreateSubfolder }: FolderTreeProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'f1': true });

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderFolder = (folder: Folder, level = 0) => {
        const isExpanded = expanded[folder.id];
        const isSelected = selectedId === folder.id;
        const children = folders.filter(f => f.parent_id === folder.id);
        const hasChildren = children.length > 0;

        return (
            <div key={folder.id} className="space-y-0.5">
                <div
                    onClick={() => onSelect(folder.id)}
                    className={cn(
                        "group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden",
                        isSelected
                            ? "bg-vibe-purple/10 text-vibe-purple shadow-[inset_0_0_20px_rgba(168,85,247,0.05)] border border-vibe-purple/20"
                            : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
                    )}
                    style={{ paddingLeft: `${(level * 16) + 12}px` }}
                >
                    {/* Animated selection bar */}
                    {isSelected && (
                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-vibe-purple rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    )}

                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span
                            onClick={(e) => toggleExpand(folder.id, e)}
                            className={cn(
                                "p-0.5 rounded-md hover:bg-white/10 transition-colors",
                                !hasChildren && "opacity-0 pointer-events-none"
                            )}
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>

                        {isExpanded ? (
                            <FolderOpen size={16} className={cn(isSelected ? "text-vibe-purple" : "text-white/20")} />
                        ) : (
                            <FolderIcon size={16} className={cn(isSelected ? "text-vibe-purple" : "text-white/20")} />
                        )}

                        <span className="text-sm font-bold truncate tracking-tight">{folder.name}</span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onCreateSubfolder(folder.id); }}
                            className="p-1 hover:bg-white/10 rounded-md text-white/40 hover:text-white"
                        >
                            <Plus size={14} />
                        </button>
                        <button className="p-1 hover:bg-white/10 rounded-md text-white/40 hover:text-white">
                            <MoreVertical size={14} />
                        </button>
                    </div>
                </div>

                {isExpanded && children.map(child => renderFolder(child, level + 1))}
            </div>
        );
    };

    // Render root level folders (no parent_id)
    const rootFolders = folders.filter(f => !f.parent_id);

    return (
        <div className="space-y-1 py-2">
            {rootFolders.map(folder => renderFolder(folder))}
        </div>
    );
}
