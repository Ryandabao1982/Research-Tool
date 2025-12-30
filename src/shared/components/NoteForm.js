import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function NoteForm({ note, onSave, onCancel }) {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            const newNote = {
                id: note?.id || crypto.randomUUID(),
                title: title.trim(),
                content: content.trim(),
                createdAt: note?.createdAt || new Date(),
                updatedAt: new Date(),
            };
            onSave(newNote);
            setTitle('');
            setContent('');
        }
    };
    return (_jsxs("div", { className: "space-y-4 p-4 border rounded-lg bg-white shadow", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Title" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), className: "w-full px-3 py-2 border rounded-md", placeholder: "Enter note title" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Content" }), _jsx("textarea", { value: content, onChange: (e) => setContent(e.target.value), className: "w-full px-3 py-2 border rounded-md", rows: 4, placeholder: "Enter note content" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { type: "submit", onClick: handleSubmit, disabled: !title.trim() || !content.trim(), className: "bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700", children: [note?.id ? 'Update' : 'Create', " Note"] }), _jsx("button", { type: "button", onClick: onCancel, className: "bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700", children: "Cancel" })] })] }));
}
//# sourceMappingURL=NoteForm.js.map