import { invoke } from '@tauri-apps/api/tauri';

export interface Folder {
    id: string;
    name: string;
    parent_id: string | null;
}

export interface Tag {
    id: string;
    name: string;
}

export const organizationService = {
    createFolder: async (name: string, parentId: string | null = null): Promise<Folder> => {
        return await invoke<Folder>('create_folder', { name, parentId });
    },

    getFolders: async (): Promise<Folder[]> => {
        return await invoke<Folder[]>('get_folders');
    },

    updateNoteFolder: async (noteId: string, folderId: string | null): Promise<void> => {
        return await invoke<void>('update_note_folder', { noteId, folderId });
    },

    createTag: async (name: string): Promise<Tag> => {
        return await invoke<Tag>('create_tag', { name });
    },

    linkTagToNote: async (noteId: string, tagId: string): Promise<void> => {
        return await invoke<void>('link_tag_to_note', { noteId, tagId });
    },

    unlinkTagFromNote: async (noteId: string, tagId: string): Promise<void> => {
        return await invoke<void>('unlink_tag_from_note', { noteId, tagId });
    },

    getNoteTags: async (noteId: string): Promise<Tag[]> => {
        return await invoke<Tag[]>('get_note_tags', { noteId });
    },
};
