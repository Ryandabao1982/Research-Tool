import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FileText,
  Search,
  Tag,
  Settings,
  Share2,
  LayoutGrid,
  Moon,
  Sun,
  Monitor,
  Zap,
  Command as CommandIcon,
} from "lucide-react";
import { useTheme } from "../shared/theme/ThemeProvider";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  CommandPalette,
  useCommandPalette,
} from "../shared/components/CommandPalette";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { isOpen, toggle, close } = useCommandPalette();

  /**
   * Global keyboard shortcuts for command palette
   * Opens with Cmd/Ctrl + K
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, close, isOpen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans selection:bg-vibe-purple/20 selection:text-vibe-purple">
      {/* Sidebar */}
      <aside className="w-72 glass-dark border-r border-white/5 flex flex-col z-20 transition-all duration-500 ease-in-out">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-vibe-purple to-vibe-blue flex items-center justify-center shadow-lg shadow-vibe-purple/20">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">
                KVB <span className="text-vibe-purple">PRO.</span>
              </h1>
              <div className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase mt-1">
                Neural Interface
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto scrollbar-hidden">
          <NavItem
            to="/notes"
            icon={<FileText size={18} />}
            label="Research Library"
          />
          <NavItem
            to="/search"
            icon={<Search size={18} />}
            label="Neural Search"
          />
          <NavItem to="/tags" icon={<Tag size={18} />} label="Taxonomy" />
          <NavItem
            to="/graph"
            icon={<LayoutGrid size={18} />}
            label="Visualization"
          />
          <NavItem
            to="/import-export"
            icon={<Share2 size={18} />}
            label="Sync & Export"
          />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/20 hover:text-white/60 hover:bg-white/5 rounded-2xl transition-all duration-300"
          >
            {theme === "dark" ? (
              <Moon size={16} />
            ) : theme === "light" ? (
              <Sun size={16} />
            ) : (
              <Monitor size={16} />
            )}
            <span>{theme} Environment</span>
          </button>

          <NavItem
            to="/settings"
            icon={<Settings size={18} />}
            label="System Nucleus"
          />
        </div>

        {/* Keyboard Shortcut Hint */}
        <button
          onClick={toggle}
          className="flex items-center gap-2 w-full px-4 py-3 mt-2 text-xs font-bold uppercase tracking-widest text-white/20 hover:text-white/60 hover:bg-white/5 rounded-2xl transition-all duration-300 group"
        >
          <CommandIcon
            size={14}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="flex-1 text-left">Commands</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px]">
            {/^Mac/i.test(navigator.userAgent) ? "⌘ K" : "Ctrl+K"}
          </kbd>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-[#020202]">
        {/* Global Atmosphere Layers */}
        <div className="absolute inset-0 noise-overlay opacity-[0.02] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-vibe-purple/5 blur-[160px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-vibe-blue/5 blur-[140px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2 opacity-30" />

        {/* Scroll Container with Fade Transitions */}
        <div
          key={location.pathname}
          className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden page-transition"
        >
          {children}
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette isOpen={isOpen} onClose={close} />
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden",
          isActive
            ? "bg-white/[0.07] text-white shadow-atmosphere border border-white/5 active"
            : "text-white/30 hover:text-white/70 hover:bg-white/[0.03]",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "transition-all duration-500 group-hover:scale-110",
              isActive &&
                "text-vibe-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]",
            )}
          >
            {icon}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest">
            {label}
          </span>

          {/* Active Indicator */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-vibe-purple rounded-full shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          )}

          {/* Hover Background Reflection */}
          <div className="absolute inset-0 bg-gradient-to-r from-vibe-purple/0 via-vibe-purple/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </>
      )}
    </NavLink>
  );
}
