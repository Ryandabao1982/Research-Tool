import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './layout'
import HomePage from './pages/index'
import { NotesPage } from './pages/NotesPage'
import DashboardPage from './pages/Dashboard'
import { NeuralBar } from '../features/capture/NeuralBar'
import { AskModal } from '../features/retrieval/AskModal'
import { useState } from 'react'

export default function App() {
  const [isAskOpen, setIsAskOpen] = useState(false);

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
