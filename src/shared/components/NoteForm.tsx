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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      const newNote: Note = {
        id: note?.id || crypto.randomUUID(),
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto p-10 rounded-[3rem] bg-surface-100/60 backdrop-blur-2xl border border-white/10 shadow-glass space-y-10 relative overflow-hidden"
    >
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Save className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {note?.id ? 'Edit Note' : 'Create New Note'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            title="Toggle Preview"
            data-testid="toggle-preview"
            className={cn(
              "p-3 rounded-2xl border transition-all",
              isPreviewMode
                ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                : "bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10"
            )}
          >
            {isPreviewMode ? <Edit2 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button
            onClick={onCancel}
            className="p-3 rounded-2xl bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-8">
          {/* Title Input */}
          <div className="space-y-3 group">
            <div className="flex items-center gap-2 px-1">
              <Type className="w-3 h-3 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] group-focus-within:text-gray-400 transition-colors">Note Title</label>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-lg font-bold text-white placeholder:text-gray-700 focus:outline-none focus:bg-white/[0.05] focus:border-white/10 focus:ring-4 focus:ring-blue-500/5 transition-all"
              placeholder="What's on your mind?"
            />
          </div>

          {/* Content Area */}
          <div className="space-y-3 group">
            <div className="flex items-center gap-2 px-1">
              <AlignLeft className="w-3 h-3 text-gray-600 group-focus-within:text-brand-blue transition-colors" />
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] group-focus-within:text-gray-400 transition-colors">
                {isPreviewMode ? 'Preview' : 'Deep Insights'}
              </label>
            </div>

            {isPreviewMode ? (
              <div className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] px-6 py-6 min-h-[300px]">
                <MarkdownPreview content={content} />
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] px-6 py-6 text-base font-medium text-gray-300 placeholder:text-gray-700 focus:outline-none focus:bg-white/[0.05] focus:border-white/10 focus:ring-4 focus:ring-brand-blue/5 transition-all min-h-[300px] resize-none leading-relaxed font-mono"
                placeholder="Start capturing your research, thoughts, and connections..."
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FolderSelect
              selectedFolderId={folderId}
              onSelect={setFolderId}
            />
            {note?.id && <TagInput noteId={note.id} />}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
            {/* Context details can be added here if needed */}
          </div>


          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className={cn(
                "px-10 py-4 rounded-2xl text-sm font-black transition-all shadow-xl",
                !title.trim() || !content.trim()
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 hover:scale-105 active:scale-95 shadow-blue-500/20"
              )}
            >
              {note?.id ? 'Update Note' : 'Capture Note'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}