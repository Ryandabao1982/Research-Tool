import type { Note } from '../types';
interface NoteFormProps {
    note?: Note;
    onSave: (note: Note) => void;
    onCancel: () => void;
}
export declare function NoteForm({ note, onSave, onCancel }: NoteFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=NoteForm.d.ts.map