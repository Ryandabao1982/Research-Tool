import React, { useState } from 'react';
import type { Note } from '../types';
import { motion } from 'framer-motion';
import { Save, X, Type, AlignLeft, Eye, Edit2 } from 'lucide-react';
import { cn } from '../utils';
import { FolderSelect } from './organization/FolderSelect';
import { TagInput } from './organization/TagInput';
import { MarkdownPreview } from '../../features/notes/components/MarkdownPreview';
import { Button, IconButton } from './Button';
import { Input, Textarea } from './Input';

interface NoteFormProps {
  note?: Note;
  onSave: (note: Note) => void;
  onCancel: () => void;
  onContentChange?: (content: string) => void;
}

export function NoteForm({ note, onSave, onCancel, onContentChange }: NoteFormProps) {
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
      className="max-w-6xl mx-auto bg-white border border-neutral-200 space-y-0 relative"
      role="region"
      aria-label={note?.id ? 'Edit Note Form' : 'Create Note Form'}
    >
      {/* Header - Rational Grid compliant */}
      <div className="flex justify-between items-center p-8 border-b border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary text-white text-xs font-mono font-bold uppercase tracking-widest border border-primary">
            <Save className="w-3 h-3" aria-hidden="true" />
            <span>{note?.id ? 'EDIT MODE' : 'CAPTURE MODE'}</span>
          </div>
          <span className="font-mono text-xs text-neutral-600 uppercase tracking-widest">ID: {noteId.slice(0, 8)}</span>
        </div>
        <div className="flex items-center border border-neutral-200">
          <IconButton
            ariaLabel={isPreviewMode ? 'Switch to edit mode' : 'Switch to preview mode'}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            data-testid="toggle-preview"
            className={cn(
              "border-r border-neutral-200 rounded-none",
              isPreviewMode ? "bg-primary text-white" : "text-neutral-600"
            )}
            icon={isPreviewMode ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          />
          <IconButton
            ariaLabel="Discard note and close"
            onClick={onCancel}
            className="text-neutral-600 hover:text-white hover:bg-red-500 rounded-none"
            icon={<X className="w-4 h-4" />}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="divide-y divide-neutral-200">
        <div className="grid grid-cols-1 divide-y divide-neutral-200">
          {/* Title Input */}
          <div className="group relative">
            <div className="absolute top-4 left-6 flex items-center gap-2">
              <Type className="w-3 h-3 text-primary" aria-hidden="true" />
              <label className="font-mono text-xs text-primary uppercase tracking-wider">Title</label>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Note title"
              className="w-full bg-transparent border-none px-6 pt-10 pb-4 text-xl font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-0 focus:bg-neutral-50 transition-colors font-sans"
              placeholder="UNTITLED NOTE..."
            />
          </div>

          {/* Content Area */}
          <div className="group relative min-h-[500px] flex flex-col">
            <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
              <AlignLeft className="w-3 h-3 text-neutral-600" aria-hidden="true" />
              <label className="font-mono text-xs text-neutral-600 uppercase tracking-wider">
                {isPreviewMode ? 'Preview' : 'Content'}
              </label>
            </div>

            {isPreviewMode ? (
              <div className="w-full flex-1 px-6 pt-12 pb-6 bg-neutral-50" role="region" aria-label="Note preview">
                <MarkdownPreview content={content} />
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  onContentChange?.(e.target.value);
                }}
                aria-label="Note content"
                className="w-full flex-1 bg-transparent border-none px-6 pt-12 pb-6 text-base font-normal text-neutral-700 placeholder:text-neutral-300 focus:outline-none focus:ring-0 focus:bg-neutral-50 transition-colors resize-none leading-relaxed font-mono"
                placeholder="Start typing..."
              />
            )}
          </div>
          
          {/* Metadata Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200 bg-neutral-50">
             <div className="p-8">
               <FolderSelect
                 selectedFolderId={folderId}
                 onSelect={setFolderId}
               />
             </div>
             <div className="p-8">
               <TagInput noteId={noteId} />
             </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end p-8 gap-4 bg-neutral-50">
            <Button
              type="button"
              variant="ghost"
              ariaLabel="Discard note"
              onClick={onCancel}
              className="text-xs font-bold uppercase tracking-widest"
            >
              Discard
            </Button>
            <Button
              type="submit"
              ariaLabel={note?.id ? 'Update note' : 'Capture note'}
              disabled={!title.trim() || !content.trim()}
              className="text-xs font-bold uppercase tracking-widest"
            >
              {note?.id ? 'Update' : 'Capture'}
            </Button>
        </div>
      </form>
    </motion.div>
  );
}