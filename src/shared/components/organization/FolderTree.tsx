import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService, Folder } from '../../services/organizationService';
import { FolderItem } from './FolderItem';
import { FolderPlus, Plus } from 'lucide-react';

export const FolderTree: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    const { data: folders = [], isLoading } = useQuery({
        queryKey: ['folders'],
        queryFn: organizationService.getFolders,
    });

    const createFolderMutation = useMutation({
        mutationFn: ({ name, parentId }: { name: string; parentId: string | null }) =>
            organizationService.createFolder(name, parentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] });
        },
    });

    const handleAddRootFolder = () => {
        const name = prompt('Folder Name:');
        if (name) {
            createFolderMutation.mutate({ name, parentId: null });
        }
    };

    const handleAddSubfolder = (parentId: string) => {
        const name = prompt('Subfolder Name:');
        if (name) {
            createFolderMutation.mutate({ name, parentId });
        }
    };

    if (isLoading) return <div className="px-6 py-2 font-mono text-[10px] text-neutral-500 uppercase">Loading folders...</div>;

    const rootFolders = folders.filter(f => !f.parent_id);

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between px-4 mb-2">
                <p className="font-mono text-[9px] font-black text-neutral-500 uppercase tracking-widest">Folders</p>
                <button
                    onClick={handleAddRootFolder}
                    className="p-1 hover:bg-neutral-200 border rounded-none transition-colors text-neutral-500 hover:text-neutral-900 border-transparent"
                >
                    <FolderPlus className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="space-y-0.5">
                {rootFolders.map(folder => (
                    <FolderItem
                        key={folder.id}
                        folder={folder}
                        allFolders={folders}
                        onAddSubfolder={handleAddSubfolder}
                        onSelect={setSelectedFolderId}
                        selectedId={selectedFolderId}
                    />
                ))}

                {rootFolders.length === 0 && (
                    <div className="px-6 py-4 border border-dashed border-neutral-200 text-center">
                        <p className="font-mono text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2">No folders</p>
                        <button
                            onClick={handleAddRootFolder}
                            className="font-mono text-[9px] text-primary font-black uppercase tracking-widest hover:underline"
                        >
                            Create first folder
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};