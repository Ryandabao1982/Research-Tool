/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NoteForm } from './NoteForm';
import type { Note } from '../types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock MarkdownPreview
vi.mock('../../features/notes/components/MarkdownPreview', () => ({
    MarkdownPreview: () => <div data-testid="markdown-preview">Mock Preview</div>
}));

// Clean up after each test
afterEach(() => {
    cleanup();
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <QueryClientProvider client={queryClient}>
            {ui}
        </QueryClientProvider>
    );
};

describe('NoteForm', () => {
    const mockNote: Note = {
        id: '1',
        title: 'Test Note',
        content: '**Bold** content',
        folderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    it('should render in edit mode by default', () => {
        renderWithProviders(<NoteForm note={mockNote} onSave={mockOnSave} onCancel={mockOnCancel} />);
        expect(screen.getByDisplayValue('Test Note')).toBeDefined();
        expect(screen.getByDisplayValue('**Bold** content')).toBeDefined();
        // Should NOT show markdown preview initially
        expect(screen.queryByTestId('markdown-preview')).toBeNull();
    });

    it('should toggle to preview mode', () => {
        renderWithProviders(<NoteForm note={mockNote} onSave={mockOnSave} onCancel={mockOnCancel} />);

        // Find and click preview button (this will fail initially as button doesn't exist)
        const previewButton = screen.getByTestId('toggle-preview');
        fireEvent.click(previewButton);

        // Should show preview content
        expect(screen.getByTestId('markdown-preview')).toBeDefined();
    });

    it('should call onSave with correct data when submitted', () => {
        renderWithProviders(<NoteForm onSave={mockOnSave} onCancel={mockOnCancel} />);

        const titleInput = screen.getByPlaceholderText('UNTITLED NOTE...');
        const contentInput = screen.getByPlaceholderText('Start typing...');
        const submitButton = screen.getByText('Capture');

        fireEvent.change(titleInput, { target: { value: 'New Note' } });
        fireEvent.change(contentInput, { target: { value: 'New Content' } });
        fireEvent.click(submitButton);

        expect(mockOnSave).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            title: 'New Note',
            content: 'New Content',
        }));
    });
});
