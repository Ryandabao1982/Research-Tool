import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './layout';
import HomePage from './pages/index';
import { NotesPage } from './pages/NotesPage';
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/notes", element: _jsx(NotesPage, {}) })] }) }) }));
}
//# sourceMappingURL=App.js.map