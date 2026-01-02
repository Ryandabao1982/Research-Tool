# Required Fixes for Story 1-5

This document provides the specific code changes needed to address the critical issues found in the code review.

---

## Fix #1: Security - Input Validation in quick_commands.rs

**File:** `src-tauri/src/commands/quick_commands.rs`

**Current Code (Lines 16-35):**
```rust
#[tauri::command]
pub async fn quick_create_note(
    state: State<'_, db_service::DbState>,
    content: String,
) -> Result<(String, String), String> {
    let start = std::time::Instant::now();
    
    // Auto-generate title from first line
    let title = generate_title(&content);
    
    // Get connection and create note
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    // Use existing db_service function
    let note_id = db_service::create_note(&conn, &title, &content)?;
    
    let duration = start.elapsed();
    log::info!("Quick create note completed in {:?} (target: <150ms)", duration);
    
    Ok((note_id, title))
}
```

**Fixed Code:**
```rust
use std::time::Instant;

// Constants for validation
const MAX_CONTENT_LENGTH: usize = 100_000; // 100KB limit
const MAX_TITLE_LENGTH: usize = 200;

#[tauri::command]
pub async fn quick_create_note(
    state: State<'_, db_service::DbState>,
    content: String,
) -> Result<(String, String), String> {
    let start = Instant::now();
    
    // === VALIDATION ===
    // Check empty
    let trimmed = content.trim();
    if trimmed.is_empty() {
        return Err("Content cannot be empty".to_string());
    }
    
    // Check length
    if trimmed.len() > MAX_CONTENT_LENGTH {
        return Err(format!("Content exceeds maximum length of {} bytes", MAX_CONTENT_LENGTH));
    }
    
    // Check valid UTF-8 (already guaranteed by String type, but double-check)
    if !trimmed.is_utf8() {
        return Err("Invalid character encoding".to_string());
    }
    
    // Sanitize: Remove control characters except newlines
    let sanitized: String = trimmed.chars()
        .filter(|&c| c == '\n' || c == '\r' || !c.is_control())
        .collect();
    
    if sanitized.is_empty() {
        return Err("Content contains only invalid characters".to_string());
    }
    
    // Generate title
    let title = generate_title(&sanitized);
    
    // Validate title length
    if title.len() > MAX_TITLE_LENGTH {
        return Err(format!("Generated title too long: {} bytes", title.len()));
    }
    
    // Get connection and create note
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    // Use existing db_service function
    let note_id = db_service::create_note(&conn, &title, &sanitized)?;
    
    let duration = start.elapsed();
    log::info!("Quick create note completed in {:?} (target: <150ms)", duration);
    
    Ok((note_id, title))
}
```

---

## Fix #2: Duplicate Store Updates in CaptureModal.tsx

**File:** `src/app/components/CaptureModal.tsx`

**Current Code (Lines 48-92):**
```typescript
const handleSave = useCallback(async () => {
  if (!content.trim() || isSaving) return;

  setIsSaving(true);
  const startTime = performance.now();

  try {
    const result = await invoke<[string, string]>('quick_create_note', {
      content: content.trim(),
    });

    // Add to frontend store for Recent Notes (AC: #5)
    const newNote = {
      id: result[0],
      title: result[1],
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await addNote(newNote.title, newNote.content);  // ← DUPLICATE
    
    // Update store with actual ID from backend
    useNotesStore.getState().setNotes([            // ← DUPLICATE
      newNote,
      ...useNotesStore.getState().notes,
    ]);

    if (onNoteCreated) {
      onNoteCreated(newNote);
    }

    const duration = performance.now() - startTime;
    console.log(`Capture completed in ${duration.toFixed(2)}ms (target: <200ms)`);

    handleClose();
  } catch (error) {
    console.error('Failed to create note:', error);
    // Could show error toast here
  } finally {
    setIsSaving(false);
  }
}, [content, isSaving, addNote, onNoteCreated]);
```

