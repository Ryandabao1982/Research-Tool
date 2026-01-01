/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownPreview } from './MarkdownPreview';
import { BrowserRouter } from 'react-router-dom';
import { useNotesStore } from '../../../shared/hooks/useNotesStore';

// Mock the store module
vi.mock('../../../shared/hooks/useNotesStore', () => ({
    useNotesStore: vi.fn(),
}));
import { BrowserRouter } from 'react-router-dom';

describe('MarkdownPreview', () => {
    it('should render standard markdown', () => {
        render(
            <BrowserRouter>
                <MarkdownPreview content="**Bold** text" />
            </BrowserRouter>
        );
        const boldText = screen.getByText('Bold');
        expect(boldText.tagName).toBe('STRONG');
    });

    it('should navigate to existing note on click', () => {
        const mockSetSelectedNoteId = vi.fn();
        const mockNotes = [{ id: '1', title: 'My Note', content: '' }];

        // Mock the store
        // @ts-ignore
        useNotesStore.mockReturnValue({
            notes: mockNotes,
            setSelectedNoteId: mockSetSelectedNoteId,
            addNote: vi.fn(),
        });

        render(
            <BrowserRouter>
                <MarkdownPreview content="[[My Note]]" />
            </BrowserRouter>
        );

        const link = screen.getByText('My Note');
        fireEvent.click(link);

        expect(mockSetSelectedNoteId).toHaveBeenCalledWith('1');
    });

    it('should prompt to create note if not found', async () => {
        const mockAddNote = vi.fn().mockResolvedValue({ id: 'new-id' });
        const mockSetSelectedNoteId = vi.fn();

        // @ts-ignore
        useNotesStore.mockReturnValue({
            notes: [],
            setSelectedNoteId: mockSetSelectedNoteId,
            addNote: mockAddNote,
        });

        // Mock window.confirm
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <BrowserRouter>
                <MarkdownPreview content="[[New Idea]]" />
            </BrowserRouter>
        );

        const link = screen.getByText('New Idea');
        fireEvent.click(link);

        expect(confirmSpy).toHaveBeenCalled();
        expect(mockAddNote).toHaveBeenCalledWith('New Idea', '');
        // We need to wait for the promise to resolve
        await vi.waitFor(() => {
            expect(mockSetSelectedNoteId).toHaveBeenCalledWith('new-id');
        });

        confirmSpy.mockRestore();
    });
});
