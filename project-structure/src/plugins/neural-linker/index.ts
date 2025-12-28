import { Note, Link } from '../../shared/types';

/**
 * Neural Linker Plugin Implementation
 * 
 * Logic:
 * 1. Scans existing notes for titles of other notes.
 * 2. Suggests bidirectional links if a match is found and doesn't already exist.
 */

export interface LinkSuggestion {
    source_id: string;
    target_id: string;
    target_title: string;
    confidence: number;
}

export class NeuralLinker {
    /**
     * Analyze a note's content against a list of all other notes to suggest links.
     */
    static suggestLinks(currentNote: Note, allNotes: Note[]): LinkSuggestion[] {
        const suggestions: LinkSuggestion[] = [];
        const content = currentNote.content.toLowerCase();

        allNotes.forEach(note => {
            if (note.id === currentNote.id) return;

            const titleMatch = note.title.toLowerCase();
            if (titleMatch.length < 3) return; // Skip very short titles

            // Simple regex match for the title in the content
            const regex = new RegExp(`\\b${titleMatch}\\b`, 'gi');
            const matches = currentNote.content.match(regex);

            if (matches && matches.length > 0) {
                // If it's mentioned but likely not already linked (very basic heuristic)
                const isAlreadyLinked = currentNote.content.includes(`[[${note.title}]]`) ||
                    currentNote.content.includes(`(${note.id})`);

                if (!isAlreadyLinked) {
                    suggestions.push({
                        source_id: currentNote.id,
                        target_id: note.id,
                        target_title: note.title,
                        confidence: 0.85
                    });
                }
            }
        });

        return suggestions;
    }
}
