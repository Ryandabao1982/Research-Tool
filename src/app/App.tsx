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
// import { Sparkles } from 'lucide-react' - temporarily using emoji due to import issues
import { AnimatePresence, motion } from 'framer-motion'
import { CaptureModal } from './components/CaptureModal'
import { useCaptureModal } from '../shared/hooks/useCaptureModal'
import { RoleSearchModal } from '../features/search/components/RoleSearchModal'
import { useKeyboardShortcut } from '../shared/hooks/useKeyboardShortcut'

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
          className="fixed bottom-6 right-6 z-50 bg-neutral-950 border border-primary p-4 rounded-none shadow-xl flex items-start gap-3 w-80"
        >
          <div className="p-2 bg-primary/10 border border-primary/20 rounded-none text-primary">
            ✨
          </div>
          <div>
            <h4 className="font-sans text-sm font-bold text-white">Subconscious Connection</h4>
            <p className="font-mono text-xs text-neutral-300 mt-1">{insight}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { activeRole } = useRoleStore();
  const { isOpen, openModal, closeModal, registerShortcut } = useCaptureModal();

  // Story 3.3: Cmd+K Search
  useKeyboardShortcut('k', () => setIsSearchOpen(true), { ctrl: true });

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

  // Story 1.5: Rapid Capture Modal - Register Alt+Space shortcut
  useEffect(() => {
    registerShortcut();
  }, [registerShortcut]);

  return (
    <BrowserRouter>
      {/* Toast Overlay for Subconscious */}
      <SubconsciousToast />
      <AskModal isOpen={isAskOpen} setIsOpen={setIsAskOpen} />
      <CommandPalette />
      
      {/* Story 1.5: Rapid Capture Modal */}
      <CaptureModal isOpen={isOpen} onClose={closeModal} />
      
      {/* Story 3.3: Role-Based Search */}
      <RoleSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Semantic HTML: Main application landmark */}
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/new" element={<NotesPage />} />
        <Route path="/capture" element={<NeuralBar />} />
      </Routes>
    </BrowserRouter>
  )
}
