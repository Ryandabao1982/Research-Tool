import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Layout from '../layout';
import { NoteForm } from '../../shared/components/NoteForm';
export function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const handleCreateNote = (title, content) => {
        const newNote = {
            id: crypto.randomUUID(),
            title,
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setNotes(prev => [...prev, newNote]);
    };
    const handleUpdateNote = (note) => {
        const updatedNote = { ...note, updatedAt: new Date() };
        setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n));
        setSelectedNote(null);
    };
    const handleDeleteNote = (id) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        if (selectedNote?.id === id) {
            setSelectedNote(null);
        }
    };
    const handleEditNote = (note) => {
        setSelectedNote(note);
    };
    const handleCancelEdit = () => {
        setSelectedNote(null);
    };
    return (_jsx(Layout, { children: _jsxs("div", { className: "space-y-4 px-6", children: [_jsxs("div", { className: "mb-6 flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Notes" }), _jsx("button", { onClick: () => setSelectedNote({ id: '', title: '', content: '', createdAt: new Date(), updatedAt: new Date() }), className: "bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700", children: "New Note" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: notes.length === 0 ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "No notes yet. Create your first note!" }) })) : (notes.map((note) => (_jsx("div", { className: `border p-4 rounded-lg bg-white shadow cursor-pointer hover:shadow-lg transition-all ${selectedNote?.id === note.id ? 'ring-2 ring-blue-500' : 'hover:border-gray-200'}`, onClick: () => handleEditNote(note), children: _jsxs("div", { className: "p-4", children: [_jsx("h3", { className: "font-semibold text-lg mb-2", children: note.title }), _jsx("p", { className: "text-gray-600 text-sm mb-4", children: note.content }), _jsx("p", { className: "text-xs text-gray-400 mb-2", children: note.createdAt.toLocaleString() })] }) }, note.id)))) }), selectedNote && (_jsx("div", { className: "mt-6", children: _jsx(NoteForm, { note: selectedNote, onSave: handleUpdateNote, onCancel: handleCancelEdit }) }))] }) }));
}
//# sourceMappingURL=NotesPage.js.map