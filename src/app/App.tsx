import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './layout'
import HomePage from './pages/index'
import { NotesPage } from './pages/NotesPage'
import DashboardPage from './pages/Dashboard'
import { NeuralBar } from '../features/capture/NeuralBar'
import { AskModal } from '../features/retrieval/AskModal'
import { useState, useEffect } from 'react'
import { useRoleStore } from '../shared/stores/role-store'

export default function App() {
  const [isAskOpen, setIsAskOpen] = useState(false);
  const { activeRole } = useRoleStore();

  // Story 3.3: Thematic Visual Shift
  useEffect(() => {
    const root = document.documentElement;
    let color = '#0070f3'; // Manager (Blue)

    if (activeRole === 'coach') color = '#f97316'; // Orange-500
    if (activeRole === 'learner') color = '#10b981'; // Emerald-500

    root.style.setProperty('--brand-primary', color);
  }, [activeRole]);

  return (
    <BrowserRouter>
      <AskModal isOpen={isAskOpen} setIsOpen={setIsAskOpen} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/capture" element={<NeuralBar />} />
      </Routes>
    </BrowserRouter>
  )
}
