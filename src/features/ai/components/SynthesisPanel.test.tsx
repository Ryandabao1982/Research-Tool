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
    });

    const { container } = render(<SynthesisPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('should render panel when notes are selected', () => {
    (useSelectionStoreModule.useSelectionStore as any).mockReturnValue({
      selectedNoteIds: ['1', '2'],
    });

    render(<SynthesisPanel />);
    expect(screen.getByText('2 notes selected')).toBeDefined();
    expect(screen.getByRole('button', { name: /Synthesize/i })).toBeDefined();
  });

  it('should call onSynthesize when button is clicked', () => {
    (useSelectionStoreModule.useSelectionStore as any).mockReturnValue({
      selectedNoteIds: ['1', '2'],
    });

    const onSynthesizeMock = vi.fn();
    // Assuming we pass this as a prop or it's handled internally. 
    // For this test let's assume we can pass a mock handler if needed, 
    // or we verify the button exists and is clickable.
    
    render(<SynthesisPanel onSynthesize={onSynthesizeMock} />);
    fireEvent.click(screen.getByRole('button', { name: /Synthesize/i }));
    
    expect(onSynthesizeMock).toHaveBeenCalled();
  });
});