**Fixed Code:**
```typescript
const handleSave = useCallback(async () => {
  if (!content.trim() || isSaving) return;

  setIsSaving(true);
  const startTime = performance.now();

  try {
    // Call backend to create note
    const result = await invoke<[string, string]>('quick_create_note', {
      content: content.trim(),
    });

    // Validate backend response
    if (!result || !Array.isArray(result) || result.length !== 2) {
      throw new Error('Invalid backend response format');
    }

    const [noteId, title] = result;

    // Create note object
    const newNote = {
      id: noteId,
      title: title,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Use store action to add note (SINGLE update)
    // The store action should handle adding to recent notes list
    await addNote(newNote);

    // Call optional callback
    if (onNoteCreated) {
      onNoteCreated(newNote);
    }

    // Performance measurement - complete flow
    const duration = performance.now() - startTime;
    
    // Log in dev, use proper logging in production
    if (import.meta.env.DEV) {
      console.log(`Capture completed in ${duration.toFixed(2)}ms (target: <200ms)`);
    }

    // Enforce performance budget
    if (duration > 200) {
      console.warn(`Performance target missed: ${duration.toFixed(2)}ms > 200ms`);
    }

    // Close modal
    handleClose();
    
  } catch (error) {
    // Reset saving state
    setIsSaving(false);
    
    // Show error to user
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to create note:', errorMessage);
    
    // Show error toast (implement this)
    showToast(`Failed to save note: ${errorMessage}`, 'error');
    
    // Don't close modal - let user retry
    return;
  }
}, [content, isSaving, addNote, onNoteCreated, handleClose, showToast]);
```

**Note:** You'll need to implement `showToast` or use your existing notification system.

---

## Fix #3: Remove Direct Store Manipulation

**File:** `src/app/components/CaptureModal.tsx`

**Remove these lines:**
```typescript
// DELETE THIS:
useNotesStore.getState().setNotes([
  newNote,
  ...useNotesStore.getState().notes,
]);
```

**Ensure your store has proper action:**
```typescript
// In src/shared/stores/notes-store.ts
export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  
  // Proper action to add note
  addNote: async (noteData) => {
    // This should handle the full note creation flow
    // including updating recent notes list
    const newNote = {
      ...noteData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      notes: [newNote, ...state.notes],
      recentNotes: [newNote, ...state.recentNotes].slice(0, 10)
    }));
    
    return newNote;
  },
  
  // ... other actions
}));
```

---

## Fix #4: Error Handling with User Feedback

**File:** `src/app/components/CaptureModal.tsx`

**Add to component:**
```typescript
// Add state for error
const [error, setError] = useState<string | null>(null);

// Update handleSave to show errors
const handleSave = useCallback(async () => {
  if (!content.trim() || isSaving) return;

  setIsSaving(true);
  setError(null);  // Clear previous errors
  const startTime = performance.now();

  try {
    // ... existing save logic ...
    
    handleClose();
  } catch (error) {
    setIsSaving(false);
    const errorMessage = error instanceof Error ? error.message : String(error);
    setError(errorMessage);
    
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }
}, [/* dependencies */]);

// Add error display in JSX
{error && (
  <div className="absolute top-2 left-2 right-2 bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded animate-pulse">
    <span className="font-bold">Error:</span> {error}
    <button 
      onClick={() => setError(null)}
      className="float-right font-bold hover:text-red-900"
    >
      ✕
    </button>
  </div>
)}
```

---

## Fix #5: Remove Window Management from main.rs

**File:** `src-tauri/src/main.rs`

**Current Code (Lines 100-140):**
```rust
.setup(|app| {
    // Register Global Hotkey: Alt+Space for Rapid Capture
    let app_handle = app.handle();
    let mut shortcut = app.global_shortcut_manager();
    
    // Alt+Space for rapid capture modal
    shortcut
        .register("Alt+Space", move || {
            // Get or create the capture window
            let window = app_handle.get_window("capture");
            if let Some(win) = window {
                // Window exists, just show and focus
                if !win.is_visible().unwrap() {
                    win.show().unwrap();
                }
                win.set_focus().unwrap();
            } else {
                // Window doesn't exist yet, create it
                // This will be handled by the frontend when it registers the shortcut
                log::info!("Alt+Space pressed - frontend will handle modal opening");
            }
            
            // Also emit an event that frontend can listen to
            let _ = app_handle.emit_all("global-shortcut-pressed", "Alt+Space");
        })
        .expect("Failed to register Alt+Space global shortcut");
    
    // ... rest of setup ...
})
```

**Fixed Code:**
```rust
.setup(|app| {
    // Register Global Hotkey: Alt+Space for Rapid Capture
    // This works even when app is in background (AC: #7)
    let app_handle = app.handle();
    let mut shortcut = app.global_shortcut_manager();
    
    // Alt+Space for rapid capture modal
    // ONLY emit event - frontend handles everything
    shortcut
        .register("Alt+Space", move || {
            // Emit event that frontend listener will catch
            // Frontend will open the modal component
            let _ = app_handle.emit_all("global-shortcut-pressed", "Alt+Space");
        })
        .expect("Failed to register Alt+Space global shortcut");
    
    // Keep existing Cmd/Ctrl+Shift+Space for backward compatibility if needed
    // ... rest of setup ...
})
```

