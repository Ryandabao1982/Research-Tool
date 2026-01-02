import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationService } from '../../services/organizationService';
import { Folder as FolderIcon, ChevronDown } from 'lucide-react';
import { cn } from '../../utils';

interface FolderSelectProps {
    selectedFolderId: string | null;
    onSelect: (folderId: string | null) => void;
}

export const FolderSelect: React.FC<FolderSelectProps> = ({ selectedFolderId, onSelect }) => {
    const { data: folders = [] } = useQuery({
        queryKey: ['folders'],
        queryFn: organizationService.getFolders,
    });

    const selectedFolder = folders.find(f => f.id === selectedFolderId);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <FolderIcon className="w-3 h-3 text-neutral-600" />
                <label className="font-mono text-xs text-neutral-600 uppercase tracking-wider">Folder</label>
            </div>

            <div className="relative group">
                <select
                    value={selectedFolderId || ''}
                    onChange={(e) => onSelect(e.target.value || null)}
                    className="w-full appearance-none bg-white border border-neutral-200 px-6 py-4 text-sm font-bold text-neutral-900 focus:outline-none focus:bg-neutral-50 focus:border-primary transition-all cursor-pointer"
                >
                    <option value="" className="bg-white">General Notes</option>
                    {folders.map(folder => (
                        <option key={folder.id} value={folder.id} className="bg-white">
                            {folder.name}
                        </option>
                    ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};