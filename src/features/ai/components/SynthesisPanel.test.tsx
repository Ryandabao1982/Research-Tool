/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { SynthesisPanel } from './SynthesisPanel';
import * as useSelectionStoreModule from '../../../shared/hooks/useSelectionStore';

expect.extend(matchers);

// Mock the useSelectionStore
vi.mock('../../../shared/hooks/useSelectionStore', () => ({
  useSelectionStore: vi.fn(),
}));

describe('SynthesisPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render nothing when no notes are selected', () => {
    (useSelectionStoreModule.useSelectionStore as any).mockReturnValue({
      selectedNoteIds: [],
      clearSelection: vi.fn(),
    });

    const { container } = render(<SynthesisPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('should render panel when notes are selected', () => {
    (useSelectionStoreModule.useSelectionStore as any).mockReturnValue({
      selectedNoteIds: ['1', '2'],
      clearSelection: vi.fn(),
    });

    render(<SynthesisPanel />);
    expect(screen.getByText(/2 source/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Synthesize/i })).toBeInTheDocument();
  });

  it('should call onSynthesize when button is clicked', () => {
    (useSelectionStoreModule.useSelectionStore as any).mockReturnValue({
      selectedNoteIds: ['1', '2'],
      clearSelection: vi.fn(),
    });

    const onSynthesizeMock = vi.fn().mockResolvedValue('Result');
    render(<SynthesisPanel onSynthesize={onSynthesizeMock} />);
    fireEvent.click(screen.getByRole('button', { name: /Synthesize/i }));
    
    expect(onSynthesizeMock).toHaveBeenCalled();
  });

  it('should call onSave when save button is clicked', () => {
    const clearSelectionMock = vi.fn();
    (useSelectionStoreModule.useSelectionStore as any).mockReturnValue({
      selectedNoteIds: ['1', '2'],
      clearSelection: clearSelectionMock,
    });

    const onSaveMock = vi.fn();
    render(<SynthesisPanel onSynthesize={vi.fn()} onSave={onSaveMock} initialResult="Test Result" />);
    
    const saveButton = screen.getByText(/Save as Note/i).closest('button');
    expect(saveButton).toBeDefined();
    if (saveButton) {
      fireEvent.click(saveButton);
    }
    
    expect(onSaveMock).toHaveBeenCalledWith('Test Result');
    expect(clearSelectionMock).toHaveBeenCalled();
  });
});
