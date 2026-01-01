/**
 * Tests for ContextualSidebar component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContextualSidebar, { RelatedNote } from './ContextualSidebar';

// Test utilities
const mockRelatedNotes: RelatedNote[] = [
  {
    id: '1',
    title: 'Test Note 1',
    snippet: 'This is a <mark>test</mark> snippet...',
  },
  {
    id: '2',
    title: 'Another Note',
    snippet: 'Another interesting content...',
  },
];

describe('ContextualSidebar', () => {
  const mockOnNoteClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(
        <ContextualSidebar
          relatedNotes={[]}
          isLoading={true}
          onNoteClick={mockOnNoteClick}
        />
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeNull();
    });

    it('should display "Related Notes" header', () => {
      render(
        <ContextualSidebar
          relatedNotes={mockRelatedNotes}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const header = screen.getByText('Related Notes');
      expect(header).toBeDefined();
    });

    it('should display all related notes when available', () => {
      render(
        <ContextualSidebar
          relatedNotes={mockRelatedNotes}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const note1 = screen.getByText('Test Note 1');
      const note2 = screen.getByText('Another Note');
      expect(note1).toBeDefined();
      expect(note2).toBeDefined();
    });

    it('should show empty state when no related notes found', () => {
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
  });

  describe('User Interactions', () => {
    it('should call onNoteClick with correct noteId when clicked', () => {
      render(
        <ContextualSidebar
          relatedNotes={mockRelatedNotes}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const firstNote = screen.getByText('Test Note 1');
      firstNote.click();

      expect(mockOnNoteClick).toHaveBeenCalledWith('1');
    });

    it('should call onNoteClick with second note ID', () => {
      render(
        <ContextualSidebar
          relatedNotes={mockRelatedNotes}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const secondNote = screen.getByText('Another Note');
      secondNote.click();

      expect(mockOnNoteClick).toHaveBeenCalledWith('2');
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize malicious script tags in snippet', () => {
      const maliciousNote: RelatedNote = {
        id: '3',
        title: 'Malicious Note',
        snippet: '<script>alert("xss")</script>Normal <mark>text</mark>',
      };

      render(
        <ContextualSidebar
          relatedNotes={[maliciousNote]}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const maliciousNoteElement = screen.getByText('Malicious Note');
      expect(maliciousNoteElement.outerHTML).not.toContain('<script>');
    });

    it('should preserve <mark> tags from FTS5', () => {
      render(
        <ContextualSidebar
          relatedNotes={mockRelatedNotes}
          isLoading={false}
          onNoteClick={mockOnNoteClick}
        />
      );

      const noteElement = screen.getByText('Test Note 1').parentElement;
      expect(noteElement?.innerHTML).toContain('<mark>test</mark>');
    });
  });
});
