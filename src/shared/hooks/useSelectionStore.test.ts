import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelectionStore } from './useSelectionStore';

describe('useSelectionStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const store = renderHook(() => useSelectionStore());
    act(() => {
      store.result.current.clearSelection();
    });
  });

  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useSelectionStore());
    expect(result.current.selectedNoteIds).toEqual([]);
    expect(result.current.isSelectionMode).toBe(false);
  });

  it('should toggle selection mode', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.toggleSelectionMode();
    });
    expect(result.current.isSelectionMode).toBe(true);
    
    act(() => {
      result.current.toggleSelectionMode();
    });
    expect(result.current.isSelectionMode).toBe(false);
  });

  it('should add note to selection', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.toggleNoteSelection('note-1');
    });
    
    expect(result.current.selectedNoteIds).toContain('note-1');
  });

  it('should remove note from selection if already selected', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.toggleNoteSelection('note-1');
    });
    expect(result.current.selectedNoteIds).toContain('note-1');
    
    act(() => {
      result.current.toggleNoteSelection('note-1');
    });
    expect(result.current.selectedNoteIds).not.toContain('note-1');
  });

  it('should clear selection', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.toggleNoteSelection('note-1');
      result.current.toggleNoteSelection('note-2');
    });
    expect(result.current.selectedNoteIds.length).toBe(2);
    
    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectedNoteIds).toEqual([]);
    expect(result.current.isSelectionMode).toBe(false);
  });
});
