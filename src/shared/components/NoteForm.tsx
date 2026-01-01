import React, { useState } from 'react';
import type { Note } from '../types';
import { motion } from 'framer-motion';
import { Save, X, Type, AlignLeft, Eye, Edit2 } from 'lucide-react';
import { cn } from '../utils';
import { FolderSelect } from './organization/FolderSelect';
import { TagInput } from './organization/TagInput';
import { MarkdownPreview } from '../../features/notes/components/MarkdownPreview';

interface NoteFormProps {
  note?: Note;
  onSave: (note: Note) => void;
  onCancel: () => void;
}

export function NoteForm({ note, onSave, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [folderId, setFolderId] = useState<string | null>(note?.folderId || null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Generate a stable ID for new notes to allow early tagging (if supported by backend)
  const [noteId] = useState(note?.id || crypto.randomUUID());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      const newNote: Note = {
        id: noteId,
        title: title.trim(),
        content: content.trim(),
        folderId: folderId,
        createdAt: note?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      onSave(newNote);
      setTitle('');
      setContent('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto bg-black border border-white/20 shadow-none space-y-0 relative"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-xs font-mono font-bold uppercase tracking-widest">
            <Save className="w-3 h-3" />
            <span>{note?.id ? 'EDIT MODE' : 'CAPTURE MODE'}</span>
          </div>
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">ID: {noteId.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-px bg-white/10 border border-white/10">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            title="Toggle Preview"
            data-testid="toggle-preview"
            className={cn(
              "p-2 transition-none hover:bg-white/10",
              isPreviewMode
                ? "bg-blue-600 text-white"
                : "text-gray-400"
            )}
          >
            {isPreviewMode ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 transition-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="divide-y divide-white/10">
        <div className="grid grid-cols-1 divide-y divide-white/10">
          {/* Title Input */}
          <div className="group relative">
            <div className="absolute top-4 left-6 flex items-center gap-2">
              <Type className="w-3 h-3 text-blue-500" />
              <label className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Title</label>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none px-6 pt-10 pb-4 text-xl font-bold text-white placeholder:text-gray-800 focus:outline-none focus:ring-0 focus:bg-white/[0.02] transition-colors font-sans"
              placeholder="UNTITLED NOTE..."
            />
          </div>

          {/* Content Area */}
          <div className="group relative min-h-[500px] flex flex-col">
            <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
              <AlignLeft className="w-3 h-3 text-gray-500" />
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                {isPreviewMode ? 'Preview' : 'Content'}
              </label>
            </div>

            {isPreviewMode ? (
              <div className="w-full flex-1 px-6 pt-12 pb-6 bg-white/[0.02]">
                <MarkdownPreview content={content} />
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full flex-1 bg-transparent border-none px-6 pt-12 pb-6 text-base font-normal text-gray-300 placeholder:text-gray-800 focus:outline-none focus:ring-0 focus:bg-white/[0.02] transition-colors resize-none leading-relaxed font-mono"
                placeholder="Start typing..."
              />
            )}
          </div>
          
          {/* Metadata Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-white/[0.02]">
            <div className="p-6">
               <FolderSelect
                selectedFolderId={folderId}
                onSelect={setFolderId}
              />
            </div>
            <div className="p-6">
               <TagInput noteId={noteId} />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end p-4 bg-white/5 gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className={cn(
                "px-8 py-2 text-xs font-bold uppercase tracking-widest border border-blue-500/50 transition-all",
                !title.trim() || !content.trim()
                  ? "text-gray-600 border-gray-800 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              )}
            >
              {note?.id ? 'Update' : 'Capture'}
            </button>
        </div>
      </form>
    </motion.div>
  );
}