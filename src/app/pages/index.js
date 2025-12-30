import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Layout } from '../layout';
import { NotesPage } from './NotesPage';
export default function HomePage() {
    return (_jsx(Layout, { children: _jsx("div", { className: "space-y-8 px-6", children: _jsxs("div", { className: "bg-white/90 rounded-lg shadow-lg p-8", children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-4", children: "KnowledgeBase Pro" }), _jsx("p", { className: "text-gray-300 text-sm", children: "AI-powered research paper and knowledge management" }), _jsx("div", { className: "mt-8", children: _jsx(NotesPage, {}) })] }) }) }));
}
//# sourceMappingURL=index.js.map