import { invoke } from '@tauri-apps/api/tauri';
import {
    FileSystemService,
    ImportOptions,
    ImportResult,
    ExportFormat,
    ExportOptions,
    BackupOptions,
    BackupResult,
    RestoreOptions,
    RestoreResult,
    Note
} from '../types';

/**
 * Implementation of the FileSystemService for KnowledgeBase Pro using Tauri.
 */
export class TauriFileSystemService implements FileSystemService {
    async importFiles(paths: string[], options?: ImportOptions): Promise<ImportResult> {
        return await invoke<ImportResult>('fs_import_files', { paths, options });
    }

    async exportNotes(noteIds: string[], format: ExportFormat, options?: ExportOptions): Promise<string> {
        return await invoke<string>('fs_export_notes', { noteIds, format, options });
    }

    async createBackup(path: string, options?: BackupOptions): Promise<BackupResult> {
        return await invoke<BackupResult>('fs_create_backup', { path, options });
    }

    async restoreBackup(path: string, options?: RestoreOptions): Promise<RestoreResult> {
        return await invoke<RestoreResult>('fs_restore_backup', { path, options });
    }
}

/**
 * Local fallback for file operations.
 * Simulates data exports and backups using browser downloads and localStorage.
 */
export class LocalFileSystemService implements FileSystemService {
    private getNotes(): Note[] {
        const data = localStorage.getItem('kb_pro_notes');
        return data ? JSON.parse(data) : [];
    }

    async importFiles(_paths: string[], _options?: ImportOptions): Promise<ImportResult> {
        // Mock successful import
        return {
            imported_count: 5,
            skipped_count: 0,
            errors: [],
            notes: []
        };
    }

    async exportNotes(noteIds: string[], format: ExportFormat, _options?: ExportOptions): Promise<string> {
        const notes = this.getNotes().filter(n => noteIds.includes(n.id));
        const content = format === 'json' ? JSON.stringify(notes, null, 2) : notes.map(n => `# ${n.title}\n\n${n.content}`).join('\n\n---\n\n');

        // Create a blob and trigger download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kb_pro_export_${new Date().getTime()}.${format === 'json' ? 'json' : 'md'}`;
        a.click();
        URL.revokeObjectURL(url);

        return "Download triggered";
    }

    async createBackup(_path: string, _options?: BackupOptions): Promise<BackupResult> {
        const data = {
            notes: this.getNotes(),
            folders: JSON.parse(localStorage.getItem('kb_pro_folders') || '[]'),
            tags: JSON.parse(localStorage.getItem('kb_pro_tags') || '[]'),
            links: JSON.parse(localStorage.getItem('kb_pro_links') || '[]')
        };

        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kb_pro_vault_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return {
            backup_path: "browser_download",
            size: blob.size,
            note_count: data.notes.length,
            created_at: new Date().toISOString()
        };
    }

    async restoreBackup(_path: string, _options?: RestoreOptions): Promise<RestoreResult> {
        // In a real local scenario, this might involve a file picker
        return {
            success: true,
            restored_notes: 10,
            skipped_notes: 0,
            errors: [],
            restored_at: new Date().toISOString()
        };
    }
}
