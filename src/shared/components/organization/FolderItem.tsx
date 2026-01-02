import React, { useState } from 'react';
import {
    Folder as FolderIcon,
    ChevronRight,
    ChevronDown,
    Plus,
    FileText
} from 'lucide-react';
import { Folder } from '../../services/organizationService';
import { cn } from '../../utils';
import { useNotesStore } from '../../hooks/useNotesStore';

interface FolderItemProps {
    folder: Folder;
    allFolders: Folder[];
    depth?: number;
    onAddSubfolder: (parentId: string) => void;
    onSelect: (folderId: string) => void;
    selectedId: string | null;
}

export const FolderItem: React.FC<FolderItemProps> = ({
    folder,
    allFolders,
    depth = 0,
    onAddSubfolder,
    onSelect,
    selectedId
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { notes, setSelectedNoteId, selectedNoteId } = useNotesStore();

    const children = allFolders.filter(f => f.parent_id === folder.id);
    const folderNotes = notes.filter(n => n.folderId === folder.id);
    const isSelected = selectedId === folder.id;

    const hasContent = children.length > 0 || folderNotes.length > 0;

    return (
        <div className="select-none">
            <div
                className={cn(
                    "group flex items-center gap-2 px-3 py-1.5 border rounded-none cursor-pointer transition-colors",
                    isSelected 
                        ? "bg-neutral-100 text-neutral-900 border-neutral-300" 
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-neutral-200"
                )}
                style={{ paddingLeft: `${(depth * 12) + 12} px` }}
                onClick={() => {
                    onSelect(folder.id);
                    setIsExpanded(!isExpanded);
                }}
            >
                <span className="w-4 h-4 flex items-center justify-center">
                    {hasContent ? (
                        isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                    ) : null}
                </span>
                <FolderIcon className={cn("w-4 h-4", isSelected ? "text-primary" : "text-neutral-400")} />
                <span className="font-sans text-xs font-medium truncate">{folder.name}</span>

                <button
                    className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 border rounded-none transition-opacity border-transparent"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddSubfolder(folder.id);
                    }}
                >
                    <Plus className="w-3 h-3 text-neutral-500" />
                </button>
            </div>

            {isExpanded && (
                <div className="mt-0.5">
                    {/* Subfolders */}
                    {children.map(child => (
                        <FolderItem
                            key={child.id}
                            folder={child}
                            allFolders={allFolders}
                            depth={depth + 1}
                            onAddSubfolder={onAddSubfolder}
                            onSelect={onSelect}
                            selectedId={selectedId}
                        />
                    ))}

                    {/* Notes */}
                    {folderNotes.map(note => (
                        <div
                            key={note.id}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 border rounded-none cursor-pointer transition-colors",
                                selectedNoteId === note.id 
                                    ? "bg-neutral-50 text-neutral-900 border-neutral-300" 
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 border-neutral-200"
                            )}
                            style={{ paddingLeft: `${((depth + 1) * 12) + 28} px` }}
                            onClick={() => setSelectedNoteId(note.id)}
                        >
                            <FileText className="w-3 h-3 text-neutral-400" />
                            <span className="font-mono text-[11px] truncate">{note.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};