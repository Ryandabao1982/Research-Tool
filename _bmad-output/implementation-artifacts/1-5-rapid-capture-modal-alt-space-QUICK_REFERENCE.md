# Quick Reference: Story 1.5 Implementation

## Backend Command (Rust)

### Quick Create Note
```rust
// File: src-tauri/src/commands/quick_commands.rs

#[tauri::command]
pub async fn quick_create_note(
    state: State<'_, db_service::DbState>,
    content: String,
) -> Result<(String, String), String> {
    let title = generate_title(&content);
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let note_id = db_service::create_note(&conn, &title, &content)?;
    Ok((note_id, title))
}

fn generate_title(content: &str) -> String {
    content.lines()
        .map(|line| line.trim())
        .find(|line| !line.is_empty())
        .map(|line| if line.len() > 100 { 
            format!("{}...", &line[..97]) 
        } else { 
            line.to_string() 
        })
        .unwrap_or_else(|| "Untitled Note".to_string())
}
```

### Global Shortcut Registration
```rust
// File: src-tauri/src/main.rs

shortcut
    .register("Alt+Space", move || {
        let window = app_handle.get_window("capture");
        if let Some(win) = window {
            if !win.is_visible().unwrap() {
                win.show().unwrap();
            }
            win.set_focus().unwrap();
        }
        let _ = app_handle.emit_all("global-shortcut-pressed", "Alt+Space");
    })
    .expect("Failed to register Alt+Space global shortcut");
```

---

## Frontend Components (TypeScript/React)

### Global Keyboard Hook
```typescript
// File: src/shared/hooks/useGlobalKeyboard.ts

export function useGlobalKeyboard() {
  const registeredShortcuts = useRef<Map<string, ShortcutHandler>>(new Map());

  useEffect(() => {
    const unlisten = await listen<string>('global-shortcut-pressed', (event) => {
      const handler = registeredShortcuts.current.get(event.payload);
      if (handler) {
        const syntheticEvent = new KeyboardEvent('keydown', {
          key: ' ', code: 'Space',
          altKey: event.payload.includes('Alt'),
          bubbles: true,
        });
        handler(syntheticEvent);
      }
    });
    return () => unlisten();
  }, []);

  const registerShortcut = useCallback((shortcut: string, handler: ShortcutHandler) => {
    registeredShortcuts.current.set(shortcut, handler);
  }, []);

  return { registerShortcut };
}
```

### Capture Modal Component
```typescript
// File: src/app/components/CaptureModal.tsx

export function CaptureModal({ isOpen, onClose }: CaptureModalProps) {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-expand
  useEffect(() => {
    const lines = content.split('\n').length;
    setIsExpanded(lines > 1 || content.length > 50);
  }, [content]);

  // Handle keys
  const handleKeyDown = useCallback(async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  }, [content]);

  // Save
  const handleSave = useCallback(async () => {
    if (!content.trim() || isSaving) return;
    setIsSaving(true);
    
    const result = await invoke('quick_create_note', { content: content.trim() });
    await addNote(result.title, content.trim());
    
    handleClose();
    setIsSaving(false);
  }, [content, isSaving]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          className={`relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${isExpanded ? 'min-h-[300px]' : 'min-h-[150px]'}`}
          layout
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Capture your thought... (Press Enter to save, Esc to cancel)"
            className="w-full h-full bg-transparent border-none outline-none resize-none text-white placeholder-slate-500 p-6 font-sans text-base leading-relaxed"
            style={{
              height: isExpanded ? 'auto' : '150px',
              transition: 'height 0.2s ease-out',
            }}
          />
          
          {/* Hint bar */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent px-4 py-3 flex justify-between items-center transition-opacity ${content ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
              <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">ENTER</span>
              <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">ESC</span>
            </div>
            <div className="text-[10px] text-slate-500">{content.length} chars</div>
          </div>

          {/* Loading overlay */}
          {isSaving && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-sm text-blue-300 font-medium">Saving...</div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

### Integration in App.tsx
```typescript
// File: src/app/App.tsx

import { CaptureModal } from './components/CaptureModal';
import { useCaptureModal } from '../shared/hooks/useCaptureModal';

export default function App() {
  const { isOpen, closeModal, registerShortcut } = useCaptureModal();

  useEffect(() => {
    registerShortcut();
  }, [registerShortcut]);

  return (
    <BrowserRouter>
      <CaptureModal isOpen={isOpen} onClose={closeModal} />
      {/* ... rest of app */}
    </BrowserRouter>
  );
}
```

---

## Quick Test Commands

```bash
# Backend compilation check
cd src-tauri && cargo check

# Frontend type check
npm run type-check

# Run tests
npm test

# Development mode
npm run tauri:dev

# Production build
npm run tauri:build
```

---

## Performance Checklist

- [ ] Modal opens in <50ms (measure with performance.now())
- [ ] Note creation in <150ms (backend logs)
- [ ] Total flow in <200ms (frontend logs)
- [ ] No memory leaks (check React DevTools)
- [ ] Smooth animations (60fps)
- [ ] Background shortcut works

