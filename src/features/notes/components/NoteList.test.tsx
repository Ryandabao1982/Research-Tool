/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteList } from './NoteList';
import type { Note } from '../../../shared/types';
import * as useSelectionStoreModule from '../../../shared/hooks/useSelectionStore';

// Mock the useSelectionStore
vi.mock('../../../shared/hooks/useSelectionStore', () => ({
  useSelectionStore: vi.fn(),
}));

const mockNotes: Note[] = [
  { id: '1', title: 'Note 1', content: 'Content 1', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', title: 'Note 2', content: 'Content 2', createdAt: new Date(), updatedAt: new Date() },
];

describe('NoteList', () => {
  it('should render notes', () => {
    // Default mock implementation
    (useSelectionStoreModule.useSelectionStore as any).mockReturnValue({
      isSelectionMode: false,
      selectedNoteIds: [],
      toggleNoteSelection: vi.fn(),
    });

    render(<NoteList notes={mockNotes} onNoteClick={() => {}} />);
    expect(screen.getByText('Note 1')).toBeDefined();
    expect(screen.getByText('Note 2')).toBeDefined();
  });

  it('should render checkboxes when in selection mode', () => {
    // Mock selection mode active
    (useSelectionStoreModule.useSelectionStore as any).mockReturnValue({
      isSelectionMode: true,
      selectedNoteIds: [],
      toggleNoteSelection: vi.fn(),
    });

    render(<NoteList notes={mockNotes} onNoteClick={() => {}} />);
    // Assuming we use checkboxes for selection
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2);
  });

  it('should toggle selection when checkbox is clicked', () => {
    const toggleNoteSelectionMock = vi.fn();
    (useSelectionStoreModule.useSelectionStore as any).mockReturnValue({
      isSelectionMode: true,
      selectedNoteIds: [],
      toggleNoteSelection: toggleNoteSelectionMock,
    });

    render(<NoteList notes={mockNotes} onNoteClick={() => {}} />);
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes[0]) {
      fireEvent.click(checkboxes[0]);
    }

    expect(toggleNoteSelectionMock).toHaveBeenCalledWith('1');
  });

  it('should trigger onNoteClick when not in selection mode', () => {
    const onNoteClickMock = vi.fn();
    (useSelectionStoreModule.useSelectionStore as any).mockReturnValue({
      isSelectionMode: false,
      selectedNoteIds: [],
      toggleNoteSelection: vi.fn(),
    });

    render(<NoteList notes={mockNotes} onNoteClick={onNoteClickMock} />);
    fireEvent.click(screen.getByText('Note 1'));

    expect(onNoteClickMock).toHaveBeenCalledWith(mockNotes[0]);
  });
});
