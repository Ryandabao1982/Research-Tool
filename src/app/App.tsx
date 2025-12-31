import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './layout'
import HomePage from './pages/index'
import { NotesPage } from './pages/NotesPage'
import DashboardPage from './pages/Dashboard'
import SettingsPage from './pages/Settings'
import { NeuralBar } from '../features/capture/NeuralBar'
import { AskModal } from '../features/retrieval/AskModal'
import { CommandPalette } from '../features/retrieval/components/CommandPalette'
import { useState, useEffect } from 'react'

import { useRoleStore } from '../shared/stores/role-store'
import { Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

function SubconsciousToast() {
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    const handleInsight = (e: any) => {
      setInsight(e.detail);
      setTimeout(() => setInsight(null), 5000);
    };
    window.addEventListener('subconscious-toast', handleInsight);
    return () => window.removeEventListener('subconscious-toast', handleInsight);
  }, []);

  return (
    <AnimatePresence>
      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-purple-500/30 p-4 rounded-xl shadow-2xl flex items-start gap-3 w-80"
        >
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Subconscious Connection</h4>
            <p className="text-xs text-slate-300 mt-1">{insight}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [isAskOpen, setIsAskOpen] = useState(false);
  const { activeRole } = useRoleStore();

  // Story 3.3: Thematic Visual Shift
  useEffect(() => {
    const root = document.documentElement;
    let color = '#0070f3'; // Manager (Blue)

    if (activeRole === 'coach') color = '#f97316'; // Orange-500
    if (activeRole === 'learner') color = '#10b981'; // Emerald-500

    if (activeRole === 'learner') color = '#10b981'; // Emerald-500

    root.style.setProperty('--brand-primary', color);
  }, [activeRole]);

  // Story 4.3: Subconscious Toasts
  useEffect(() => {
    // Dynamic import to avoid SSR issues if we were using Next.js, but standard React is fine.
    // However, listen needs to be inside useEffect
    let unlisten: () => void;

    async function setupListener() {
      const { listen } = await import('@tauri-apps/api/event');
      const { toast } = await import('sonner'); // Assuming sonner is installed or Use simple alert for MVP if not

      unlisten = await listen<string>('insight-found', (event) => {
        // Simple custom toast or console for MVP if UI lib missing
        console.log("Insight:", event.payload);
        // Dispatch custom event for a Toast component to pick up, or use a library
        // For this demo, let's use a native notification or simple state
        // alert(`🧠 Subconscious Link: ${event.payload}`); // Too intrusive
        // Let's use a simple overlay or assume a Toaster component exists
        const eventDetail = new CustomEvent('subconscious-toast', { detail: event.payload });
        window.dispatchEvent(eventDetail);
      });
    }

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return (
    <BrowserRouter>
      {/* Toast Overlay for Subconscious */}
      <SubconsciousToast />
      <AskModal isOpen={isAskOpen} setIsOpen={setIsAskOpen} />
      <CommandPalette />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/new" element={<NotesPage />} />
        <Route path="/capture" element={<NeuralBar />} />
      </Routes>
    </BrowserRouter>
  )
}