**Key Changes:**
- Removed all window management logic
- Only emit event
- Frontend handles modal display

---

## Fix #6: Add Complete Performance Measurement

**File:** `src/app/components/CaptureModal.tsx`

**Add performance tracking:**
```typescript
// Add to component state
const [perfMetrics, setPerfMetrics] = useState({
  backend: 0,
  frontend: 0,
  total: 0,
});

// Update handleSave
const handleSave = useCallback(async () => {
  if (!content.trim() || isSaving) return;

  setIsSaving(true);
  const totalStart = performance.now();
  const metrics = { backend: 0, frontend: 0, total: 0 };

  try {
    // Backend call
    const backendStart = performance.now();
    const result = await invoke<[string, string]>('quick_create_note', {
      content: content.trim(),
    });
    metrics.backend = performance.now() - backendStart;

    // Frontend processing
    const frontendStart = performance.now();
    
    // ... validation, store update, etc. ...
    
    metrics.frontend = performance.now() - frontendStart;
    metrics.total = performance.now() - totalStart;

    // Update metrics display
    setPerfMetrics(metrics);

    // Log and enforce
    if (import.meta.env.DEV) {
      console.table({
        'Backend (target <150ms)': `${metrics.backend.toFixed(2)}ms`,
        'Frontend (target <50ms)': `${metrics.frontend.toFixed(2)}ms`,
        'Total (target <200ms)': `${metrics.total.toFixed(2)}ms`,
      });
    }

    // Performance budget enforcement
    if (metrics.total > 200) {
      console.warn(`⚠️ Performance budget exceeded by ${(metrics.total - 200).toFixed(2)}ms`);
      // Could show warning to user or log to monitoring service
    }

    handleClose();
  } catch (error) {
    // ... error handling ...
  } finally {
    setIsSaving(false);
  }
}, [/* dependencies */]);

// Optional: Display metrics in UI (dev only)
{import.meta.env.DEV && perfMetrics.total > 0 && (
  <div className="absolute top-2 right-2 text-xs font-mono bg-black/80 text-green-400 p-2 rounded">
    <div>Backend: {perfMetrics.backend.toFixed(1)}ms</div>
    <div>Frontend: {perfMetrics.frontend.toFixed(1)}ms</div>
    <div className={perfMetrics.total > 200 ? 'text-red-400' : 'text-green-400'}>
      Total: {perfMetrics.total.toFixed(1)}ms
    </div>
  </div>
)}
```

---

## Fix #7: Add Debouncing to Auto-Expansion

**File:** `src/app/components/CaptureModal.tsx`

**Current Code (Lines 128-134):**
```typescript
useEffect(() => {
  if (!isOpen) return;
  
  const lines = content.split('\n').length;
  const shouldExpand = lines > 1 || content.length > 50;
  setIsExpanded(shouldExpand);
}, [content, isOpen]);
```

