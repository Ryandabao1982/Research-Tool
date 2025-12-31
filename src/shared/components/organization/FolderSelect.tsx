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
                <FolderIcon className="w-3 h-3 text-gray-600" />
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Folder</label>
            </div>

            <div className="relative group">
                <select
                    value={selectedFolderId || ''}
                    onChange={(e) => onSelect(e.target.value || null)}
                    className="w-full appearance-none bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:bg-white/[0.05] focus:border-white/10 transition-all cursor-pointer"
                >
                    <option value="" className="bg-zinc-900">General Notes</option>
                    {folders.map(folder => (
                        <option key={folder.id} value={folder.id} className="bg-zinc-900">
                            {folder.name}
                        </option>
                    ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};
