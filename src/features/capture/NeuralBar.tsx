import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../../shared/stores/notes-store';

export function NeuralBar() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const addNote = useNotesStore((state) => state.addNote);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus logic
    useEffect(() => {
        // Focus input on mount
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            e.preventDefault();
            
            // Create note from query
            try {
                const title = query.split('\n')[0].substring(0, 100) || 'Untitled';
                await addNote(title, query);
                
                // Navigate to notes page
                navigate('/notes');
            } catch (error) {
                console.error('Failed to create note:', error);
            }
        }
    }, [query, addNote, navigate]);

    return (
        <div className="h-full w-full flex items-center justify-center p-2 bg-transparent">
            {/* Rational Grid Container */}
            <div
                className={`
          w-full h-14 bg-white border border-neutral-200
          flex items-center px-4 gap-3 overflow-hidden 
          transition-all duration-300 ease-out
          ${query.length > 0 ? 'border-primary bg-primary/5' : ''}
        `}
                role="search"
                aria-label="Neural capture bar"
            >

                {/* Icon / Leading */}
                <div 
                    className={`transition-colors duration-300 ${query.length > 0 ? 'text-primary' : 'text-neutral-400'}`}
                    aria-hidden="true"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" /></svg>
                </div>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Capture a thought... (Press Enter to save)"
                    aria-label="Capture thought input"
                    className="bg-transparent border-none outline-none text-neutral-900 placeholder-neutral-400 text-lg w-full font-sans font-medium"
                    autoFocus
                />

                {/* Trailing / Actions */}
                <div className="flex items-center gap-2">
                    <div className={`transition-all duration-300 ${query.length > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                        <span className="font-mono text-[10px] bg-primary/10 text-primary px-2 py-1 border border-primary/20" aria-hidden="true">
                            ENTER
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}