**Fixed Code:**
```typescript
import { useDebounce } from '@/shared/hooks/useDebounce'; // Assuming this exists

// In component:
const [isExpanded, setIsExpanded] = useState(false);
const debouncedContent = useDebounce(content, 150); // 150ms debounce

useEffect(() => {
  if (!isOpen) return;
  
  const lines = debouncedContent.split('\n').length;
  const chars = debouncedContent.length;
  
  // More sensible logic: expand if multiple lines OR single line getting long
  const shouldExpand = lines > 3 || (lines === 1 && chars > 80) || (lines > 1 && chars > 30);
  
  setIsExpanded(shouldExpand);
}, [debouncedContent, isOpen]);

// If useDebounce doesn't exist, create it:
// src/shared/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Fix #8: Define "Recent Notes" Flow

**Clarification needed:** What is "Recent Notes"?

**Option A: Store maintains recent list**
```typescript
// In notes-store.ts
export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  recentNotes: [], // Last 10 notes
  
  addNote: async (noteData) => {
    const newNote = { /* ... */ };
    
    set((state) => ({
      notes: [newNote, ...state.notes],
      recentNotes: [newNote, ...state.recentNotes].slice(0, 10)
    }));
    
    return newNote;
  },
}));
```

**Option B: Query recent notes on demand**
```typescript
// In component or dashboard
const { data: recentNotes } = useQuery({
  queryKey: ['recent-notes'],
  queryFn: () => invoke('get_recent_notes'),
});
```

**Recommendation:** Use Option A for better performance.

---

## Fix #9: Add Comprehensive Tests

**File:** `src/app/components/CaptureModal.test.tsx`

**Add these tests:**
```typescript
describe('CaptureModal - Security & Edge Cases', () => {
  it('should reject empty content', async () => {
    mockInvoke.mockRejectedValue(new Error('Content cannot be empty'));
    
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  it('should reject very long content', async () => {
    const longContent = 'x'.repeat(100001);
    mockInvoke.mockRejectedValue(new Error('Content exceeds maximum length'));
    
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: longContent } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  it('should handle backend failure gracefully', async () => {
    mockInvoke.mockRejectedValue(new Error('Database connection failed'));
    
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: 'Test' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('should prevent double-save', async () => {
    mockInvoke.mockResolvedValue(['note-123', 'Test']);
    
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: 'Test' } });
    
    // Press Enter twice rapidly
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle special characters in content', async () => {
    mockInvoke.mockResolvedValue(['note-123', 'Test']);
    
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    const textarea = screen.getByRole('textbox');
    
    const specialContent = 'Test with 🎉 emoji\nand "quotes"\nand <tags>';
    fireEvent.change(textarea, { target: { value: specialContent } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('quick_create_note', {
        content: specialContent
      });
    });
  });

  it('should measure actual performance', async () => {
    mockInvoke.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(['note-123', 'Test']), 50))
    );
    
    const start = performance.now();
    render(<CaptureModal isOpen={true} onClose={mockOnClose} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
    
    const end = performance.now();
    const totalTime = end - start;
    
    // Should be < 200ms including animation
    expect(totalTime).toBeLessThan(200);
  });
});
```

---

## Fix #10: Documentation

**Add TSDoc to all public functions:**

```typescript
/**
 * Rapid Capture Modal Component
 * 
 * Provides instant note capture from any application context via Alt+Space.
 * 
 * Features:
 * - Frameless, minimal design
 * - Auto-expanding textarea
 * - Enter to save, Esc to cancel
 * - Performance: <200ms total capture time
 * - Works in background via global shortcut
 * 
 * @param isOpen - Whether modal is visible
 * @param onClose - Callback when modal closes
 * @param onNoteCreated - Optional callback after successful save
 * 
 * @example
 * ```tsx
 * const { isOpen, closeModal } = useCaptureModal();
 * <CaptureModal isOpen={isOpen} onClose={closeModal} />
 * ```
 */
export function CaptureModal({ isOpen, onClose, onNoteCreated }: CaptureModalProps) {
  // ...
}

/**
 * Hook for rapid capture modal state and shortcuts
 * 
 * Registers Alt+Space global shortcut and manages modal state.
 * Works even when app is in background.
 * 
 * @returns Object with modal state and controls
 * 
 * @example
 * ```typescript
 * const { isOpen, openModal, closeModal } = useCaptureModal();
 * // Alt+Space is automatically registered
 * ```
 */
export function useCaptureModal() {
  // ...
}
```

---

## Summary of Changes Needed

| File | Lines Changed | Priority | Effort |
|------|---------------|----------|--------|
| quick_commands.rs | 16-35 | Critical | Medium |
| CaptureModal.tsx | 48-92 | Critical | Medium |
| CaptureModal.tsx | Remove lines 73-76 | Critical | Low |
| CaptureModal.tsx | Add error handling | High | Low |
| main.rs | 100-140 | High | Low |
| CaptureModal.tsx | Add perf tracking | High | Medium |
| CaptureModal.tsx | Add debouncing | Medium | Low |
| notes-store.ts | Define recent notes | Medium | Medium |
| CaptureModal.test.tsx | Add security tests | High | Medium |
| All files | Add TSDoc | Low | Low |

**Total Estimated Effort:** 2-3 days

---

## Verification Checklist

After implementing fixes, verify:

- [ ] All tests pass (10/10)
- [ ] Security tests cover edge cases
- [ ] Performance <200ms in production build
- [ ] Error messages visible to users
- [ ] No duplicate store updates
- [ ] No direct store manipulation
- [ ] No console.log in production
- [ ] Documentation complete
- [ ] Code review passed

---

**Next Step:** Implement fixes and request re-review
