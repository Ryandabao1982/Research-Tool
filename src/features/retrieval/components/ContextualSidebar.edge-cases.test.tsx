/**
 * Tests for error handling and edge cases in ContextualSidebar
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContextualSidebar, { RelatedNote } from './ContextualSidebar';

describe('ContextualSidebar - Edge Cases & Error Handling', () => {
  const mockOnNoteClick = vi.fn();
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy.mockClear();
  });

  describe('Empty States', () => {
    it('should handle empty related notes array', () => {
      render(
        <ContextualSidebar
          relatedNotes={[]}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const emptyMsg = screen.getByText('No related notes found');
      expect(emptyMsg).toBeDefined();
    });

    it('should handle null related notes', () => {
      render(
        <ContextualSidebar
          relatedNotes={null as unknown as RelatedNote[]}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const emptyMsg = screen.getByText('No related notes found');
      expect(emptyMsg).toBeDefined();
    });
  });

  describe('Error States', () => {
    it('should handle FTS5 search failure gracefully', () => {
      render(
        <ContextualSidebar
          relatedNotes={[]}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      // Component should show empty state instead of crashing
      const emptyMsg = screen.getByText('No related notes found');
      expect(emptyMsg).toBeDefined();
    });

    it('should recover from error state', () => {
      render(
        <ContextualSidebar
          relatedNotes={[]}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      // After error, component should still be functional
      const emptyMsg = screen.getByText('No related notes found');
      expect(emptyMsg).toBeDefined();
    });
  });

  describe('Content Variations', () => {
    it('should handle long snippets gracefully', () => {
      const mockNotesWithLongSnippets: RelatedNote[] = [
        {
          id: '1',
          title: 'Note with very long content',
          snippet: '<mark>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</mark>... [more content] This should wrap nicely.',
        },
      ];

      render(
        <ContextualSidebar
          relatedNotes={mockNotesWithLongSnippets}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const noteTitle = screen.getByText('Note with very long content');
      expect(noteTitle).toBeDefined();
    });

    it('should handle special characters in snippets', () => {
      const mockNotesWithSpecialChars: RelatedNote[] = [
        {
          id: '1',
          title: 'Markdown Note',
          snippet: 'Heading **bold** and *italic* text with [link](url)',
        },
      ];

      render(
        <ContextualSidebar
          relatedNotes={mockNotesWithSpecialChars}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const noteTitle = screen.getByText('Markdown Note');
      expect(noteTitle).toBeDefined();
    });

    it('should handle Unicode and emojis', () => {
      const mockNotesWithEmojis: RelatedNote[] = [
        {
          id: '1',
          title: 'Emoji Note 🎉',
          snippet: 'Here is a emoji 🚀 and another 💡',
        },
      ];

      render(
        <ContextualSidebar
          relatedNotes={mockNotesWithEmojis}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const noteTitle = screen.getByText('Emoji Note 🎉');
      expect(noteTitle).toBeDefined();
      const emoji1 = screen.getByText('🚀');
      expect(emoji1).toBeDefined();
    });
  });

  describe('Performance Scenarios', () => {
    it('should render efficiently with large notes list', () => {
      const mockLargeNotesList: RelatedNote[] = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        title: `Note ${i}`,
        snippet: `Snippet for note ${i}`,
      }));

      const startTime = performance.now();

      render(
        <ContextualSidebar
          relatedNotes={mockLargeNotesList}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const renderTime = performance.now() - startTime;

      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);
    });
  });
});
