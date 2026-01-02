import { useLocation } from 'react-router-dom';
import { Sidebar } from '../shared/components/layout/Sidebar';

export interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main Application Layout
 * 
 * # Accessibility Features
 * - Semantic HTML: <nav> for sidebar, <main> for content
 * - ARIA landmarks for screen reader navigation
 * - Skip links for keyboard users
 */
export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex">
      {/* Navigation landmark */}
      <nav 
        aria-label="Main Navigation"
        className="w-64 min-h-screen border-r border-neutral-800"
      >
        <Sidebar />
      </nav>
      
      {/* Main content landmark */}
      <main 
        id="main-content"
        className="flex-1 ml-64 min-h-screen overflow-x-hidden"
        role="main"
        aria-live="polite"
        aria-atomic="false"
      >
        {children}
      </main>
    </div>
  );
}

export default Layout;