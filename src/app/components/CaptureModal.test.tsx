/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CaptureModal } from './CaptureModal';
import { invoke } from '@tauri-apps/api/tauri';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

// Mock useNotesStore
const mockAddNote = vi.fn();
const mockSetNotes = vi.fn();

vi.mock('@/shared/stores/notes-store', () => ({
  useNotesStore: vi.fn((selector) => {
    const state = {
      addNote: mockAddNote,
      setNotes: mockSetNotes,
      notes: [],
      getState: () => ({
        addNote: mockAddNote,
        setNotes: mockSetNotes,
        notes: [],
      }),
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock useSettingsStore
vi.mock('@/shared/stores/settingsStore', () => ({
  useSettingsStore: vi.fn(() => ({
    reducedMotion: false,
  })),
}));

describe('CaptureModal', () => {
  const mockOnClose = vi.fn();
  const mockInvoke = invoke as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose.mockClear();
  });

  it('should render when isOpen is true', () => {
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<CaptureModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should update content when typing', () => {
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test note content' } });
    expect(textarea).toHaveValue('Test note content');
  });

  it('should auto-expand vertically when content grows', async () => {
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    const textarea = screen.getByRole('textbox');
    
    // Add multiple lines to trigger expansion
    fireEvent.change(textarea, { 
      target: { value: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5' } 
    });
    
    // Should have expanded class
    await waitFor(() => {
      expect(textarea.className).toContain('min-h-[300px]');
    });
  });

  it('should save note and close on Enter key (without Shift)', async () => {
    // Backend returns tuple: (note_id, title)
    mockInvoke.mockResolvedValue(['note-123', 'Test content']);
    
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test content' } });
    
    // Press Enter (without Shift)
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });
    
    // Wait a bit for async operations
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify invoke was called
    expect(mockInvoke).toHaveBeenCalledWith('quick_create_note', {
      content: 'Test content'
    });
    
    // Verify modal closed
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should NOT save on Shift+Enter', async () => {
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test content' } });
    
    // Press Shift+Enter (should add new line, not save)
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mockInvoke).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should close without saving on Escape key', () => {
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test content' } });
    
    // Press Escape
    fireEvent.keyDown(textarea, { key: 'Escape', code: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('should handle empty content with "Untitled Note"', async () => {
    mockInvoke.mockResolvedValue(['note-123', 'Untitled Note']);
    
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '' } });
    
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    expect(mockInvoke).toHaveBeenCalledWith('quick_create_note', {
      content: ''
    });
  });

  it('should handle save error gracefully', async () => {
    mockInvoke.mockRejectedValue(new Error('Save failed'));
    
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Should not close on error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should measure performance: complete capture in reasonable time', async () => {
    mockInvoke.mockResolvedValue(['note-123', 'Test']);
    
    const start = performance.now();
    
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const end = performance.now();
    const totalTime = end - start;
    
    // Modal should have closed
    expect(mockOnClose).toHaveBeenCalled();
    
    // Total time should be reasonable (< 1 second in test environment)
    expect(totalTime).toBeLessThan(1000);
  });
});
