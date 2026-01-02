/**
 * ContextualSidebar - Related notes panel for ambient AI discovery
 */

import React from 'react';
import { useTypingPause } from '@/shared/hooks/useTypingPause';

export interface RelatedNote {
  id: string;
  title: string;
  snippet: string; // Highlighted excerpt from FTS5
}

interface ContextualSidebarProps {
  relatedNotes: RelatedNote[];
  isLoading: boolean;
  onNoteClick: (noteId: string) => void;
}

/**
 * Sanitize FTS5 snippet HTML to prevent XSS
 * Only allows <mark> tags, strips all other HTML
 */
function sanitizeSnippet(snippet: string): string {
  // Remove all HTML tags except <mark>
  return snippet
    .replace(/<(?!mark\b)[^>]*>/gi, '')
    .replace(/<\/[^>]*>/gi, (match) => {
      // Only allow closing </mark> tags
      return match.toLowerCase() === '</mark>' ? match : '';
    });
}

export default function ContextualSidebar({
  relatedNotes,
  isLoading,
  onNoteClick,
}: ContextualSidebarProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (relatedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="font-sans text-neutral-600 text-sm">No related notes found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2 p-4">
      <h2 className="font-sans text-neutral-900 text-lg font-bold">Related Notes</h2>
      {relatedNotes.map((note) => (
        <RelatedNoteItem
          key={note.id}
          note={note}
          onClick={() => onNoteClick(note.id)}
        />
      ))}
    </div>
  );
}

interface RelatedNoteItemProps {
  note: RelatedNote;
  onClick: () => void;
}

function RelatedNoteItem({ note, onClick }: RelatedNoteItemProps) {
  const sanitizedSnippet = sanitizeSnippet(note.snippet);
  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-3 border rounded-none bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
    >
      <h3 className="font-sans text-neutral-900 text-base font-semibold mb-2">
        {note.title}
      </h3>
      <div
        dangerouslySetInnerHTML={{ __html: sanitizedSnippet }}
        className="font-sans text-neutral-700 text-sm leading-relaxed"
      />
    </div>
  );
}